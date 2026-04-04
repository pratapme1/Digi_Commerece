import { StyleSheet, Text, View } from "react-native";

import { hostTheme } from "@digi/design-tokens";

interface PreviewCardProps {
  businessName: string;
  brandName: string;
  spaceName: string;
  primaryColor: string;
  secondaryColor: string;
}

export function PreviewCard({
  businessName,
  brandName,
  spaceName,
  primaryColor,
  secondaryColor,
}: PreviewCardProps) {
  return (
    <View style={styles.card}>
      <View style={[styles.preview, { backgroundColor: secondaryColor }]}>
        <View style={[styles.badge, { backgroundColor: primaryColor }]} />
        <Text style={styles.brandLabel}>{brandName || "Primary Brand"}</Text>
        <Text style={styles.businessName}>{businessName || "Business name"}</Text>
        <Text style={styles.spaceName}>{spaceName || "Space name"}</Text>
      </View>
      <Text style={styles.note}>This preview matches the M2 host setup flow, not the final attendee rendering.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: hostTheme.colors.paper,
    borderRadius: hostTheme.radius.card,
    gap: 12,
    padding: hostTheme.spacing.md,
  },
  preview: {
    borderRadius: 16,
    gap: 10,
    minHeight: 180,
    padding: 18,
  },
  badge: {
    borderRadius: 999,
    height: 8,
    width: 44,
  },
  brandLabel: {
    color: hostTheme.colors.inkSubtle,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  businessName: {
    color: hostTheme.colors.ink,
    fontSize: 24,
    fontWeight: "700",
    lineHeight: 28,
  },
  spaceName: {
    color: hostTheme.colors.inkMuted,
    fontSize: 14,
    fontWeight: "600",
  },
  note: {
    color: hostTheme.colors.inkSubtle,
    fontSize: 12,
    lineHeight: 18,
  },
});
