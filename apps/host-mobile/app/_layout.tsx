import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { HostAppProvider } from "../src/host-app-context";

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <HostAppProvider>
          <StatusBar style="light" />
          <Stack screenOptions={{ headerShown: false }} />
        </HostAppProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
