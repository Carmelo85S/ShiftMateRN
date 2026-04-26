import React from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";

interface Props {
  value: string;
  onChange: (text: string) => void;
  estimatedEarnings: string;
  theme: any;
}

export const HourlyRate = ({ value, onChange, estimatedEarnings, theme }: Props) => {
  return (
    <View style={styles.inputWrapper}>
      <Text style={[styles.label, { color: theme.text }]}>Hourly Rate (€/hr) *</Text>
      <View style={styles.rateRow}>
        <TextInput
          style={[
            styles.input,
            { backgroundColor: theme.card, color: theme.text, borderColor: theme.border }
          ]}
          placeholder="0.00"
          placeholderTextColor={theme.secondaryText}
          keyboardType="decimal-pad"
          value={value}
          onChangeText={onChange}
        />
        
        <View style={[styles.earningsBox, { backgroundColor: theme.tint + "10" }]}>
          <Text style={[styles.earningsLabel, { color: theme.tint }]}>EST. TOTAL</Text>
          <Text style={[styles.earningsValue, { color: theme.tint }]}>€{estimatedEarnings}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  inputWrapper: { marginBottom: 25 },
  label: { fontSize: 11, fontWeight: "800", marginBottom: 12, textTransform: 'uppercase', opacity: 0.6 },
  input: { 
    flex: 1,
    height: 60, 
    paddingHorizontal: 18, 
    borderRadius: 20, 
    fontSize: 16, 
    borderWidth: 1, 
    fontWeight: '600' 
  },
  rateRow: { flexDirection: 'row', gap: 12 },
  earningsBox: { 
    flex: 0.8,
    borderRadius: 20, 
    paddingHorizontal: 15, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  earningsLabel: { fontSize: 8, fontWeight: "900", marginBottom: 2 },
  earningsValue: { fontSize: 18, fontWeight: "900" },
});