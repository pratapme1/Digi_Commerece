// ignore_for_file: avoid_web_libraries_in_flutter, deprecated_member_use

import 'dart:async';
import 'dart:html' as html;

import 'demo_window_bridge.dart';

class _ListenerTarget {
  const _ListenerTarget(this.window, this.origin);

  final html.WindowBase window;
  final String origin;
}

class WebDemoWindowBridge implements DemoWindowBridge {
  DemoBridgeHandler? _handler;
  StreamSubscription<html.MessageEvent>? _subscription;
  final Map<String, List<_ListenerTarget>> _listeners = {};

  @override
  void attach(DemoBridgeHandler handler) {
    _handler = handler;
    _subscription ??= html.window.onMessage.listen((event) async {
      final raw = event.data;
      if (raw is! Map) {
        return;
      }

      final data = Map<String, dynamic>.from(raw);
      final type = data['type'];
      if (type is! String || !type.startsWith('digi-demo-')) {
        return;
      }

      final room = data['room'] as String?;
      final source = event.source;
      if (room != null && source is html.WindowBase) {
        final roomListeners = _listeners.putIfAbsent(room, () => []);
        final exists = roomListeners.any((target) => identical(target.window, source));
        if (!exists) {
          roomListeners.add(_ListenerTarget(source, event.origin == 'null' ? '*' : event.origin));
        }
      }

      final result = await _handler?.call(data);
      if (room == null || source is! html.WindowBase || result == null) {
        return;
      }

      source.postMessage(
        {
          'type': 'digi-demo-room-state',
          'room': room,
          'roomState': result,
        },
        event.origin == 'null' ? '*' : event.origin,
      );
    });
  }

  @override
  void broadcastRoomState(String room, Map<String, dynamic>? roomState) {
    final listeners = _listeners[room];
    if (listeners == null) {
      return;
    }

    for (final listener in listeners) {
      listener.window.postMessage(
        {
          'type': 'digi-demo-room-state',
          'room': room,
          'roomState': roomState,
        },
        listener.origin,
      );
    }
  }

  @override
  Future<bool> openUrl(String url) async {
    html.window.open(url, '_blank');
    return true;
  }

  @override
  void dispose() {
    _subscription?.cancel();
    _subscription = null;
    _listeners.clear();
  }
}

DemoWindowBridge createBridge() => WebDemoWindowBridge();
