import React, { useCallback, useState } from "react";
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
import { DashboardHeader } from "@/components/manager/dashboard/DashboardHeader";
import { FinancialOverview } from "@/components/manager/dashboard/FinancialOverview";
import { HistoryBar } from "@/components/manager/dashboard/HistoryBar";
import { UpcomingShifts } from "@/components/manager/dashboard/UpcomingShifts";
import { ScreenWrapper } from "@/components/shared/wrapper/layout-wrapper";

export default function Dashboard() {
  const theme = Colors[useColorScheme() ?? "light"];
  const insets = useSafeAreaInsets();
  const router = useRouter();

  // 🌟 Contatore per forzare la rinfrescata dei componenti figli quando cambia il focus
  const [focusCount, setFocusCount] = useState<number>(0);

  const { 
    userName, 
    businessType,
    stats, 
    upcomingShifts, 
    loading, 
    refreshing, 
    fetchData, 
    onRefresh 
  } = useDashboardData();

  // Scatta ogni volta che la tab riceve il focus visivo
  useFocusEffect(
    useCallback(() => {
      // 1. Recupera i dati aggiornati da Supabase
      fetchData();
      // 2. Incrementa il contatore per rigenerare i componenti figli con la nuova prop "key"
      setFocusCount(prev => prev + 1);
    }, [fetchData])
  );

  // Mostra lo spinner a tutto schermo solo al primissimo avvio assoluto
  if (loading && !refreshing && focusCount === 0) {
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
      key={`dashboard-focus-${focusCount}`} // 🌟 FORZA IL RE-RENDER COMPLETO: resetta la cache visiva di React
    >
      <View style={[styles.mainContent, { paddingTop: insets.top + 8 }]}>
        
        {/* HEADER */}
        <DashboardHeader 
          userName={userName} 
          theme={theme} 
          onProfilePress={() => router.push("/profile")} 
        />

        {/* FINANCIAL: KPI e Statistiche (Ora reattivo al 100%) */}
        <FinancialOverview 
          stats={stats}
          theme={theme}
          refreshDashboard={fetchData}
          isHistory={false}
          businessType={businessType}
        />
        
        {/* HISTORY: Accesso rapido allo storico */}
        <HistoryBar 
          theme={theme} 
          onPress={() => router.push("/(manager)/(tabs)/shift/history")} 
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
    paddingBottom: 20,
  },
});