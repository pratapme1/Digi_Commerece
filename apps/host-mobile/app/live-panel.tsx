import * as Linking from "expo-linking";
import { router } from "expo-router";
import { useEffect } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { hostTheme } from "@digi/design-tokens";
import { formatTimeRemaining, getLiveContentLibrary, type LiveContentItem } from "@digi/domain";

import { AppButton } from "../src/components/app-button";
import { PageShell } from "../src/components/page-shell";
import { useHostApp } from "../src/host-app-context";

function buildAttendeeDemoUrl(input: { qrSlug: string; space: string; mode: string }) {
  if (typeof window === "undefined") {
    return null;
  }

  const url = new URL("/attendee-demo.html", window.location.origin);
  url.searchParams.set("room", input.qrSlug);
  url.searchParams.set("space", input.space);
  url.searchParams.set("mode", input.mode);
  url.searchParams.set("session", "live");
  return url.toString();
}

export default function LivePanelScreen() {
  const { busy, demoMode, endCurrentSession, error, livePanel, pinCurrentItem, refreshLivePanel, setup } = useHostApp();

  const space =
    setup?.spaces.find((item: NonNullable<typeof setup>["spaces"][number]) => item.isDefault) ??
    setup?.spaces[0];
  const contentLibrary = space ? getLiveContentLibrary(space.spaceType) : [];
  const attendeeDemoUrl =
    livePanel && space ? buildAttendeeDemoUrl({ qrSlug: livePanel.qrSlug, space: space.spaceType, mode: space.mode }) : null;

  useEffect(() => {
    void refreshLivePanel();
    const interval = setInterval(() => {
      void refreshLivePanel();
    }, 1200);

    return () => {
      clearInterval(interval);
    };
  // refreshLivePanel is intentionally invoked as a polling side effect for the live panel route
  }, []);

  async function handleEndSession() {
    await endCurrentSession();
    router.replace("/session-summary");
  }

  async function handleOpenAttendeeDemo() {
    if (!attendeeDemoUrl) {
      return;
    }

    await Linking.openURL(attendeeDemoUrl);
  }

  if (!livePanel || !space) {
    return (
      <PageShell
        description="Open a live session before the live panel becomes available."
        eyebrow="M3 Live Panel"
        footer={<AppButton label="Back to dashboard" onPress={() => router.replace("/dashboard")} variant="secondary" />}
        title="No live room"
      >
        <Text style={styles.emptyCopy}>This space is not live yet. Start a session from the dashboard or go-live flow first.</Text>
      </PageShell>
    );
  }

  return (
    <PageShell
      description="Monitor attendee presence, push a featured item, and close the room with a tracked session summary."
      eyebrow={demoMode ? "M3 Live Panel · Demo" : "M3 Live Panel"}
      footer={
        <View style={{ gap: 12 }}>
          {attendeeDemoUrl ? <AppButton label="Open attendee demo" onPress={() => void handleOpenAttendeeDemo()} /> : null}
          <AppButton label="Refresh live panel" onPress={() => void refreshLivePanel()} variant="secondary" />
          <AppButton
            disabled={busy}
            label={busy ? "Ending live session..." : "End live session"}
            onPress={() => void handleEndSession()}
            variant="secondary"
          />
        </View>
      }
      title={space.name}
    >
      <View style={styles.heroCard}>
        <Text style={styles.heroLabel}>Live now</Text>
        <Text style={styles.heroTitle}>{formatTimeRemaining(livePanel.endsAt)}</Text>
        <Text style={styles.heroBody}>
          {livePanel.metrics.attendeeCount} attendees · {livePanel.metrics.totalViews} views · {livePanel.metrics.totalSaves} saves
        </Text>
      </View>

      <View style={styles.metricsRow}>
        <View style={styles.metricCard}>
          <Text style={styles.metricValue}>{livePanel.metrics.attendeeCount}</Text>
          <Text style={styles.metricLabel}>Attendees</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricValue}>{livePanel.metrics.totalViews}</Text>
          <Text style={styles.metricLabel}>Views</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricValue}>{livePanel.metrics.totalSaves}</Text>
          <Text style={styles.metricLabel}>Saves</Text>
        </View>
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionLabel}>Pinned now</Text>
        <Text style={styles.sectionTitle}>{livePanel.pinnedItem?.title ?? "Nothing pinned yet"}</Text>
        <Text style={styles.sectionCopy}>
          {livePanel.pinnedItem?.subtitle ?? "Choose one item to spotlight for everyone in the room."}
        </Text>
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionLabel}>Recent attendees</Text>
        {livePanel.recentAttendees.length ? (
          <View style={styles.attendeeWrap}>
            {livePanel.recentAttendees.map((attendee) => (
              <View key={attendee.attendeeRef} style={styles.attendeeChip}>
                <Text style={styles.attendeeName}>{attendee.attendeeName ?? "Anonymous attendee"}</Text>
                <Text style={styles.attendeeMeta}>
                  Last seen {new Date(attendee.lastSeenAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
                </Text>
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.sectionCopy}>Open the attendee demo to populate presence and activity in this room.</Text>
        )}
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionLabel}>Pin controls</Text>
        <Text style={styles.sectionTitle}>Choose one featured item</Text>
        <View style={styles.contentList}>
          {contentLibrary.map((content) => (
            <PinRow
              key={content.id}
              content={content}
              onPin={pinCurrentItem}
              pinned={livePanel.pinnedItem?.id === content.id}
            />
          ))}
        </View>
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}
    </PageShell>
  );
}

function PinRow({
  content,
  pinned,
  onPin,
}: {
  content: LiveContentItem;
  pinned: boolean;
  onPin: (content: LiveContentItem) => Promise<void>;
}) {
  return (
    <View style={styles.pinRow}>
      <View style={{ flex: 1, gap: 4 }}>
        <Text style={styles.pinTitle}>{content.title}</Text>
        <Text style={styles.pinCopy}>{content.subtitle}</Text>
      </View>
      <Pressable
        accessibilityRole="button"
        onPress={() => void onPin(content)}
        style={({ pressed }) => [
          styles.pinButton,
          pinned ? styles.pinButtonActive : null,
          pressed ? { opacity: 0.82 } : null,
        ]}
      >
        <Text style={[styles.pinButtonLabel, pinned ? styles.pinButtonLabelActive : null]}>
          {pinned ? "Pinned" : "Pin"}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  heroCard: {
    backgroundColor: "rgba(22, 163, 74, 0.16)",
    borderColor: "rgba(22, 163, 74, 0.28)",
    borderRadius: hostTheme.radius.card,
    borderWidth: 1,
    gap: 8,
    padding: hostTheme.spacing.lg,
  },
  heroLabel: {
    color: "#86EFAC",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  heroTitle: {
    color: "#F0FDF4",
    fontSize: 28,
    fontWeight: "700",
  },
  heroBody: {
    color: "#DCFCE7",
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
  sectionTitle: {
    color: hostTheme.colors.ink,
    fontSize: 24,
    fontWeight: "700",
  },
  sectionCopy: {
    color: hostTheme.colors.inkMuted,
    fontSize: 13,
    lineHeight: 19,
  },
  attendeeWrap: {
    gap: 8,
  },
  attendeeChip: {
    backgroundColor: hostTheme.colors.paperMuted,
    borderRadius: 14,
    gap: 2,
    padding: 12,
  },
  attendeeName: {
    color: hostTheme.colors.ink,
    fontSize: 14,
    fontWeight: "700",
  },
  attendeeMeta: {
    color: hostTheme.colors.inkSubtle,
    fontSize: 12,
  },
  contentList: {
    gap: 10,
  },
  pinRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
  },
  pinTitle: {
    color: hostTheme.colors.ink,
    fontSize: 15,
    fontWeight: "700",
  },
  pinCopy: {
    color: hostTheme.colors.inkMuted,
    fontSize: 12,
    lineHeight: 18,
  },
  pinButton: {
    backgroundColor: "rgba(217, 119, 6, 0.12)",
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  pinButtonActive: {
    backgroundColor: hostTheme.colors.ink,
  },
  pinButtonLabel: {
    color: hostTheme.colors.amber,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  pinButtonLabelActive: {
    color: hostTheme.colors.paper,
  },
  emptyCopy: {
    color: "rgba(255,255,255,0.72)",
    fontSize: 14,
    lineHeight: 22,
  },
  error: {
    color: "#FCA5A5",
    fontSize: 13,
  },
});
