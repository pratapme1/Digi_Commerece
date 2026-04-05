import 'demo_window_bridge.dart';

class StubDemoWindowBridge implements DemoWindowBridge {
  @override
  void attach(DemoBridgeHandler handler) {}

  @override
  void broadcastRoomState(String room, Map<String, dynamic>? roomState) {}

  @override
  Future<bool> openUrl(String url) async => false;

  @override
  void dispose() {}
}

DemoWindowBridge createBridge() => StubDemoWindowBridge();
