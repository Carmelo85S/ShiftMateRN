import { View, Text, StyleSheet, FlatList, ActivityIndicator, useColorScheme } from "react-native";
import { useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { Colors } from "@/constants/theme";
import { useFocusEffect, Stack, router } from "expo-router";
import { fetchManagerHistory } from "@/queries/managerQueries";
import { ShiftCard } from "@/components/shiftCard/ShiftCard";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

export default function HistoryScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];
  const insets = useSafeAreaInsets();
  
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalHistorySpending, setTotalHistorySpending] = useState(0);

  const loadHistory = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.id) return;

      const data = await fetchManagerHistory(session.user.id);
      setHistory(data);

      // Calcola il totale speso storicamente (solo turni assegnati/completati)
      const total = data.reduce((acc, shift) => acc + (Number(shift.total_pay) || 0), 0);
      setTotalHistorySpending(total);
    } catch (error) {
      console.error("History error:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadHistory();
    }, [loadHistory])
  );

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="small" color={theme.text} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <Stack.Screen options={{ title: "Shifts History", headerShadowVisible: false }} />
      
      <FlatList
        data={history}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 24, paddingBottom: insets.bottom + 20 }}
        ListHeaderComponent={() => (
          <View style={[styles.statsCard, { backgroundColor: theme.card }]}>
            <Text style={[styles.statsLabel, { color: theme.secondaryText }]}>TOTAL SPENDING</Text>
            <Text style={[styles.statsValue, { color: theme.text }]}>
              €{totalHistorySpending.toLocaleString('it-IT')}
            </Text>
            <View style={styles.badge}>
              <Ionicons name="checkmark-done" size={12} color="#4CAF50" />
              <Text style={styles.badgeText}>{history.length} Shifts Completed</Text>
            </View>
          </View>
        )}
        renderItem={({ item }) => (
          <View style={styles.itemWrapper}>
             <ShiftCard item={item} variant="manager" onPress={() => router.push(`/(manager)/(tabs)/shift/${item.id}`)} />
             {item.assignedWorker && (
               <View style={styles.workerTag}>
                 <Ionicons name="person-circle-outline" size={14} color={theme.secondaryText} />
                 <Text style={[styles.workerName, { color: theme.secondaryText }]}>
                   Worked: {item.assignedWorker.name} {item.assignedWorker.surname}
                 </Text>
               </View>
             )}
          </View>
        )}
        ListEmptyComponent={() => (
          <View style={styles.empty}>
            <Text style={{ color: theme.secondaryText }}>No shifts in the past.</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  statsCard: { padding: 24, borderRadius: 24, marginBottom: 30, alignItems: 'center' },
  statsLabel: { fontSize: 10, fontWeight: "800", letterSpacing: 1, marginBottom: 8 },
  statsValue: { fontSize: 32, fontWeight: "900" },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 12, backgroundColor: '#4CAF5010', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  badgeText: { color: '#4CAF50', fontSize: 12, fontWeight: "700" },
  itemWrapper: { marginBottom: 16, opacity: 0.6 },
  workerTag: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8, marginLeft: 12 },
  workerName: { fontSize: 12, fontWeight: "600" },
  empty: { alignItems: 'center', marginTop: 50 }
});