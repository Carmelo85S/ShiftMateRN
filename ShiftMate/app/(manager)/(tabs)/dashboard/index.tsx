import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  useColorScheme,
  Pressable,
  RefreshControl,
} from "react-native";
import { Colors } from "@/constants/theme";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ShiftCard } from "@/components/shiftCard/ShiftCard";
import { 
  fetchManagerShifts, 
  getManagerProfile,
  countPendingApplications 
} from "@/queries/managerQueries";

type Stats = {
  totalSpending: number;     
  effectiveSpending: number; 
  pendingCount: number;
};

export default function Dashboard() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [stats, setStats] = useState<Stats | null>(null);
  const [upcomingShifts, setUpcomingShifts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userName, setUserName] = useState("Manager");

  const fetchData = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;
      if (!userId) return;

      const today = new Date().toISOString().split("T")[0];
      
      const [profileData, allShifts, pendingCount] = await Promise.all([
        getManagerProfile(userId),
        fetchManagerShifts(userId),
        countPendingApplications(userId)
      ]);

      if (profileData?.name) setUserName(profileData.name);

      // calculate stats
      const totalSum = allShifts.reduce((acc, s) => acc + (Number(s.total_pay) || 0), 0);
      const effectiveSum = allShifts
        .filter(s => s.status === 'assigned') 
        .reduce((acc, s) => acc + (Number(s.total_pay) || 0), 0);

      setStats({
        totalSpending: totalSum,
        effectiveSpending: effectiveSum,
        pendingCount: pendingCount || 0
      });

      setUpcomingShifts(allShifts.filter((s: any) => s.shift_date >= today).slice(0, 3));
    } catch (error) {
      console.error("Dashboard error:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

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
          paddingHorizontal: 24, 
          paddingTop: insets.top + 8,
          paddingBottom: 40 
        }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.tint} />
        }
      >
        {/* HEADER */}
        <View style={styles.topBar}>
          <View>
            <Text style={[styles.dateText, { color: theme.secondaryText }]}>
              {new Date().toLocaleDateString('it-IT', { weekday: 'short', day: 'numeric', month: 'short' }).toUpperCase()}
            </Text>
            <Text style={[styles.userName, { color: theme.text }]}>Hi, {userName.split(' ')[0]}</Text>
          </View>
          <Pressable 
            onPress={() => router.push("/profile")}
            style={[styles.profileButton, { backgroundColor: theme.card, borderColor: theme.border }]}
          >
            <Ionicons name="person" size={18} color={theme.text} />
          </Pressable>
        </View>

        {/* FINANCIAL OVERVIEW */}
        <View style={[styles.mainCard, { backgroundColor: theme.card }]}>
          <View style={styles.cardHeader}>
            <View style={[styles.iconBadge, { backgroundColor: theme.tint + "10" }]}>
              <Ionicons name="wallet" size={14} color={theme.tint} />
            </View>
            <Text style={[styles.cardTitle, { color: theme.text }]}>Monthly Budget</Text>
          </View>

          <View style={styles.spendingGrid}>
            <View style={styles.spendingItem}>
              <Text style={[styles.spendingLabel, { color: theme.secondaryText }]}>PLANNED</Text>
              <Text style={[styles.spendingValue, { color: theme.text }]}>
                €{stats?.totalSpending.toLocaleString('it-IT', { minimumFractionDigits: 0 })}
              </Text>
            </View>
            
            <View style={[styles.spendingItem, styles.effectiveItem, { backgroundColor: '#4CAF5010' }]}>
              <Text style={[styles.spendingLabel, { color: '#4CAF50' }]}>EFFECTIVE</Text>
              <Text style={[styles.spendingValue, { color: '#4CAF50' }]}>
                €{stats?.effectiveSpending.toLocaleString('it-IT', { minimumFractionDigits: 0 })}
              </Text>
            </View>
          </View>
        </View>

        {/* QUICK ACTION - HISTORY & PENDING BADGE */}
        <Pressable 
          onPress={() => router.push("/history")}
          style={({ pressed }) => [
            styles.historyBar, 
            { backgroundColor: theme.card, opacity: pressed ? 0.9 : 1 }
          ]}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Ionicons name="time" size={18} color={theme.secondaryText} />
            <Text style={[styles.historyText, { color: theme.text }]}>View Shift History</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={theme.secondaryText} />
        </Pressable>

        {/* SECTION SHIFTS */}
        <View style={styles.sectionHeader}>
          <View>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Upcoming Shifts</Text>
            <View style={[styles.dotSeparator, { backgroundColor: theme.tint }]} />
          </View>
          <Pressable onPress={() => router.push("/(manager)/(tabs)/shift")}>
             <Text style={[styles.viewAll, { color: theme.tint }]}>View All</Text>
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
            <View style={[styles.emptyBox, { backgroundColor: theme.card }]}>
              <Ionicons name="calendar-outline" size={24} color={theme.secondaryText} style={{ opacity: 0.2 }} />
              <Text style={[styles.emptyText, { color: theme.secondaryText }]}>No upcoming shifts</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  dateText: { fontSize: 10, fontWeight: "700", letterSpacing: 1.2, opacity: 0.5 },
  userName: { fontSize: 28, fontWeight: "900", letterSpacing: -0.5, marginTop: 2 },
  profileButton: { width: 42, height: 42, borderRadius: 12, justifyContent: 'center', alignItems: 'center', borderWidth: 1, elevation: 2, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5 },
  
  mainCard: { borderRadius: 24, padding: 14, marginBottom: 12, shadowColor: "#000", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.05, shadowRadius: 20, elevation: 3 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  iconBadge: { padding: 6, borderRadius: 8 },
  cardTitle: { fontSize: 13, fontWeight: '700', opacity: 0.8 },
  spendingGrid: { flexDirection: 'row', gap: 10 },
  spendingItem: { flex: 1, padding: 12, borderRadius: 16, justifyContent: 'center' },
  effectiveItem: { borderWidth: 1, borderColor: '#4CAF5020' },
  spendingLabel: { fontSize: 8, fontWeight: '800', marginBottom: 4, letterSpacing: 0.5 },
  spendingValue: { fontSize: 18, fontWeight: '900' },

  historyBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14, borderRadius: 20, marginBottom: 25, elevation: 1 },
  historyText: { fontSize: 14, fontWeight: '600' },
  
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  sectionTitle: { fontSize: 20, fontWeight: "900", letterSpacing: -0.5 },
  dotSeparator: { width: 15, height: 3, borderRadius: 2, marginTop: 4 },
  viewAll: { fontSize: 13, fontWeight: "700" },

  shiftsList: { gap: 12 },
  emptyBox: { height: 100, borderRadius: 24, justifyContent: 'center', alignItems: 'center', gap: 8, borderWidth: 1, borderStyle: 'dashed', borderColor: 'rgba(0,0,0,0.05)' },
  emptyText: { fontSize: 13, fontWeight: "600", opacity: 0.3 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
});