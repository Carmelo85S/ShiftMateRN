import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface HistoryStatsProps {
  spending: number;
  count: number;
  theme: any;
}

export const HistoryStatsCard = ({ spending, count, theme }: HistoryStatsProps) => {
  return (
    <View style={[styles.statsCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
      <View style={styles.leftContent}>
        <Text style={[styles.statsLabel, { color: theme.secondaryText }]}>
          TOTAL SPENDING
        </Text>
        <Text style={[styles.statsValue, { color: theme.text }]}>
          €{spending.toLocaleString('it-IT', { minimumFractionDigits: 2 })}
        </Text>
      </View>

      <View style={styles.badge}>
        <Ionicons name="checkmark-done-circle" size={16} color="#4CAF50" />
        <View>
          <Text style={styles.badgeCount}>{count}</Text>
          <Text style={styles.badgeLabel}>SHIFTS</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  statsCard: { 
    padding: 16, 
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  leftContent: {
    flex: 1,
  },
  statsLabel: { 
    fontSize: 9, // Ridotto
    fontWeight: "800", 
    letterSpacing: 1, 
    marginBottom: 2,
    opacity: 0.6 
  },
  statsValue: { 
    fontSize: 24, // Ridotto da 34 per non essere troppo ingombrante
    fontWeight: "900",
    letterSpacing: -0.5 
  },
  badge: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 8, 
    backgroundColor: '#4CAF5010', 
    paddingHorizontal: 12, 
    paddingVertical: 8, 
    borderRadius: 12 
  },
  badgeCount: { 
    color: '#4CAF50', 
    fontSize: 14, 
    fontWeight: "800",
    lineHeight: 14
  },
  badgeLabel: {
    color: '#4CAF50',
    fontSize: 8,
    fontWeight: "700",
    opacity: 0.8
  }
});