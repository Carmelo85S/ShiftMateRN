import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export const ShiftInfo = ({ shift, theme }: any) => {
  const dateStr = shift?.shift_date ? new Date(shift.shift_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '-';
  const timeStr = `${shift?.start_time?.slice(0,5)} - ${shift?.end_time?.slice(0,5)}`;

  return (
    <View style={styles.container}>
      <View style={styles.chipRow}>
        <InfoChip label="DATE" value={dateStr} icon="calendar-outline" theme={theme} />
        <InfoChip label="HOURS" value={timeStr} icon="time-outline" theme={theme} />
      </View>

      {shift?.department && (
        <View style={[styles.deptBar, { backgroundColor: theme.text + "05" }]}>
          <View style={[styles.deptIndicator, { backgroundColor: theme.tint }]} />
          <Text style={[styles.deptText, { color: theme.secondaryText }]}>
            Department: <Text style={{ color: theme.text, fontWeight: "700" }}>{shift.department.toUpperCase()}</Text>
          </Text>
        </View>
      )}
    </View>
  );
};

const InfoChip = ({ label, value, icon, theme }: any) => (
  <View style={[styles.glassChip, { backgroundColor: theme.card, borderColor: theme.border }]}>
    <Ionicons name={icon} size={18} color={theme.tint} />
    <View>
      <Text style={styles.chipLabel}>{label}</Text>
      <Text style={[styles.chipValue, { color: theme.text }]}>{value}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: { marginBottom: 20 },
  chipRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  glassChip: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, borderRadius: 20, borderWidth: 1 },
  chipLabel: { fontSize: 9, fontWeight: '700', opacity: 0.4, marginBottom: 2 },
  chipValue: { fontSize: 15, fontWeight: '700' },
  deptBar: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 20, gap: 12 },
  deptIndicator: { width: 4, height: 20, borderRadius: 2 },
  deptText: { fontSize: 13, fontWeight: '600' },
});