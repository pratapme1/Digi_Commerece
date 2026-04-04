import { Pressable, StyleSheet, Text } from "react-native";

import { hostTheme } from "@digi/design-tokens";

interface AppButtonProps {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: "primary" | "secondary";
}

export function AppButton({ label, onPress, disabled, variant = "primary" }: AppButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        variant === "secondary" && styles.secondaryButton,
        disabled && styles.disabledButton,
        pressed && !disabled ? styles.pressedButton : null,
      ]}
    >
      <Text style={[styles.label, variant === "secondary" && styles.secondaryLabel]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    backgroundColor: hostTheme.colors.live,
    borderRadius: hostTheme.radius.button,
    paddingHorizontal: hostTheme.spacing.md,
    paddingVertical: 16,
  },
  secondaryButton: {
    backgroundColor: hostTheme.colors.paperMuted,
  },
  disabledButton: {
    opacity: 0.45,
  },
  pressedButton: {
    transform: [{ scale: 0.99 }],
  },
  label: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "700",
  },
  secondaryLabel: {
    color: hostTheme.colors.ink,
  },
});
