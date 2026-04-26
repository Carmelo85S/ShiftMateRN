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
import { useCallback } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useDashboardData } from "@/hooks/manager/useFetchDataDashboard";
import { DashboardHeader } from "@/components/manager/DashboardHeader";
import { FinancialOverview } from "@/components/manager/FInancialOverview";
import { HistoryBar } from "@/components/manager/HistoryBar";
import { UpcomingShifts } from "@/components/manager/UpcomingShifts";

export default function Dashboard() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const { 
    userName, 
    stats, 
    upcomingShifts, 
    loading, 
    refreshing, 
    fetchData, 
    onRefresh 
  } = useDashboardData();

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
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh} 
            tintColor={theme.tint} 
          />
        }
      >
        {/* HEADER */}
        <DashboardHeader 
          userName={userName} 
          theme={theme} 
          onProfilePress={() => router.push("/profile")} 
        />

        {/* FINANCIAL OVERVIEW */}
        <FinancialOverview stats={stats} theme={theme} />
        
        {/* HISTORY BAR */}
        <HistoryBar 
          theme={theme} 
          onPress={() => router.push("/history")} 
        />

        {/* SECTION SHIFTS */}
        <UpcomingShifts 
          shifts={upcomingShifts} 
          theme={theme} 
          onViewAll={() => router.push("/(manager)/(tabs)/shift")}
          onShiftPress={(id: string) => router.push(`/(manager)/(tabs)/shift/${id}`)}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
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
});