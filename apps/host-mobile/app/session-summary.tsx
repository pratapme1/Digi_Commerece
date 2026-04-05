import { router } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

import { hostTheme } from "@digi/design-tokens";

import { AppButton } from "../src/components/app-button";
import { PageShell } from "../src/components/page-shell";
import { useHostApp } from "../src/host-app-context";

export default function SessionSummaryScreen() {
  const { sessionSummary } = useHostApp();

  if (!sessionSummary) {
    return (
      <PageShell
        description="A session summary appears after the host ends a live room."
        eyebrow="M3 Summary"
        footer={<AppButton label="Back to dashboard" onPress={() => router.replace("/dashboard")} variant="secondary" />}
        title="No summary yet"
      >
        <Text style={styles.emptyCopy}>End a live room first to generate the session summary.</Text>
      </PageShell>
    );
  }

  return (
    <PageShell
      description="This summary reuses the same event stream as the live panel so post-session metrics stay trustworthy."
      eyebrow="M3 Summary"
      footer={<AppButton label="Back to dashboard" onPress={() => router.replace("/dashboard")} variant="secondary" />}
      title="Session summary"
    >
      <View style={styles.heroCard}>
        <Text style={styles.heroValue}>{sessionSummary.attendeeCount} attendees</Text>
        <Text style={styles.heroCopy}>
          {sessionSummary.totalViews} views · {sessionSummary.totalSaves} saves · save rate {sessionSummary.saveRate}
        </Text>
      </View>

      <View style={styles.metricsRow}>
        <View style={styles.metricCard}>
          <Text style={styles.metricValue}>{sessionSummary.totalViews}</Text>
          <Text style={styles.metricLabel}>Content views</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricValue}>{sessionSummary.totalSaves}</Text>
          <Text style={styles.metricLabel}>Saves</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricValue}>{sessionSummary.peakAttendeeCount}</Text>
          <Text style={styles.metricLabel}>Peak live</Text>
        </View>
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionLabel}>Top content</Text>
        {sessionSummary.topContent.length ? (
          sessionSummary.topContent.map((item) => (
            <View key={item.contentId} style={styles.topContentRow}>
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={styles.topContentTitle}>{item.title}</Text>
                <Text style={styles.topContentMeta}>
                  {item.views} views · {item.saves} saves
                </Text>
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.sectionCopy}>No standout item yet. Open the attendee demo and interact with the room to populate content metrics.</Text>
        )}
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionLabel}>Shareable summary</Text>
        <Text style={styles.sectionCopy}>{sessionSummary.shareText}</Text>
      </View>
    </PageShell>
  );
}

const styles = StyleSheet.create({
  heroCard: {
    backgroundColor: hostTheme.colors.paper,
    borderRadius: hostTheme.radius.card,
    gap: 8,
    padding: hostTheme.spacing.lg,
  },
  heroValue: {
    color: hostTheme.colors.ink,
    fontSize: 28,
    fontWeight: "700",
  },
  heroCopy: {
    color: hostTheme.colors.inkMuted,
    fontSize: 14,
    lineHeight: 21,
  },
  metricsRow: {
    flexDirection: "row",
    gap: 10,
  },
  metricCard: {
    backgroundColor: hostTheme.colors.paper,
    borderRadius: hostTheme.radius.card,
    flex: 1,
    gap: 4,
    padding: hostTheme.spacing.md,
  },
  metricValue: {
    color: hostTheme.colors.ink,
    fontSize: 28,
    fontWeight: "700",
  },
  metricLabel: {
    color: hostTheme.colors.inkSubtle,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  sectionCard: {
    backgroundColor: hostTheme.colors.paper,
    borderRadius: hostTheme.radius.card,
    gap: 10,
    padding: hostTheme.spacing.md,
  },
  sectionLabel: {
    color: hostTheme.colors.inkSubtle,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  sectionCopy: {
    color: hostTheme.colors.inkMuted,
    fontSize: 13,
    lineHeight: 19,
  },
  topContentRow: {
    paddingVertical: 4,
  },
  topContentTitle: {
    color: hostTheme.colors.ink,
    fontSize: 14,
    fontWeight: "700",
  },
  topContentMeta: {
    color: hostTheme.colors.inkSubtle,
    fontSize: 12,
  },
  emptyCopy: {
    color: "rgba(255,255,255,0.72)",
    fontSize: 14,
    lineHeight: 22,
  },
});
