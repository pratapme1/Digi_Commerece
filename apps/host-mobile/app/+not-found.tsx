import { router } from "expo-router";
import { Text, View } from "react-native";

import { AppButton } from "../src/components/app-button";
import { PageShell } from "../src/components/page-shell";

export default function NotFoundScreen() {
  return (
    <PageShell
      description="This route is outside the M2 flow. Return to the host workspace and continue from the approved journey."
      eyebrow="M2 Host"
      footer={<AppButton label="Back To Host Flow" onPress={() => router.replace("/")} />}
      title="Route not found"
    >
      <View>
        <Text style={{ color: "rgba(255,255,255,0.68)" }}>
          The current milestone only supports onboarding, setup, QR, and first go-live.
        </Text>
      </View>
    </PageShell>
  );
}
