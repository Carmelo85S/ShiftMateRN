import React from "react";
import { View, Text, StyleSheet } from "react-native";

export const BiographySection = ({ bio, theme }: any) => (
  <View style={styles.bioSection}>
    <Text style={[styles.sectionTitle, { color: theme.text }]}>Biography</Text>
    <Text style={[styles.bioDescription, { color: theme.secondaryText }]}>
      {bio || "No biography provided yet."}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  bioSection: { marginBottom: 35 },
  sectionTitle: { fontSize: 18, fontWeight: "800", marginBottom: 10 },
  bioDescription: { fontSize: 15, lineHeight: 22, opacity: 0.7 },
});