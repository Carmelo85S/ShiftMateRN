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
import { countBusinessWorkers, fetchManagerShifts, getManagerProfile } from "@/queries/managerQueries";

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

  // FETCH DATA
  const fetchData = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;
      if (!userId) return;
      const today = new Date().toISOString().split("T")[0];
      const [profileData, allShifts] = await Promise.all([
        getManagerProfile(userId),
        fetchManagerShifts(userId),
      ]);
      if (profileData?.name) setUserName(profileData.name);
      let workersCount = 0;
      if (profileData?.business_id) {
        workersCount = await countBusinessWorkers(profileData.business_id);
      }
      setStats({
        totalWorkers: workersCount || 0,
        totalShifts: allShifts.length || 0,
        openShifts: allShifts.filter((s: any) => s.status === 'open').length || 0,
      });
      setUpcomingShifts(allShifts.filter((s: any) => s.shift_date >= today).slice(0, 3));
    } catch (error) {
      console.error("Dashboard error:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData])
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
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ 
          paddingHorizontal: 20, 
          paddingTop: insets.top + 10, 
          paddingBottom: 100 
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* HEADER */}
        <View style={styles.topBar}>
          <View>
            <Text style={[styles.dateText, { color: theme.secondaryText }]}>
              {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric' }).toUpperCase()}
            </Text>
            <Text style={[styles.userName, { color: theme.text }]}>Hello, {userName}</Text>
          </View>
          <Pressable 
            onPress={() => router.push("/profile")}
            style={[styles.profileButton, { backgroundColor: theme.card }]}
          >
            <Ionicons name="person" size={20} color={theme.text} />
          </Pressable>
        </View>

        {/* STATS */}
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

        {/* QUICK ACTIONS */}
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

        {/* UPCOMING SHIFTS */}
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

const QuickAction = ({ title, icon, onPress, theme }: any) => (
  <Pressable 
    onPress={onPress}
    style={({ pressed }) => [
      styles.actionBtn, 
      { 
        backgroundColor: theme.card,
        opacity: pressed ? 0.8 : 1,
        transform: [{ scale: pressed ? 0.96 : 1 }]
      }
    ]}
  >
    <View style={[styles.iconCircle, { backgroundColor: theme.tint + "15" }]}>
        <Ionicons name={icon} size={20} color={theme.tint} />
    </View>
    <Text style={[styles.actionBtnText, { color: theme.text }]}>{title}</Text>
  </Pressable>
);

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 35, marginTop: 10 },
  dateText: { fontSize: 12, fontWeight: "600", letterSpacing: 0.5, opacity: 0.6 },
  userName: { fontSize: 28, fontWeight: "700", letterSpacing: -0.8 },
  profileButton: { width: 45, height: 45, borderRadius: 22, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFF', shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
  metricsRow: { flexDirection: 'row', backgroundColor: '#FFF', borderRadius: 24, paddingVertical: 22, marginBottom: 30, shadowColor: "#000", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.04, shadowRadius: 20, elevation: 3 },
  metricBox: { flex: 1, alignItems: 'center', gap: 6 },
  metricLabel: { fontSize: 11, fontWeight: "600", opacity: 0.5, letterSpacing: 0.3 },
  metricValue: { fontSize: 24, fontWeight: "700" },
  actionGrid: { flexDirection: 'row', gap: 16, marginBottom: 35 },
  actionBtn: { flex: 1, paddingVertical: 14, paddingHorizontal: 12, borderRadius: 20, alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: '#FFF' },
  iconCircle: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  actionBtnText: { fontSize: 13, fontWeight: "600" },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 },
  sectionTitle: { fontSize: 20, fontWeight: "700", letterSpacing: -0.5 },
  sectionSubtitle: { fontSize: 14, opacity: 0.6, marginTop: 2 },
  shiftsList: { gap: 16 },
  emptyBox: { height: 120, borderRadius: 24, backgroundColor: 'rgba(0,0,0,0.02)', borderWidth: 1, borderStyle: 'dashed', borderColor: 'rgba(0,0,0,0.1)', justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: 14, fontWeight: "500", opacity: 0.5 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
});