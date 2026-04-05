import 'dart:async';

import 'demo_window_bridge_stub.dart'
    if (dart.library.html) 'demo_window_bridge_web.dart';

typedef DemoBridgeHandler = FutureOr<Map<String, dynamic>?> Function(Map<String, dynamic> message);

abstract class DemoWindowBridge {
  void attach(DemoBridgeHandler handler);

  void broadcastRoomState(String room, Map<String, dynamic>? roomState);

  Future<bool> openUrl(String url);

  void dispose();
}

DemoWindowBridge createDemoWindowBridge() => createBridge();
