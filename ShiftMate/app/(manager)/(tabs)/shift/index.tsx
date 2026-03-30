import { 
  View, 
  FlatList, 
  RefreshControl, 
  Text, 
  StyleSheet, 
  ActivityIndicator, 
  useColorScheme, 
  Pressable
} from "react-native";
import React, { useState, useCallback } from "react";
import { Colors } from "@/constants/theme";
import { supabase } from "@/lib/supabase";
import { useRouter, useFocusEffect } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ShiftCard } from "@/components/shiftCard/ShiftCard";
import { Ionicons } from "@expo/vector-icons";

// 1. Definiamo il tipo Shift per risolvere gli errori "Cannot find name 'Shift'"
interface Shift {
  id: string;
  title: string;
  shift_date: string;
  start_time: string;
  end_time: string;
  image_url: string | null;
  status: string;
  description?: string;
}

export default function ShiftsManager() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];

  // 2. Inizializziamo lo stato con il tipo corretto <Shift[]> per evitare "never[]"
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchShifts = useCallback(async () => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;

      const { data, error } = await supabase
        .from("shifts")
        .select("*")
        .eq("manager_id", userData.user.id)
        .order("shift_date", { ascending: false });

      if (error) throw error;
      
      // 3. Cast sicuro dei dati
      setShifts((data as Shift[]) || []);
    } catch (err) {
      console.error("Error fetching shifts:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchShifts();
    }, [fetchShifts])
  );

  if (loading && !refreshing) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="small" color={theme.text} />
      </View>
    );
  }
// ... (import e logica Shift invariati)

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <FlatList
        data={shifts}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContent, 
          { paddingTop: insets.top + 10, paddingBottom: 100 } // Spazio ridotto in alto
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={() => { setRefreshing(true); fetchShifts(); }} 
            tintColor={theme.tint} 
          />
        }
        ListHeaderComponent={() => (
          <View style={styles.headerArea}>
            <View style={styles.titleRow}>
              <View>
                <Text style={[styles.kpiLabel, { color: theme.tint }]}>CENTER</Text>
                <Text style={[styles.headerTitle, { color: theme.text }]}>Shift Hub</Text>
              </View>
              {/* Contatore discreto */}
              <View style={[styles.countBadge, { backgroundColor: theme.text + "10" }]}>
                <Text style={[styles.countText, { color: theme.text }]}>{shifts.length}</Text>
              </View>
            </View>
          </View>
        )}
        renderItem={({ item }) => (
          <ShiftCard 
            item={item} 
            onPress={() => router.push(`/(manager)/(tabs)/shift/${item.id}`)} 
          />
        )}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Ionicons name="calendar-outline" size={48} color={theme.text} style={{ opacity: 0.1 }} />
            <Text style={[styles.emptyText, { color: theme.text }]}>No shifts posted.</Text>
          </View>
        )}
      />

      {/* FAB CIRCOLARE E LATERALE */}
      <View style={[styles.fabContainer, { bottom: insets.bottom + 20 }]}>
        <Pressable 
          onPress={() => router.push("/(manager)/(tabs)/createShift")}
          style={({ pressed }) => [
            styles.fab, 
            { 
              backgroundColor: theme.text, // NEUTRAL_900
              opacity: pressed ? 0.9 : 1,
              transform: [{ scale: pressed ? 0.92 : 1 }]
            }
          ]}
        >
          <Ionicons name="add" size={32} color={theme.background} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  listContent: { paddingHorizontal: 20 },
  
  // Header Snello
  headerArea: { marginBottom: 25 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  kpiLabel: { fontSize: 10, fontWeight: "900", letterSpacing: 1.5, marginBottom: 2 },
  headerTitle: { fontSize: 38, fontWeight: "900", letterSpacing: -1.5 },
  
  countBadge: { paddingHorizontal: 10, height: 24, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  countText: { fontSize: 13, fontWeight: "800" },

  // Empty State
  emptyContainer: { marginTop: 80, alignItems: "center" },
  emptyText: { marginTop: 12, fontSize: 15, fontWeight: "600", opacity: 0.3 },

  // FAB Circolare a lato
  fabContainer: {
    position: 'absolute',
    right: 20,
    zIndex: 10,
  },
  fab: {
    width: 60,
    height: 60,
    borderRadius: 30, // Circolare perfetto
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
});