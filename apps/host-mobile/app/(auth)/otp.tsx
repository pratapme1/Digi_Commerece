import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Text } from "react-native";

import { AppButton } from "../../src/components/app-button";
import { PageShell } from "../../src/components/page-shell";
import { TextField } from "../../src/components/text-field";
import { useHostApp } from "../../src/host-app-context";

export default function OtpVerificationScreen() {
  const params = useLocalSearchParams<{ phone?: string }>();
  const { busy, error, verifyOtp } = useHostApp();
  const [code, setCode] = useState("");

  async function handleVerify() {
    await verifyOtp(params.phone ?? "", code);
    router.replace("/");
  }

  return (
    <PageShell
      description={`Enter the six-digit code sent to ${params.phone ?? "your phone number"}.`}
      eyebrow="M2 Host"
      footer={
        <AppButton
          disabled={busy || code.trim().length < 6}
          label={busy ? "Verifying..." : "Verify and continue"}
          onPress={() => void handleVerify()}
        />
      }
      title="Verify your number"
    >
      <TextField
        autoCapitalize="none"
        keyboardType="numeric"
        label="One-time code"
        onChangeText={setCode}
        placeholder="123456"
        value={code}
      />
      <Text style={{ color: "rgba(255,255,255,0.68)", fontSize: 13, lineHeight: 20 }}>
        The first implementation pass keeps identity narrow: one verified phone number becomes the initial account owner.
      </Text>
      {error ? <Text style={{ color: "#FCA5A5", fontSize: 13 }}>{error}</Text> : null}
    </PageShell>
  );
}
