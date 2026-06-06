import React, { useCallback } from "react";
import { StyleSheet, View, Text, ActivityIndicator, useColorScheme, Pressable } from "react-native";
import { Colors } from "@/constants/theme";
import { useFocusEffect, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useDashboardData } from "@/hooks/manager/useFetchDataDashboard";
import { useAuth } from "@/hooks/auth/useAuth"; 
import { useCheckActivation } from "@/hooks/stripe/onboarding/useCheckActivation";

import { DashboardHeader } from "@/components/manager/dashboard/DashboardHeader";
import { FinancialOverview } from "@/components/manager/dashboard/FinancialOverview";
import { HistoryBar } from "@/components/manager/dashboard/HistoryBar";
import { UpcomingShifts } from "@/components/manager/dashboard/UpcomingShifts";
import { ScreenWrapper } from "@/components/shared/wrapper/layout-wrapper";

export default function Dashboard() {
  const theme = Colors[useColorScheme() ?? "light"];
  const insets = useSafeAreaInsets();
  const router = useRouter();
  
  const { user, businessId, loading: authLoading } = useAuth();
  const { hasSubscription, onboardingCompleted, loading: subLoading } = useCheckActivation(businessId ?? undefined);


  // 1. Dati Dashboard
  const { 
    userName, 
    businessType,
    stats, 
    upcomingShifts, 
    loading: dataLoading, 
    refreshing, 
    fetchData, 
    onRefresh 
  } = useDashboardData();

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData])
  );

  // Loading unico aggiornato con feedback testuale
  if (dataLoading || subLoading || businessType === null) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.text} />
        <Text style={[styles.loadingText, { color: theme.text }]}>
          {subLoading ? "Updating payment status..." : "Loading dashboard..."}
        </Text>
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
      <View style={[styles.mainContent, { paddingTop: insets.top }]}>
        
        {/* Banner di avviso - Guida l'utente senza bloccarlo 
        {!hasSubscription && (
          <Pressable style={[styles.banner, { backgroundColor: theme.tint }]} onPress={() => router.push("/(manager)/(tabs)/subscription" as any)}>
            <Text style={styles.bannerText}>⚠️ Piano non attivo. Clicca qui per scegliere un piano.</Text>
          </Pressable>
        )}
          */}
        
        {hasSubscription && !onboardingCompleted && (
          <Pressable style={[styles.banner, { backgroundColor: '#FF9F1C' }]} onPress={() => router.push("/(manager)/stripe-onboarding")}>
            <Text style={styles.bannerText}>💳 Complete your payment setup and start offering services.</Text>
          </Pressable>
        )}

        <DashboardHeader 
          userName={userName} 
          theme={theme} 
          onProfilePress={() => router.push("/profile")} 
        />
        
        <FinancialOverview 
          stats={stats}
          theme={theme}
          refreshDashboard={fetchData}
          isHistory={false}
          businessType={businessType}
        />
        
        <HistoryBar 
          theme={theme} 
          onPress={() => router.push("/(manager)/(tabs)/shift/history")} 
        />
        
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
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  wrapperCustom: { paddingHorizontal: 24 },
  mainContent: { flex: 1, paddingBottom: 20 },
  banner: { 
    padding: 16, 
    borderRadius: 16, 
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  bannerText: { 
    color: '#fff', 
    fontWeight: '700', 
    textAlign: 'center',
    fontSize: 14 
  }
});