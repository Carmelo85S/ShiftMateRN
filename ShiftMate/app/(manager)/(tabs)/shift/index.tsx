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
import { useRouter, useFocusEffect } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ShiftCard } from "@/components/shiftCard/ShiftCard";
import { Ionicons } from "@expo/vector-icons";
import { fetchManagerShifts } from "@/queries/managerQueries";
import { supabase } from "@/lib/supabase";
import { ScreenWrapper } from "@/components/shared/wrapper/layout-wrapper";

interface Shift {
  id: string;
  title: string;
  shift_date: string;
  start_time: string;
  end_time: string;
  image_url: string | null;
  status: string;
}

export default function ShiftsManager() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = Colors[useColorScheme() ?? "light"];

  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      // Manager id is stored in the session, so we can get it directly without an extra query
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.id) return;

      // Pass the manager's user ID to the fetchManagerShifts function
      const data = await fetchManagerShifts(session.user.id); 
      setShifts(data as Shift[]);
    } catch (err) {
      console.error("Error loading shifts:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  if (loading && !refreshing) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="small" color={theme.text} />
      </View>
    );
  }

  return (
    <ScreenWrapper scrollable={false}>
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <FlatList
        data={shifts}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContent, 
          { paddingTop: insets.top + 10, paddingBottom: 100 }
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.tint} />
        }
        ListHeaderComponent={() => (
          <View style={styles.headerArea}>
            <View style={styles.titleRow}>
              <View>
                <Text style={[styles.kpiLabel, { color: theme.tint }]}>CENTER</Text>
                <Text style={[styles.headerTitle, { color: theme.text }]}>Shift Hub</Text>
              </View>
              <View style={[styles.countBadge, { backgroundColor: theme.text + "10" }]}>
                <Text style={[styles.countText, { color: theme.text }]}>{shifts.length}</Text>
              </View>
            </View>
          </View>
        )}
        renderItem={({ item }) => (
          <ShiftCard 
            item={item} 
            variant="manager"
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
    </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  listContent: { paddingHorizontal: 24 },
  headerArea: { marginBottom: 30, marginTop: 15 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  kpiLabel: { fontSize: 12, fontWeight: "700", letterSpacing: 0.5, marginBottom: 4, opacity: 0.5 },
  headerTitle: { fontSize: 28, fontWeight: "700", letterSpacing: -0.8 },
  countBadge: { paddingHorizontal: 12, height: 28, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  countText: { fontSize: 14, fontWeight: "600", opacity: 0.7 },
  emptyContainer: { marginTop: 100, alignItems: "center", gap: 15 },
  emptyText: { fontSize: 16, fontWeight: "500", opacity: 0.4, textAlign: 'center' },
  fabContainer: { position: 'absolute', right: 24, zIndex: 10 },
  fab: { width: 52, height: 52, borderRadius: 32, justifyContent: "center", alignItems: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.12, shadowRadius: 12, elevation: 6 },
});