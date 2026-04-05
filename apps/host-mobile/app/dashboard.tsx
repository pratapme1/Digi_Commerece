import { router } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

import { hostTheme } from "@digi/design-tokens";
import { formatTimeRemaining } from "@digi/domain";

import { AppButton } from "../src/components/app-button";
import { PageShell } from "../src/components/page-shell";
import { useHostApp } from "../src/host-app-context";

export default function DashboardScreen() {
  const { demoMode, error, livePanel, sessionSummary, setup, signOut } = useHostApp();

  const account = setup?.account;
  const space =
    setup?.spaces.find((item: NonNullable<typeof setup>["spaces"][number]) => item.isDefault) ??
    setup?.spaces[0];
  const liveSession = livePanel ?? setup?.liveSession;

  return (
    <PageShell
      description="This is the first real host dashboard slice: one account, one default space, one QR, and one go-live path."
      eyebrow={demoMode ? "M2 Dashboard · Demo" : "M2 Dashboard"}
      footer={
        <View style={{ gap: 12 }}>
          <AppButton label="Show QR" onPress={() => router.push("/qr")} />
          {livePanel ? (
            <AppButton label="Open live panel" onPress={() => router.push("/live-panel")} variant="secondary" />
          ) : (
            <AppButton label="Go Live" onPress={() => router.push("/go-live")} variant="secondary" />
          )}
          {sessionSummary ? (
            <AppButton label="View last summary" onPress={() => router.push("/session-summary")} variant="secondary" />
          ) : null}
          <AppButton label="Sign out" onPress={() => void signOut()} variant="secondary" />
        </View>
      }
      title={account?.businessName ?? "Host dashboard"}
    >
      <View style={styles.card}>
        <Text style={styles.cardEyebrow}>Verification</Text>
        <Text style={styles.cardTitle}>
          {account?.verificationTier === "business_verified" ? "Business verified" : "Phone verified"}
        </Text>
        <Text style={styles.cardBody}>Primary phone: {account?.primaryPhone ?? "Pending real OTP session"}</Text>
      </View>

      {space ? (
        <View style={styles.card}>
          <Text style={styles.cardEyebrow}>Default space</Text>
          <Text style={styles.cardTitle}>{space.name}</Text>
          <Text style={styles.cardBody}>
            {space.spaceType} · {space.mode} · {space.defaultSessionDurationMinutes} min
          </Text>
          <Text style={styles.cardBody}>QR slug: {space.qrSlug}</Text>
        </View>
      ) : null}

      {liveSession ? (
        <View style={styles.liveCard}>
          <Text style={styles.liveLabel}>Live session active</Text>
          <Text style={styles.liveTitle}>
            {"endsAt" in liveSession ? formatTimeRemaining(liveSession.endsAt ?? null) : "Live now"}
          </Text>
          <Text style={styles.liveBody}>
            {"metrics" in liveSession
              ? `${liveSession.metrics.attendeeCount} attendees · ${liveSession.metrics.totalViews} views · ${liveSession.metrics.totalSaves} saves`
              : "Open the live panel to start running the room."}
          </Text>
        </View>
      ) : (
        <View style={styles.card}>
          <Text style={styles.cardEyebrow}>Next action</Text>
          <Text style={styles.cardTitle}>Start the first live room</Text>
          <Text style={styles.cardBody}>Use the go-live screen to create the first canonical `live` session in schema `Digi`.</Text>
        </View>
      )}

      {error ? <Text style={{ color: "#FCA5A5", fontSize: 13 }}>{error}</Text> : null}
    </PageShell>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: hostTheme.colors.paper,
    borderRadius: hostTheme.radius.card,
    gap: 8,
    padding: hostTheme.spacing.md,
  },
  cardEyebrow: {
    color: hostTheme.colors.inkSubtle,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.1,
    textTransform: "uppercase",
  },
  cardTitle: {
    color: hostTheme.colors.ink,
    fontSize: 22,
    fontWeight: "700",
  },
  cardBody: {
    color: hostTheme.colors.inkMuted,
    fontSize: 13,
    lineHeight: 19,
  },
  liveCard: {
    backgroundColor: "rgba(22, 163, 74, 0.16)",
    borderColor: "rgba(22, 163, 74, 0.28)",
    borderRadius: hostTheme.radius.card,
    borderWidth: 1,
    gap: 8,
    padding: hostTheme.spacing.md,
  },
  liveLabel: {
    color: "#86EFAC",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.1,
    textTransform: "uppercase",
  },
  liveTitle: {
    color: "#DCFCE7",
    fontSize: 22,
    fontWeight: "700",
  },
  liveBody: {
    color: "#BBF7D0",
    fontSize: 13,
    lineHeight: 19,
  },
});
