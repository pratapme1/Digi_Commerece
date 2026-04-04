import { router } from "expo-router";
import { useState } from "react";
import { Text, View } from "react-native";

import { AppButton } from "../../src/components/app-button";
import { PageShell } from "../../src/components/page-shell";
import { TextField } from "../../src/components/text-field";
import { useHostApp } from "../../src/host-app-context";

export default function PhoneEntryScreen() {
  const { busy, error, requestOtp, startDemoMode, demoMode } = useHostApp();
  const [phone, setPhone] = useState("+91 ");

  async function handleContinue() {
    await requestOtp(phone);
    router.push({
      pathname: "/(auth)/otp",
      params: { phone },
    });
  }

  async function handleDemo() {
    await startDemoMode();
    router.replace("/");
  }

  return (
    <PageShell
      description="Start with your phone number. M2 keeps the first host identity path narrow so account ownership and QR permanence stay traceable."
      eyebrow="M2 Host"
      footer={
        <View style={{ gap: 12 }}>
          <AppButton
            disabled={busy || phone.trim().length < 8}
            label={busy ? "Sending code..." : "Send verification code"}
            onPress={() => void handleContinue()}
          />
          <AppButton label="Continue with demo workspace" onPress={() => void handleDemo()} variant="secondary" />
        </View>
      }
      title="Create your host account"
    >
      <TextField
        autoCapitalize="none"
        keyboardType="phone-pad"
        label="Phone number"
        onChangeText={setPhone}
        placeholder="+91 98765 43210"
        value={phone}
      />
      <Text style={{ color: "rgba(255,255,255,0.68)", fontSize: 13, lineHeight: 20 }}>
        Use the real OTP flow when your Supabase phone provider is configured. Use demo mode when you need a local working walkthrough without waiting for SMS delivery.
      </Text>
      {demoMode ? (
        <Text style={{ color: "#F8F6F1", fontSize: 12 }}>
          Demo mode is enabled for local development and exported previews.
        </Text>
      ) : null}
      {error ? <Text style={{ color: "#FCA5A5", fontSize: 13 }}>{error}</Text> : null}
    </PageShell>
  );
}
