import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ShiftCard } from "@/components/shiftCard/ShiftCard";

export const UpcomingShifts = ({ shifts, theme, onViewAll, onShiftPress }: any) => (
  <View>
    <View style={styles.sectionHeader}>
      <View>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Upcoming Shifts</Text>
        <View style={[styles.dotSeparator, { backgroundColor: theme.tint }]} />
      </View>
      <Pressable onPress={onViewAll}>
         <Text style={[styles.viewAll, { color: theme.tint }]}>View All</Text>
      </Pressable>
    </View>

    <View style={styles.shiftsList}>
      {shifts.length > 0 ? (
        shifts.map((shift: any) => (
          <ShiftCard 
            key={shift.id}
            item={shift} 
            variant="manager"
            onPress={() => onShiftPress(shift.id)} 
          />
        ))
      ) : (
        <View style={[styles.emptyBox, { backgroundColor: theme.card }]}>
          <Ionicons name="calendar-outline" size={24} color={theme.secondaryText} style={{ opacity: 0.2 }} />
          <Text style={[styles.emptyText, { color: theme.secondaryText }]}>No upcoming shifts</Text>
        </View>
      )}
    </View>
  </View>
);

const styles = StyleSheet.create({
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  sectionTitle: { fontSize: 20, fontWeight: "900", letterSpacing: -0.5 },
  dotSeparator: { width: 15, height: 3, borderRadius: 2, marginTop: 4 },
  viewAll: { fontSize: 13, fontWeight: "700" },
  shiftsList: { gap: 12 },
  emptyBox: { height: 100, borderRadius: 24, justifyContent: 'center', alignItems: 'center', gap: 8, borderWidth: 1, borderStyle: 'dashed', borderColor: 'rgba(0,0,0,0.05)' },
  emptyText: { fontSize: 13, fontWeight: "600", opacity: 0.3 },
});