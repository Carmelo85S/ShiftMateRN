import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface HistoryStatsProps {
  spending: number;
  count: number;
  theme: any;
}

export const HistoryStatsCard = ({ spending, count, theme }: HistoryStatsProps) => {
  return (
    <View style={[styles.statsCard, { backgroundColor: theme.card }]}>
      <Text style={[styles.statsLabel, { color: theme.secondaryText }]}>
        TOTAL SPENDING
      </Text>
      
      <Text style={[styles.statsValue, { color: theme.text }]}>
        €{spending.toLocaleString('it-IT', { minimumFractionDigits: 2 })}
      </Text>

      <View style={styles.badge}>
        <Ionicons name="checkmark-done" size={12} color="#4CAF50" />
        <Text style={styles.badgeText}>{count} Shifts Completed</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  statsCard: { padding: 24, borderRadius: 24, marginBottom: 30, alignItems: 'center',shadowColor: "#000",shadowOffset: { width: 0, height: 2 },shadowOpacity: 0.05,shadowRadius: 10,elevation: 2,},
  statsLabel: { fontSize: 10, fontWeight: "800", letterSpacing: 1.5, marginBottom: 8,opacity: 0.6 },
  statsValue: { fontSize: 34, fontWeight: "900",letterSpacing: -1 },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 16, backgroundColor: '#4CAF5015', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 14 },
  badgeText: { color: '#4CAF50', fontSize: 13, fontWeight: "700" },
});