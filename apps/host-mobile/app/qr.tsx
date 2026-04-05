import { router } from "expo-router";
import { useRef, useState } from "react";
import { Share, StyleSheet, Text, View } from "react-native";

import { getPrimaryHostSpace } from "@digi/domain";
import * as Clipboard from "expo-clipboard";
import QRCode from "react-native-qrcode-svg";

import { hostTheme } from "@digi/design-tokens";

import { AppButton } from "../src/components/app-button";
import { PageShell } from "../src/components/page-shell";
import { useHostApp } from "../src/host-app-context";
import { buildHostAttendeeUrl } from "../src/lib/attendee-link";
import { hostAppConfig } from "../src/lib/config";

export default function QrScreen() {
  const { demoMode, livePanel, setup } = useHostApp();
  const [message, setMessage] = useState<string | null>(null);
  const qrRef = useRef<QRCode>(null);

  const space = getPrimaryHostSpace(setup);
  const attendeeUrl = space
    ? buildHostAttendeeUrl({
        attendeeCount: livePanel?.metrics.attendeeCount,
        baseUrl: hostAppConfig.attendeeBaseUrl,
        brandName: setup?.brandProfiles[0]?.name,
        demoMode,
        mode: space.mode,
        pinnedItem: livePanel?.pinnedItem,
        qrSlug: space.qrSlug,
        spaceName: space.name,
        spaceType: space.spaceType,
        status: livePanel?.status ?? setup?.liveSession?.status ?? "inactive",
      })
    : "";

  async function handleCopy() {
    await Clipboard.setStringAsync(attendeeUrl);
    setMessage("Attendee link copied.");
  }

  async function handleShareQr() {
    if (!attendeeUrl || !qrRef.current) {
      return;
    }

    await Share.share({
      message: attendeeUrl,
      title: `${space?.name ?? "Digi space"} attendee link`,
    });
    setMessage("Attendee link shared.");
  }

  return (
    <PageShell
      description="The QR target is permanent at the space level. This screen gives the host the first real share surface before live controls become richer."
      eyebrow="M2 Host"
      footer={
        <View style={{ gap: 12 }}>
          <AppButton label="Copy attendee link" onPress={() => void handleCopy()} />
          <AppButton label="Open dashboard" onPress={() => router.replace("/dashboard")} variant="secondary" />
          <AppButton label="Share attendee link" onPress={() => void handleShareQr()} variant="secondary" />
        </View>
      }
      title="Space QR"
    >
      {space ? (
        <View style={styles.card}>
          <View style={styles.qrWrap}>
            <QRCode
              getRef={(ref) => {
                qrRef.current = ref;
              }}
              size={200}
              value={attendeeUrl}
            />
          </View>
          <Text style={styles.title}>{space.name}</Text>
          <Text style={styles.slug}>{space.qrSlug}</Text>
          <Text style={styles.url}>{attendeeUrl}</Text>
        </View>
      ) : (
        <Text style={{ color: "#FCA5A5", fontSize: 13 }}>Finish setup before opening the QR screen.</Text>
      )}
      {message ? <Text style={{ color: "#BBF7D0", fontSize: 13 }}>{message}</Text> : null}
    </PageShell>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: "center",
    backgroundColor: hostTheme.colors.paper,
    borderRadius: hostTheme.radius.card,
    gap: 12,
    padding: hostTheme.spacing.lg,
  },
  qrWrap: {
    backgroundColor: "#ffffff",
    borderRadius: 24,
    padding: 18,
  },
  title: {
    color: hostTheme.colors.ink,
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
  },
  slug: {
    color: hostTheme.colors.inkMuted,
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 1.1,
    textTransform: "uppercase",
  },
  url: {
    color: hostTheme.colors.inkSubtle,
    fontSize: 13,
    lineHeight: 19,
    textAlign: "center",
  },
});
