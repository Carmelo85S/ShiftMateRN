import { Colors } from "@/constants/theme";
import { supabase } from "@/lib/supabase";
import { useRouter } from "expo-router";
import { useEffect, useState, useCallback } from "react";
import { 
  FlatList, 
  StyleSheet, 
  Text, 
  View, 
  ActivityIndicator, 
  RefreshControl 
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ShiftCard } from "@/components/shiftCard/ShiftCard"; // Importiamo il componente unico

type Shift = {
  id: string;
  title: string;
  shift_date: string;
  start_time: string;
  end_time: string;
  image_url: string | null;
};

export default function WorkerShifts() {
  const theme = Colors.light;
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchShifts = async () => {
    try {
      const { data, error } = await supabase
        .from("shifts")
        .select("id, title, shift_date, start_time, end_time, image_url")
        .eq("status", "open")
        .gte("shift_date", new Date().toISOString().split("T")[0])
        .order("shift_date", { ascending: true });

      if (error) throw error;
      setShifts(data as Shift[]);
    } catch (err: any) {
      console.error("Error:", err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchShifts(); }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchShifts();
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: theme.background, paddingTop: insets.top + 20 }]}>
      {/* HEADER BOLD - Stile Worker */}
      <View style={styles.headerArea}>
        <Text style={[styles.kpi, { color: theme.tint }]}>AVAILABLE NOW</Text>
        <Text style={[styles.title, { color: theme.text }]}>Find Work</Text>
      </View>

      {loading && !refreshing ? (
        <View style={styles.center}>
          <ActivityIndicator size="small" color={theme.text} />
        </View>
      ) : (
        <FlatList
          data={shifts}
          keyExtractor={(item) => item.id}
          // USIAMO IL COMPONENTE CONDIVISO
          renderItem={({ item }) => (
            <ShiftCard 
              item={item} 
              variant="worker" 
              onPress={() => router.push(`/(worker)/shift/${item.id}`)} 
            />
          )}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 120 }}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={onRefresh} 
              tintColor={theme.tint} 
            />
          }
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Ionicons name="search-outline" size={48} color={theme.icon} style={{ opacity: 0.2 }} />
              <Text style={[styles.emptyText, { color: theme.secondaryText }]}>
                No shifts available at the moment
              </Text>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20 },
  center: { marginTop: 50, alignItems: 'center' },
  headerArea: { marginBottom: 30 },
  kpi: { fontSize: 11, fontWeight: "900", letterSpacing: 2, marginBottom: 4 },
  title: { fontSize: 42, fontWeight: "900", letterSpacing: -2 },
  emptyContainer: { alignItems: 'center', marginTop: 100, gap: 15 },
  emptyText: { fontSize: 16, fontWeight: "600", textAlign: 'center', width: '80%' },
});