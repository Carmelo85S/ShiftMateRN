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
});