import { Colors } from "@/constants/theme";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  Dimensions,
  FlatList,
  Pressable,
  RefreshControl,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ShiftCard } from "@/components/shared/shiftCard/ShiftCard";
import { EmptyShifts } from "@/components/worker/shifts/EmptyShifts";
import { ShiftsHeader } from "@/components/worker/shifts/ShiftsHeader";
import { TabSelector } from "@/components/worker/shifts/TabSelector";

import { useClientSideFiltering } from "@/hooks/worker/shifts/useClientSideFiltering";
import { useLoadShiftsBoard } from "@/hooks/worker/shifts/useLoadShiftsBoard";
import { supabase } from "@/lib/supabase";
const { width } = Dimensions.get("window");

export default function WorkerShifts() {
  const theme = Colors.light;
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const {
    shifts,
    myBusinessShifts,
    loading,
    refreshing,
    isGuest,
    refresh,
    myApplications,
  } = useLoadShiftsBoard();
  const { activeTab, setActiveTab, displayedShifts, myShiftsCount } =
    useClientSideFiltering(shifts, myBusinessShifts, myApplications);

  const [needsOnboarding, setNeedsOnboarding] = useState<boolean | null>(null);

  const checkOnboarding = async () => {
    if (isGuest) return;

    const { data: userData } = await supabase.auth.getUser();

    const { data: onBoarding } = await supabase
      .from("user_stripe_data")
      .select("onboarding_completed")
      .eq("id", userData.user?.id)
      .maybeSingle();

    setNeedsOnboarding(!onBoarding?.onboarding_completed);
  };

  checkOnboarding();

  useFocusEffect(
    useCallback(() => {
      checkOnboarding();
    }, [isGuest]),
  );

  console.log("needsOnboarding", needsOnboarding);

  // If the user is not a guest and has no shifts in their business, we consider them a candidate.
  const isCandidate = !isGuest && myBusinessShifts.length === 0;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <FlatList
        data={displayedShifts}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.listContent,
          { paddingTop: insets.top + 20, paddingBottom: 120 },
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => refresh?.()}
            tintColor={theme.tint}
          />
        }
        ListHeaderComponent={() => (
          <>
            {/* Banner Onboarding - Visualizzato solo se necessario */}
            {needsOnboarding === true && (
              <View style={styles.onboardingBanner}>
                <View style={styles.bannerContent}>
                  <Text style={styles.bannerTitle}>Configura i pagamenti</Text>
                  <Text style={styles.bannerSubtitle}>
                    Completa l'onboarding per ricevere i compensi.
                  </Text>
                </View>
                <Pressable
                  style={styles.ctaButton}
                  onPress={() =>
                    router.push("/(worker)/stripe-worker-onboarding")
                  }
                >
                  <Text style={styles.ctaText}>Inizia</Text>
                </Pressable>
              </View>
            )}

            <ShiftsHeader
              isGuest={isGuest}
              theme={theme}
              router={router}
              totalAvailable={displayedShifts.length}
            />

            {/* Se è un Guest o un Candidate esterno, nascondiamo la TabSelector o la limitiamo */}
            {!isGuest && !isCandidate && (
              <TabSelector
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                totalGlobal={shifts.length}
                totalMine={myShiftsCount} // Turni della sua azienda (Worker)
                totalApplications={myApplications.length} // Le sue candidature
              />
            )}

            {/* Opzionale: Se è un Candidate, puoi mostrare una TabSelector semplificata senza la Tab aziendale */}
            {isCandidate && (
              <TabSelector
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                totalGlobal={shifts.length}
                totalMine={0} // Sarà nascosto o disattivato dentro il componente TabSelector
                totalApplications={myApplications.length}
                hideWorkplaceTab={true} // Se il tuo TabSelector accetta questa prop per nascondere il bottone
              />
            )}
          </>
        )}
        renderItem={({ item }) => {
          // Cerchiamo la candidatura controllando l'ID del turno relazionato in modo sicuro
          const application = myApplications.find(
            (app: any) =>
              String(app.shift_id || app.shifts?.id) === String(item.id),
          );

          // Estraiamo lo status normalizzato dal DB
          const appStatus = application?.status?.toLowerCase();

          const isConfirmed = appStatus === "accepted";
          const isPending = appStatus === "applied";
          const isRejected = appStatus === "rejected";

          return (
            <ShiftCard
              item={item}
              variant="worker"
              isApplied={isConfirmed}
              isPending={isPending}
              isRejected={isRejected}
              onPress={() => router.push(`/(worker)/shift/${item.id}`)}
            />
          );
        }}
        ListEmptyComponent={() => (
          <EmptyShifts loading={loading} activeTab={activeTab} theme={theme} />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF", paddingTop: 50 },
  listContent: { paddingHorizontal: 24 },
  columnWrapper: {
    justifyContent: "space-between",
    marginBottom: 16,
  },
  onboardingBanner: {
    backgroundColor: "#FFF8E1", // Colore di avviso leggero
    padding: 16,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#FFE082",
  },
  bannerContent: { flex: 1, marginRight: 12 },
  bannerTitle: {
    fontWeight: "800",
    color: "#B38E00",
    marginBottom: 4,
    fontSize: 14,
  },
  bannerSubtitle: { fontSize: 12, color: "#997400", lineHeight: 16 },
  ctaButton: {
    backgroundColor: "#FFB300",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  ctaText: { color: "#000", fontWeight: "700", fontSize: 12 },
});
