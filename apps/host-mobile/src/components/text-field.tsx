import { StyleSheet, Text, TextInput, View } from "react-native";

import { hostTheme } from "@digi/design-tokens";

interface TextFieldProps {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  keyboardType?: "default" | "phone-pad" | "numeric";
  autoCapitalize?: "none" | "sentences" | "words";
  secureTextEntry?: boolean;
}

export function TextField({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = "default",
  autoCapitalize = "sentences",
  secureTextEntry = false,
}: TextFieldProps) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        autoCapitalize={autoCapitalize}
        keyboardType={keyboardType}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={hostTheme.colors.inkSubtle}
        secureTextEntry={secureTextEntry}
        style={styles.input}
        value={value}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    gap: 8,
  },
  label: {
    color: "rgba(255,255,255,0.76)",
    fontSize: 13,
    fontWeight: "600",
  },
  input: {
    backgroundColor: hostTheme.colors.paper,
    borderRadius: 16,
    color: hostTheme.colors.ink,
    fontSize: 15,
    paddingHorizontal: 16,
    paddingVertical: 15,
  },
});
