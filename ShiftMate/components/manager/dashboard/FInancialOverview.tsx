import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface FinancialStats {
  totalSpending: number;
  effectiveSpending: number;
}

interface Props {
  stats: FinancialStats;
  theme: any;
}

export const FinancialOverview = ({ stats, theme }: Props) => {
  return (
    <View style={[styles.mainCard, { backgroundColor: theme.card }]}>
      <View style={styles.cardHeader}>
        <View style={[styles.iconBadge, { backgroundColor: theme.tint + "10" }]}>
          <Ionicons name="wallet" size={14} color={theme.tint} />
        </View>
        <Text style={[styles.cardTitle, { color: theme.text }]}>Monthly Budget</Text>
      </View>

      <View style={styles.spendingGrid}>
        <View style={styles.spendingItem}>
          <Text style={[styles.spendingLabel, { color: theme.secondaryText }]}>PLANNED</Text>
          <Text style={[styles.spendingValue, { color: theme.text }]}>
            €{stats.totalSpending.toLocaleString('it-IT', { minimumFractionDigits: 0 })}
          </Text>
        </View>
        
        <View style={[styles.spendingItem, styles.effectiveItem, { backgroundColor: '#4CAF5010' }]}>
          <Text style={[styles.spendingLabel, { color: '#4CAF50' }]}>EFFECTIVE</Text>
          <Text style={[styles.spendingValue, { color: '#4CAF50' }]}>
            €{stats.effectiveSpending.toLocaleString('it-IT', { minimumFractionDigits: 0 })}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  mainCard: { 
    borderRadius: 24, 
    padding: 14, 
    marginBottom: 12, 
    shadowColor: "#000", 
    shadowOffset: { width: 0, height: 10 }, 
    shadowOpacity: 0.05, 
    shadowRadius: 20, 
    elevation: 3 
  },
  cardHeader: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 8, 
    marginBottom: 12 
  },
  iconBadge: { 
    padding: 6, 
    borderRadius: 8 
  },
  cardTitle: { 
    fontSize: 13, 
    fontWeight: '700', 
    opacity: 0.8 
  },
  spendingGrid: { 
    flexDirection: 'row', 
    gap: 10 
  },
  spendingItem: { 
    flex: 1, 
    padding: 12, 
    borderRadius: 16, 
    justifyContent: 'center' 
  },
  effectiveItem: { 
    borderWidth: 1, 
    borderColor: '#4CAF5020' 
  },
  spendingLabel: { 
    fontSize: 8, 
    fontWeight: '800', 
    marginBottom: 4, 
    letterSpacing: 0.5 
  },
  spendingValue: { 
    fontSize: 18, 
    fontWeight: '900' 
  },
});