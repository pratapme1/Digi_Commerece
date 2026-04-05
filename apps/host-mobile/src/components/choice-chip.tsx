import { Pressable, StyleSheet, Text } from "react-native";

import { hostTheme } from "@digi/design-tokens";

interface ChoiceChipProps {
  label: string;
  selected: boolean;
  onPress: () => void;
}

export function ChoiceChip({ label, selected, onPress }: ChoiceChipProps) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={[styles.chip, selected && styles.selectedChip]}
    >
      <Text style={[styles.label, selected && styles.selectedLabel]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    backgroundColor: hostTheme.colors.paperMuted,
    borderColor: hostTheme.colors.line,
    borderRadius: hostTheme.radius.chip,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  selectedChip: {
    backgroundColor: hostTheme.colors.ink,
    borderColor: hostTheme.colors.ink,
  },
  label: {
    color: hostTheme.colors.inkMuted,
    fontSize: 13,
    fontWeight: "600",
  },
  selectedLabel: {
    color: hostTheme.colors.paper,
  },
});
