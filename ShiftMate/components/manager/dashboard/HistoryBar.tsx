import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

export const HistoryBar = ({ theme, onPress }: any) => (
  <Pressable
    onPress={onPress}
    style={({ pressed }) => [
      styles.historyBar,
      {
        backgroundColor: theme.card,
        borderColor: theme.border,
        opacity: pressed ? 0.85 : 1,
        transform: [{ scale: pressed ? 0.98 : 1 }],
      },
    ]}
  >
    <View style={styles.leftContainer}>
      <View
        style={[styles.iconContainer, { backgroundColor: theme.background }]}
      >
        <Ionicons name="time-outline" size={20} color={theme.tint} />
      </View>
      <Text style={[styles.historyText, { color: theme.text }]}>
        View Shift History
      </Text>
    </View>

    <View>
      <Ionicons name="chevron-forward" size={20} color={theme.secondaryText} />
    </View>
  </Pressable>
);

const styles = StyleSheet.create({
  historyBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    paddingRight: 16,
    borderRadius: 20,
    borderWidth: 1,
    marginVertical: 10,
  },
  leftContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconContainer: {
    padding: 8,
    borderRadius: 12,
  },
  chevronContainer: {
    padding: 6,
    borderRadius: 10,
  },
  historyText: {
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
});
