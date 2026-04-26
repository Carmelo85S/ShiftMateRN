import React from "react";
import { Pressable, View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export const HistoryBar = ({ theme, onPress }: any) => (
  <Pressable 
    onPress={onPress}
    style={({ pressed }) => [
      styles.historyBar, 
      { backgroundColor: theme.card, opacity: pressed ? 0.9 : 1 }
    ]}
  >
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
      <Ionicons name="time" size={18} color={theme.secondaryText} />
      <Text style={[styles.historyText, { color: theme.text }]}>View Shift History</Text>
    </View>
    <Ionicons name="chevron-forward" size={16} color={theme.secondaryText} />
  </Pressable>
);

const styles = StyleSheet.create({
  historyBar: {flexDirection: 'row',justifyContent: 'space-between',alignItems: 'center',padding: 14,borderRadius: 20,marginBottom: 25,elevation: 1 },
  historyText: { fontSize: 14, fontWeight: '600' },
});