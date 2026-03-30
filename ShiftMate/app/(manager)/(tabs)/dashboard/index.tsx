import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  useColorScheme,
  Pressable,
} from "react-native";
import { Colors } from "@/constants/theme";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ShiftCard } from "@/components/shiftCard/ShiftCard";

type Stats = {
  totalWorkers: number;
  totalShifts: number;
  openShifts: number;
};

export default function Dashboard() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [stats, setStats] = useState<Stats | null>(null);
  const [upcomingShifts, setUpcomingShifts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("Manager");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 1. Fetch Profile Name
      const { data: profile } = await supabase
        .from("profiles")
        .select("name")
        .eq("id", user.id)
        .single();
      if (profile?.name) setUserName(profile.name);

      // 2. Fetch Statistics
      const [workers, shifts, open] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "worker"),
        supabase.from("shifts").select("id", { count: "exact", head: true }).eq("manager_id", user.id),
        supabase.from("shifts").select("id", { count: "exact", head: true }).eq("manager_id", user.id).eq("status", "open")
      ]);

      setStats({
        totalWorkers: workers.count || 0,
        totalShifts: shifts.count || 0,
        openShifts: open.count || 0,
      });

      // 3. Fetch Next 3 Upcoming Shifts
      const today = new Date().toISOString().split("T")[0];
      const { data: shiftsData } = await supabase
        .from("shifts")
        .select("*")
        .eq("manager_id", user.id)
        .gte("shift_date", today)
        .order("shift_date", { ascending: true })
        .limit(3);

      setUpcomingShifts(shiftsData || []);
    } catch (error) {
      console.error("Dashboard error:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { fetchData(); }, [fetchData]));

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="small" color={theme.text} />
      </View>
    );
  }


  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ 
          paddingHorizontal: 20, 
          paddingTop: insets.top + 10, 
          paddingBottom: 100 
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* HEADER MINIMALE ED ELEGANTE */}
        <View style={styles.topBar}>
          <View>
            <Text style={[styles.dateText, { color: theme.secondaryText }]}>
              {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric' }).toUpperCase()}
            </Text>
            <Text style={[styles.userName, { color: theme.text }]}>Hello, {userName}</Text>
          </View>
          <Pressable 
            onPress={() => router.push("/profile")}
            style={[styles.profileButton, { backgroundColor: theme.card, borderColor: theme.border }]}
          >
            <Ionicons name="person" size={20} color={theme.text} />
          </Pressable>
        </View>

        {/* STATS: Layout Orizzontale Pulito */}
        <View style={styles.metricsRow}>
          <View style={[styles.metricBox, { borderRightWidth: 1, borderColor: theme.border }]}>
            <Text style={[styles.metricLabel, { color: theme.secondaryText }]}>WORKERS</Text>
            <Text style={[styles.metricValue, { color: theme.text }]}>{stats?.totalWorkers || 0}</Text>
          </View>
          <View style={[styles.metricBox, { borderRightWidth: 1, borderColor: theme.border }]}>
            <Text style={[styles.metricLabel, { color: theme.secondaryText }]}>TOTAL SHIFTS</Text>
            <Text style={[styles.metricValue, { color: theme.text }]}>{stats?.totalShifts || 0}</Text>
          </View>
          <View style={styles.metricBox}>
            <Text style={[styles.metricLabel, { color: theme.tint }]}>OPEN</Text>
            <Text style={[styles.metricValue, { color: theme.tint }]}>{stats?.openShifts || 0}</Text>
          </View>
        </View>

        {/* QUICK ACTIONS: Il cuore della produttività */}
        <View style={styles.actionGrid}>
          <QuickAction 
            title="Create Shift" 
            icon="add-circle" 
            onPress={() => router.push("/createShift")} 
            theme={theme} 
          />
          <QuickAction 
            title="Manage Team" 
            icon="people-sharp" 
            onPress={() => {}} 
            theme={theme} 
          />
        </View>

        {/* SEZIONE PROSSIMI TURNI */}
        <View style={styles.sectionHeader}>
          <View>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Upcoming Shifts</Text>
            <Text style={[styles.sectionSubtitle, { color: theme.secondaryText }]}>Your schedule for the next days</Text>
          </View>
          <Pressable onPress={() => router.push("/(manager)/(tabs)/shift")}>
             <Ionicons name="arrow-forward-circle" size={32} color={theme.text} />
          </Pressable>
        </View>

        <View style={styles.shiftsList}>
          {upcomingShifts.length > 0 ? (
            upcomingShifts.map((shift) => (
              <ShiftCard 
                key={shift.id}
                item={shift} 
                variant="manager"
                onPress={() => router.push(`/(manager)/(tabs)/shift/${shift.id}`)} 
              />
            ))
          ) : (
            <View style={[styles.emptyBox, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <Text style={[styles.emptyText, { color: theme.secondaryText }]}>No shifts scheduled</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

// Sottocomponente per azioni rapide
const QuickAction = ({ title, icon, onPress, theme }: any) => (
  <Pressable 
    onPress={onPress}
    style={({ pressed }) => [
      styles.actionBtn, 
      { backgroundColor: theme.card, borderColor: theme.border, opacity: pressed ? 0.7 : 1 }
    ]}
  >
    <Ionicons name={icon} size={22} color={theme.text} />
    <Text style={[styles.actionBtnText, { color: theme.text }]}>{title}</Text>
  </Pressable>
);

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40 },
  dateText: { fontSize: 11, fontWeight: "800", letterSpacing: 1.5 },
  userName: { fontSize: 28, fontWeight: "900", letterSpacing: -1 },
  profileButton: { width: 48, height: 48, borderRadius: 16, borderWidth: 1, justifyContent: 'center', alignItems: 'center' },

  metricsRow: { 
    flexDirection: 'row', 
    backgroundColor: '#FFF', // Usiamo White per farla staccare dal Neutral_100
    borderRadius: 24, 
    paddingVertical: 20, 
    marginBottom: 25,
    borderWidth: 1,
    borderColor: '#E5E7EB'
  },
  metricBox: { flex: 1, alignItems: 'center', gap: 4 },
  metricLabel: { fontSize: 10, fontWeight: "800", letterSpacing: 1 },
  metricValue: { fontSize: 22, fontWeight: "900" },

  actionGrid: { flexDirection: 'row', gap: 12, marginBottom: 40 },
  actionBtn: { flex: 1, height: 56, borderRadius: 18, borderWidth: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  actionBtnText: { fontSize: 15, fontWeight: "700" },

  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  sectionTitle: { fontSize: 22, fontWeight: "900", letterSpacing: -0.5 },
  sectionSubtitle: { fontSize: 14, fontWeight: "500", marginTop: 2 },
  
  shiftsList: { gap: 12 },
  emptyBox: { height: 100, borderRadius: 24, borderWidth: 1, borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: 14, fontWeight: "600" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
});