import React from "react";
import { View, Text, StyleSheet } from "react-native";

export const ProfileInfoCard = ({ role, theme }: any) => (
  <View style={[styles.infoCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
    <View style={styles.infoItem}>
      <Text style={[styles.infoLabel, { color: theme.secondaryText }]}>ROLE</Text>
      <Text style={[styles.infoValue, { color: theme.text }]}>{role}</Text>
    </View>
    <View style={[styles.verticalDivider, { backgroundColor: theme.border }]} />
    <View style={styles.infoItem}>
      <Text style={[styles.infoLabel, { color: theme.secondaryText }]}>STATUS</Text>
      <View style={styles.statusBadge}>
        <View style={[styles.statusDot, { backgroundColor: theme.success }]} />
        <Text style={[styles.statusText, { color: theme.success }]}>Active</Text>
      </View>
    </View>
  </View>
);

const styles = StyleSheet.create({
  infoCard: { flexDirection: 'row', borderRadius: 24, padding: 24, marginBottom: 40, borderWidth: 1 },
  infoItem: { flex: 1, gap: 6 },
  infoLabel: { fontSize: 11, fontWeight: "800", opacity: 0.4, letterSpacing: 0.6 },
  infoValue: { fontSize: 16, fontWeight: "700" },
  verticalDivider: { width: 1, height: '80%', alignSelf: 'center', marginHorizontal: 20 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(52, 199, 89, 0.1)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, alignSelf: 'flex-start' },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 12, fontWeight: "700" },
});