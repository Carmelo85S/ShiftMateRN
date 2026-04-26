import React, { useCallback } from "react";
import {
  StyleSheet,
  View,
  ActivityIndicator,
  useColorScheme,
} from "react-native";
import { Colors } from "@/constants/theme";
import { useFocusEffect, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useDashboardData } from "@/hooks/manager/useFetchDataDashboard";
import { DashboardHeader } from "@/components/manager/DashboardHeader";
import { FinancialOverview } from "@/components/manager/FInancialOverview";
import { HistoryBar } from "@/components/manager/HistoryBar";
import { UpcomingShifts } from "@/components/manager/UpcomingShifts";
import { ScreenWrapper } from "@/components/shared/wrapper/layout-wrapper";

export default function Dashboard() {
  const theme = Colors[useColorScheme() ?? "light"];
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

  // Refresh automatico quando la pagina torna in focus
  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData])
  );

  if (loading && !refreshing) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="small" color={theme.text} />
      </View>
    );
  }

  return (
    <ScreenWrapper 
      scrollable={true}
      onRefresh={onRefresh}
      refreshing={refreshing}
      style={styles.wrapperCustom}
    >
      <View style={[styles.mainContent, { paddingTop: insets.top + 8 }]}>
        
        {/* HEADER: Saluto e Profilo */}
        <DashboardHeader 
          userName={userName} 
          theme={theme} 
          onProfilePress={() => router.push("/profile")} 
        />

        {/* FINANCIAL: KPI e Statistiche */}
        <FinancialOverview stats={stats} theme={theme} />
        
        {/* HISTORY: Accesso rapido allo storico */}
        <HistoryBar 
          theme={theme} 
          onPress={() => router.push("/history")} 
        />

        {/* SHIFTS: Prossimi turni in arrivo */}
        <UpcomingShifts 
          shifts={upcomingShifts} 
          theme={theme} 
          onViewAll={() => router.push("/(manager)/(tabs)/shift")}
          onShiftPress={(id: string) => router.push(`/(manager)/(tabs)/shift/${id}`)}
        />
        
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  center: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center" 
  },
  wrapperCustom: {
    paddingHorizontal: 24,
  },
  mainContent: {
    flex: 1,
    paddingBottom: 20, // Spazio extra prima del padding della TabBar gestito dal wrapper
  },
});