import { ShiftCard } from "@/components/shared/shiftCard/ShiftCard";
import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { useRouter } from "expo-router"; // ◄ AGGIUNTO: Importa il router di Expo
import { Ionicons } from "@expo/vector-icons";

export const UpcomingShifts = ({ shifts, theme, onViewAll, onShiftPress }: any) => {
  const router = useRouter(); // ◄ AGGIUNTO: Inizializza il router
  
  // Nota: expandedId è dichiarato ma non usato nel codice attuale, puoi tenerlo se servirà
  const [expandedId, setExpandedId] = useState<string | null>(shifts?.[0]?.id || null);
  
  // Stato vuoto: Nessun turno in arrivo trovato
  if (!shifts || shifts.length === 0) {
    return (
      <View style={[styles.emptyCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <Ionicons name="calendar-outline" size={48} color={theme.text} style={{ opacity: 0.1 }} />
        <Text style={[styles.emptyText, { color: theme.secondaryText }]}>
          No upcoming shifts scheduled. 
        </Text>
        <Pressable 
          style={({ pressed }) => [
            styles.btnCreateShift, 
            { backgroundColor: theme.text }, 
            pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] }
          ]}
          onPress={() => router.push('/(manager)/(tabs)/create')} 
        >
          <Text style={[styles.btnText, { color: theme.background }]}>
            Schedule a Shift
          </Text>
        </Pressable>
      </View>
    );
  }
    
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>Upcoming Shifts</Text>
        <Pressable onPress={onViewAll}>
          <Text style={{ color: theme.tint, fontWeight: "600" }}>View All</Text>
        </Pressable>
      </View>

      <View style={styles.grid}>
        {shifts.map((item: any) => {
          // Controlla se c'è un'applicazione approvata o se il turno ha già un worker_id assegnato
          const isAssigned = item.applications?.some((app: any) => app.status === "approved") || !!item.worker_id;

          return (
            <ShiftCard 
              key={item.id} 
              item={item} 
              variant="manager" 
              isApplied={isAssigned}
              onPress={() => onShiftPress(item.id)} 
            />
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginTop: 24 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  title: { fontSize: 20, fontWeight: "800", letterSpacing: -0.5 },
  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
  emptyCard: { marginVertical: 16,padding: 24, borderRadius: 16, alignItems: "center", justifyContent: "center",borderWidth: 1,},
  emptyText: { fontSize: 14, opacity: 0.4, marginVertical: 12, fontWeight: "600", textAlign: "center" },
  btnCreateShift: { paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12,justifyContent: "center",alignItems: "center"},
  btnText: { fontSize: 14, fontWeight: "700" }
});