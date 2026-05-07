import { ShiftCard } from "@/components/shared/shiftCard/ShiftCard";
import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";

export const UpcomingShifts = ({ shifts, theme, onViewAll, onShiftPress }: any) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>Upcoming Shifts</Text>
        <Pressable onPress={onViewAll}>
          <Text style={{ color: theme.tint, fontWeight: "600" }}>View All</Text>
        </Pressable>
      </View>

      <View style={styles.grid}>
        {shifts.map((item: any) => (
          <ShiftCard 
            key={item.id} 
            item={item} 
            onPress={() => onShiftPress(item.id)} 
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginTop: 24 },
  header: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    alignItems: "center", 
    marginBottom: 16 
  },
  title: { fontSize: 20, fontWeight: "800", letterSpacing: -0.5 },
  grid: { 
    flexDirection: "row", 
    flexWrap: "wrap", 
    justifyContent: "space-between" 
  },
});