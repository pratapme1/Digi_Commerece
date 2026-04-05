import { router } from "expo-router";
import { Text, View } from "react-native";

import { hostFontOptions } from "@digi/domain";

import { AppButton } from "../../src/components/app-button";
import { ChoiceChip } from "../../src/components/choice-chip";
import { PageShell } from "../../src/components/page-shell";
import { PreviewCard } from "../../src/components/preview-card";
import { TextField } from "../../src/components/text-field";
import { useHostApp } from "../../src/host-app-context";

const colorPresets = ["#1A1714", "#2563EB", "#7C2D12", "#166534", "#7C3AED"];
const paperPresets = ["#F8F6F1", "#F6F1EB", "#FFF7ED", "#F0FDF4", "#F5F3FF"];

export default function BrandSetupScreen() {
  const { draft, updateDraft } = useHostApp();

  return (
    <PageShell
      description="Choose the first brand treatment that will carry into the QR space, entry state, and go-live preview."
      eyebrow="M2 Setup"
      footer={
        <AppButton
          disabled={!draft.brandName.trim() && !draft.businessName.trim()}
          label="Continue to space settings"
          onPress={() => router.push("/(setup)/space")}
        />
      }
      title="Shape the brand"
    >
      <TextField
        label="Brand label"
        onChangeText={(brandName) => updateDraft({ brandName })}
        placeholder="Primary Brand"
        value={draft.brandName}
      />
      <View style={{ gap: 10 }}>
        <Text style={{ color: "rgba(255,255,255,0.76)", fontSize: 13, fontWeight: "600" }}>Primary colour</Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
          {colorPresets.map((color) => (
            <ChoiceChip
              key={color}
              label={color}
              onPress={() => updateDraft({ primaryColor: color })}
              selected={draft.primaryColor === color}
            />
          ))}
        </View>
      </View>
      <View style={{ gap: 10 }}>
        <Text style={{ color: "rgba(255,255,255,0.76)", fontSize: 13, fontWeight: "600" }}>Paper tone</Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
          {paperPresets.map((color) => (
            <ChoiceChip
              key={color}
              label={color}
              onPress={() => updateDraft({ secondaryColor: color })}
              selected={draft.secondaryColor === color}
            />
          ))}
        </View>
      </View>
      <View style={{ gap: 10 }}>
        <Text style={{ color: "rgba(255,255,255,0.76)", fontSize: 13, fontWeight: "600" }}>Display font intent</Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
          {hostFontOptions.map((font) => (
            <ChoiceChip
              key={font}
              label={font}
              onPress={() => updateDraft({ fontFamily: font })}
              selected={draft.fontFamily === font}
            />
          ))}
        </View>
      </View>
      <PreviewCard
        brandName={draft.brandName}
        businessName={draft.businessName}
        primaryColor={draft.primaryColor}
        secondaryColor={draft.secondaryColor}
        spaceName={draft.spaceName}
      />
    </PageShell>
  );
}
