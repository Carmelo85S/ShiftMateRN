import React from "react";
import { Pressable, View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ComponentProps } from "react";

interface MenuButtonProps {
  icon: ComponentProps<typeof Ionicons>['name'];
  label: string;
  onPress: () => void;
  theme: {
    text: string;
    border: string;
  };
  isDelete?: boolean;
}

export const MenuButton = ({ icon, label, onPress, theme, isDelete }: MenuButtonProps) => (
  <Pressable
    onPress={onPress}
    style={({ pressed }) => [
      styles.menuBtn,
      { borderBottomColor: theme.border, opacity: pressed ? 0.6 : 1 },
    ]}
  >
    <View style={styles.menuLeft}>
      <Ionicons
        name={icon}
        size={22}
        color={isDelete ? "#FF3B30" : theme.text}
      />
      <Text
        style={[
          styles.menuLabel,
          { color: isDelete ? "#FF3B30" : theme.text },
        ]}
      >
        {label}
      </Text>
    </View>
    <Ionicons name="chevron-forward" size={18} color={theme.border} />
  </Pressable>
);

const styles = StyleSheet.create({
  menuBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 20,
    borderBottomWidth: 1,
  },
  menuLeft: { 
    flexDirection: "row", 
    alignItems: "center", 
    gap: 15 
  },
  menuLabel: { 
    fontSize: 16, 
    fontWeight: "700" 
  },
});