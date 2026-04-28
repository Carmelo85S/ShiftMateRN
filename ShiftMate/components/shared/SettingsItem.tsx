import React from "react";
import { View, Text, StyleSheet, Pressable, Switch } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface SettingItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  theme: any;
  type?: "switch" | "link";
  value?: boolean;
  onPress?: () => void;
  onValueChange?: (val: boolean) => void;
}

export const SettingItem = ({ icon, label, theme, type = "link", value, onPress, onValueChange }: SettingItemProps) => {
  const isSwitch = type === "switch";

  return (
    <Pressable 
      onPress={!isSwitch ? onPress : undefined}
      style={({ pressed }) => [
        styles.row, 
        { borderBottomColor: theme.border, opacity: (pressed && !isSwitch) ? 0.6 : 1 }
      ]}
    >
      <View style={styles.rowLeft}>
        <View style={[styles.iconBox, { backgroundColor: theme.card }]}>
          <Ionicons name={icon} size={20} color={theme.text} />
        </View>
        <Text style={[styles.rowLabel, { color: theme.text }]}>{label}</Text>
      </View>

      {isSwitch ? (
        <Switch 
          value={value} 
          onValueChange={onValueChange}
          trackColor={{ false: "#E5E7EB", true: theme.text }}
          thumbColor="#FFF"
          ios_backgroundColor="#E5E7EB"
        />
      ) : (
        <Ionicons name="chevron-forward" size={18} color={theme.border} />
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 16, borderBottomWidth: 1 },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  iconBox: { width: 38, height: 38, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  rowLabel: { fontSize: 16, fontWeight: "700" },
});