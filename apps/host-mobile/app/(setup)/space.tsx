import { router } from "expo-router";
import { Text, View } from "react-native";

import { durationOptions, spaceModeOptions } from "@digi/domain";

import { AppButton } from "../../src/components/app-button";
import { ChoiceChip } from "../../src/components/choice-chip";
import { PageShell } from "../../src/components/page-shell";
import { TextField } from "../../src/components/text-field";
import { useHostApp } from "../../src/host-app-context";

export default function SpaceSetupScreen() {
  const { busy, draft, error, saveCurrentSetup, updateDraft } = useHostApp();

  async function handleSave() {
    await saveCurrentSetup();
    router.replace("/qr");
  }

  return (
    <PageShell
      description="Lock the first permanent QR target, attendee mode, and default session duration before any live controls exist."
      eyebrow="M2 Setup"
      footer={
        <AppButton
          disabled={busy || !draft.spaceName.trim() || !draft.businessName.trim()}
          label={busy ? "Saving setup..." : "Save and generate QR"}
          onPress={() => void handleSave()}
        />
      }
      title="Configure the first space"
    >
      <TextField
        label="Space name"
        onChangeText={(spaceName) => updateDraft({ spaceName })}
        placeholder="Dealer Day"
        value={draft.spaceName}
      />
      <View style={{ gap: 10 }}>
        <Text style={{ color: "rgba(255,255,255,0.76)", fontSize: 13, fontWeight: "600" }}>Attendee mode</Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
          {spaceModeOptions.map((option) => (
            <ChoiceChip
              key={option.value}
              label={option.label}
              onPress={() => updateDraft({ mode: option.value })}
              selected={draft.mode === option.value}
            />
          ))}
        </View>
      </View>
      <View style={{ gap: 10 }}>
        <Text style={{ color: "rgba(255,255,255,0.76)", fontSize: 13, fontWeight: "600" }}>Default session duration</Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
          {durationOptions.map((duration) => (
            <ChoiceChip
              key={duration}
              label={`${duration} min`}
              onPress={() => updateDraft({ defaultSessionDurationMinutes: duration })}
              selected={draft.defaultSessionDurationMinutes === duration}
            />
          ))}
        </View>
      </View>
      <Text style={{ color: "rgba(255,255,255,0.68)", fontSize: 13, lineHeight: 20 }}>
        QR permanence is part of the object model. The slug stays attached to this default space even when sessions start and end.
      </Text>
      {error ? <Text style={{ color: "#FCA5A5", fontSize: 13 }}>{error}</Text> : null}
    </PageShell>
  );
}
