import { Colors } from "@/constants/theme";
import { useAuth } from "@/hooks/auth/useAuth";
import { useDashboardData } from "@/hooks/manager/useFetchDataDashboard";
import { useCheckActivation } from "@/hooks/stripe/onboarding/useCheckActivation";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { DashboardHeader } from "@/components/manager/dashboard/DashboardHeader";
import { FinancialOverview } from "@/components/manager/dashboard/FinancialOverview";
import { HistoryBar } from "@/components/manager/dashboard/HistoryBar";
import { UpcomingShifts } from "@/components/manager/dashboard/UpcomingShifts";
import { ScreenWrapper } from "@/components/shared/wrapper/layout-wrapper";
import { supabase } from "@/lib/supabase";

export default function Dashboard() {
  const theme = Colors[useColorScheme() ?? "light"];
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const { user, businessId } = useAuth();
  const [userRole, setUserRole] = React.useState<"owner" | "manager" | null>(
    null,
  );

  const {
    hasSubscription,
    onboardingCompleted,
    loading: subLoading,
  } = useCheckActivation(
    businessId ?? undefined,
    userRole ?? undefined,
    user?.id,
  );

  // 1. Dati Dashboard
  const {
    userName,
    businessType,
    stats,
    upcomingShifts,
    loading: dataLoading,
    refreshing,
    fetchData,
    onRefresh,
  } = useDashboardData();

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData]),
  );

  // 2. Aggiungi un effetto per determinare il ruolo
  useFocusEffect(
    useCallback(() => {
      async function determineRole() {
        if (!user || !businessId) return;

        const { data } = await supabase
          .from("businesses")
          .select("owner_id")
          .eq("id", businessId)
          .single();

        // Se l'id utente loggato è l'owner_id del business, sei l'owner
        setUserRole(data?.owner_id === user.id ? "owner" : "manager");
      }
      determineRole();
    }, [user, businessId]),
  );

  // 3. Blocca il render finché il ruolo non è calcolato
  if (dataLoading || subLoading || businessType === null || userRole === null) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.text} />
      </View>
    );
  }

  console.log("DEBUG DASHBOARD:", {
    hasSubscription,
    businessId,
    userRole,
  });

  return (
    <ScreenWrapper
      scrollable={true}
      onRefresh={onRefresh}
      refreshing={refreshing}
      style={styles.wrapperCustom}
    >
      <View style={[styles.mainContent, { paddingTop: insets.top }]}>
        {/* 1. BANNER PIANO (Informativo per entrambi) */}
        {!hasSubscription && (
          <Pressable
            style={[
              styles.banner,
              {
                backgroundColor:
                  userRole === "manager" ? "#E63946" : theme.tint,
              },
            ]}
            onPress={() => {
              // Debug per vedere cosa stiamo passando
              console.log("Navigazione verso /subscription con:", {
                businessId: businessId,
                userRole: userRole,
              });

              router.push({
                pathname: "/subscription",
                params: {
                  businessId: String(businessId),
                  userRole: String(userRole),
                },
              });
            }}
          >
            <Text style={styles.bannerText}>
              {userRole === "manager"
                ? "⚠️ Acquista il pacchetto da 600 SEK per attivare il tuo profilo."
                : "⚠️ Nessun piano attivo rilevato per la tua agenzia."}
            </Text>
          </Pressable>
        )}

        {/* 2. BANNER ONBOARDING (SOLO PER L'OWNER) */}
        {/* Mostriamo questo banner se l'abbonamento è attivo MA l'onboarding no */}
        {userRole === "owner" && hasSubscription && !onboardingCompleted && (
          <Pressable
            style={[styles.banner, { backgroundColor: "#FF9F1C" }]} // Colore di avviso diverso
            onPress={() => router.push("/(manager)/stripe-onboarding")}
          >
            <Text style={styles.bannerText}>
              💳 Completa il setup dei pagamenti per iniziare a incassare.
            </Text>
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
          onShiftPress={(id: string) =>
            router.push(`/(manager)/(tabs)/shift/${id}`)
          }
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
    elevation: 3,
  },
  bannerText: {
    color: "#fff",
    fontWeight: "700",
    textAlign: "center",
    fontSize: 14,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
});
