import { router } from "expo-router";
import { useState } from "react";
import { Text, View } from "react-native";

import { durationOptions, getPrimaryHostSpace } from "@digi/domain";

import { AppButton } from "../src/components/app-button";
import { ChoiceChip } from "../src/components/choice-chip";
import { PageShell } from "../src/components/page-shell";
import { useHostApp } from "../src/host-app-context";

export default function GoLiveScreen() {
  const { busy, error, goLiveNow, setup } = useHostApp();
  const defaultDuration = getPrimaryHostSpace(setup)?.defaultSessionDurationMinutes ?? 60;
  const [duration, setDuration] = useState(defaultDuration);

  async function handleGoLive() {
    await goLiveNow(duration);
    router.replace("/live-panel");
  }

  return (
    <PageShell
      description="This is the first canonical session creation flow. It should create one `live` session, respect the default duration, and leave richer controls for the next milestone."
      eyebrow="M2 Host"
      footer={
        <AppButton
          disabled={busy || !setup?.spaces.length}
          label={busy ? "Starting live session..." : "Confirm and go live"}
          onPress={() => void handleGoLive()}
        />
      }
      title="Go live"
    >
      <View style={{ gap: 10 }}>
        <Text style={{ color: "rgba(255,255,255,0.76)", fontSize: 13, fontWeight: "600" }}>Live duration</Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
          {durationOptions.map((option) => (
            <ChoiceChip
              key={option}
              label={`${option} min`}
              onPress={() => setDuration(option)}
              selected={duration === option}
            />
          ))}
        </View>
      </View>
      <Text style={{ color: "rgba(255,255,255,0.68)", fontSize: 13, lineHeight: 20 }}>
        `M2` only creates the session and exposes the attendee URL. Presence, pinning, and live summary stay in `M3`.
      </Text>
      {error ? <Text style={{ color: "#FCA5A5", fontSize: 13 }}>{error}</Text> : null}
    </PageShell>
  );
}
