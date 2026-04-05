import { Redirect } from "expo-router";
import { ActivityIndicator, View } from "react-native";

import { resolveHostRoute } from "@digi/domain";

import { PageShell } from "../src/components/page-shell";
import { useHostApp } from "../src/host-app-context";

export default function IndexScreen() {
  const { ready, setup, authenticated } = useHostApp();

  if (!ready) {
    return (
      <PageShell
        description="Loading the current host session and setup state."
        eyebrow="M2 Host"
        title="Preparing your space"
      >
        <View style={{ alignItems: "center", paddingTop: 40 }}>
          <ActivityIndicator color="#F8F6F1" size="large" />
        </View>
      </PageShell>
    );
  }

  return <Redirect href={resolveHostRoute(authenticated, setup)} />;
}
