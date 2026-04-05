import { router } from "expo-router";
import { Text, View } from "react-native";

import { spaceTypeOptions } from "@digi/domain";

import { AppButton } from "../../src/components/app-button";
import { ChoiceChip } from "../../src/components/choice-chip";
import { PageShell } from "../../src/components/page-shell";
import { TextField } from "../../src/components/text-field";
import { useHostApp } from "../../src/host-app-context";

export default function AccountSetupScreen() {
  const { draft, error, updateDraft } = useHostApp();

  return (
    <PageShell
      description="Set the account and first space intent. M2 keeps one default space so later live-control work has a stable foundation."
      eyebrow="M2 Setup"
      footer={
        <AppButton
          disabled={!draft.businessName.trim()}
          label="Continue to brand setup"
          onPress={() => router.push("/(setup)/brand")}
        />
      }
      title="Name the business"
    >
      <TextField
        label="Business name"
        onChangeText={(businessName) => updateDraft({ businessName })}
        placeholder="Vega Auto"
        value={draft.businessName}
      />
      <View style={{ gap: 10 }}>
        <Text style={{ color: "rgba(255,255,255,0.76)", fontSize: 13, fontWeight: "600" }}>Primary space type</Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
          {spaceTypeOptions.map((option) => (
            <ChoiceChip
              key={option.value}
              label={option.label}
              onPress={() => updateDraft({ spaceType: option.value })}
              selected={draft.spaceType === option.value}
            />
          ))}
        </View>
      </View>
      {error ? <Text style={{ color: "#FCA5A5", fontSize: 13 }}>{error}</Text> : null}
    </PageShell>
  );
}
