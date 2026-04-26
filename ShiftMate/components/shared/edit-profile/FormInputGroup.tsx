import React from "react";
import { View, TextInput, StyleSheet, ViewStyle, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface FormInputProps {
  theme: any;
  value: string;
  onChangeText: (val: string) => void;
  placeholder: string;
  icon?: keyof typeof Ionicons.glyphMap;
  isLast?: boolean;
}

export const FormInputGroup = ({ children, theme, style }: { children: React.ReactNode, theme: any, style?: ViewStyle }) => (
  <View style={[styles.inputGroup, { backgroundColor: theme.card, borderColor: theme.border }, style]}>
    {children}
  </View>
);

export const FormInputRow = ({ icon, value, onChangeText, placeholder, theme, isLast = false }: FormInputProps) => (
  <>
    <View style={styles.inputRow}>
      {icon && <Ionicons name={icon} size={20} color={theme.tint} />}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.secondaryText}
        style={[styles.field, { color: theme.text }]}
      />
    </View>
    {!isLast && <View style={[styles.divider, { backgroundColor: theme.border }]} />}
  </>
);

export const FormTextArea = ({ value, onChangeText, placeholder, theme }: FormInputProps) => (
  <View style={[styles.bioWrapper, { backgroundColor: theme.card, borderColor: theme.border }]}>
    <TextInput
      value={value}
      onChangeText={onChangeText}
      multiline
      maxLength={200}
      placeholder={placeholder}
      placeholderTextColor={theme.secondaryText}
      style={[styles.bioField, { color: theme.text }]}
    />
  </View>
);

const styles = StyleSheet.create({
  inputGroup: { borderRadius: 24, paddingHorizontal: 20, borderWidth: 1 },
  inputRow: { flexDirection: 'row', alignItems: 'center', height: 60, gap: 14 },
  field: { flex: 1, fontSize: 16, fontWeight: "600" },
  divider: { height: 1, width: '100%'}, 
  bioWrapper: { borderRadius: 24, padding: 20, minHeight: 120, borderWidth: 1 },
  bioField: { fontSize: 16, fontWeight: "500", lineHeight: 24, textAlignVertical: "top" },
});