import React from "react";
import { View, Text, StyleSheet } from "react-native";

interface HeaderProps {
  kpi: string;
  title: string;
  theme: any;
}

export const SetupHeader = ({ kpi, title, theme }: HeaderProps) => (
  <View style={styles.header}>
    <Text style={[styles.kpi, { color: theme.tint }]}>{kpi}</Text>
    <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
  </View>
);

const styles = StyleSheet.create({
  header: { marginBottom: 40 },
  kpi: { fontSize: 13, fontWeight: "700", letterSpacing: 0.5, marginBottom: 8, opacity: 0.8 },
  title: { fontSize: 38, fontWeight: "800", lineHeight: 42, letterSpacing: -1 },
});