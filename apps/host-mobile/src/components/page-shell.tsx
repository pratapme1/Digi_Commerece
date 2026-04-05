import type { PropsWithChildren, ReactNode } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { hostTheme } from "@digi/design-tokens";

interface PageShellProps extends PropsWithChildren {
  eyebrow: string;
  title: string;
  description: string;
  footer?: ReactNode;
}

export function PageShell({ eyebrow, title, description, footer, children }: PageShellProps) {
  return (
    <SafeAreaView edges={["top", "bottom"]} style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>{eyebrow}</Text>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.description}>{description}</Text>
        </View>
        <View style={styles.body}>{children}</View>
      </ScrollView>
      {footer ? <View style={styles.footer}>{footer}</View> : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: hostTheme.colors.page,
    flex: 1,
  },
  scrollContent: {
    padding: hostTheme.spacing.lg,
  },
  header: {
    marginBottom: hostTheme.spacing.xl,
  },
  eyebrow: {
    color: "rgba(255,255,255,0.48)",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.6,
    marginBottom: 12,
    textTransform: "uppercase",
  },
  title: {
    color: hostTheme.colors.paper,
    fontSize: 34,
    fontWeight: "700",
    letterSpacing: -1,
    marginBottom: 10,
  },
  description: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 15,
    lineHeight: 22,
  },
  body: {
    gap: hostTheme.spacing.md,
  },
  footer: {
    backgroundColor: hostTheme.colors.page,
    padding: hostTheme.spacing.lg,
    paddingTop: hostTheme.spacing.sm,
  },
});
