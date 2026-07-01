import { FinancialOverview } from "@/components/manager/dashboard/FinancialOverview";
import { HistoryStatsCard } from "@/components/manager/history/HistoryStatsCard";
import { ShiftCard } from "@/components/shared/shiftCard/ShiftCard";
import { ScreenWrapper } from "@/components/shared/wrapper/layout-wrapper";
import { Colors } from "@/constants/theme";
import { supabase } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import { Stack, router, useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
  useColorScheme,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const MONTHS_IT = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export default function HistoryScreen() {
  const theme = Colors[useColorScheme() ?? "light"];
  const insets = useSafeAreaInsets();

  const now = new Date();
  const [currentYear, setCurrentYear] = useState(now.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(now.getMonth());
  const [activeTab, setActiveTab] = useState<"shifts" | "finance">("shifts");

  // Stati per la gestione del profilo e filtri aziendali
  const [businessType, setBusinessType] = useState<
    "standard" | "staffing" | null
  >(null);

  // Stati dei dati storici del mese selezionato
  const [filteredHistory, setFilteredHistory] = useState<any[]>([]);
  const [reportStats, setReportStats] = useState<{
    departments: any[];
    clients: any[];
    totalMonthlyRevenue: number;
  }>({
    departments: [],
    clients: [],
    totalMonthlyRevenue: 0,
  });
  const [monthlySpending, setMonthlySpending] = useState(0);

  // 🌟 GESTIONE LOADING OTTIMIZZATA ANTI-SFARFALLIO
  const [isInitialLoading, setIsInitialLoading] = useState(true); // Solo per il primo avvio assoluto
  const [loading, setLoading] = useState(false); // Per i caricamenti silenziosi tra i mesi

  const isPastMonth =
    currentYear < now.getFullYear() ||
    (currentYear === now.getFullYear() && currentMonth < now.getMonth());

  const loadMonthlyHistory = useCallback(async () => {
    try {
      setLoading(true);
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const userId = session?.user?.id;
      if (!userId) return;

      // Recupera il profilo solo se non l'abbiamo ancora fatto
      let bType = businessType;
      if (!bType) {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("name, business_id, businesses ( business_type )")
          .eq("id", userId)
          .single();

        bType = (profileData?.businesses as any)?.business_type || "standard";
        setBusinessType(bType);
      }

      const pad = (n: number) => String(n).padStart(2, "0");
      const startDate = `${currentYear}-${pad(currentMonth + 1)}-01`;
      const endDate = `${currentYear}-${pad(currentMonth + 1)}-${pad(new Date(currentYear, currentMonth + 1, 0).getDate())}`;

      let query = supabase
        .from("shifts")
        .select(
          `
          *,
          department_id,
          departments ( id, name, monthly_budget )
        `,
        )
        .eq("manager_id", userId)
        .gte("shift_date", startDate)
        .lte("shift_date", endDate);

      if (bType === "standard") {
        query = query.eq("status", "completed");
      } else {
        query = query.in("status", ["completed", "filled", "assigned", "open"]);
      }

      const { data: shifts, error } = await query;
      if (error) throw error;

      const currentShifts = shifts || [];
      setFilteredHistory(currentShifts);

      const totalSpent = currentShifts.reduce(
        (acc, s) => acc + (Number(s.total_pay) || 0),
        0,
      );
      setMonthlySpending(totalSpent);

      let finalizedDepartments: any[] = [];
      let clientStatsArray: any[] = [];

      if (bType === "staffing") {
        const uniqueClients = Array.from(
          new Set(
            currentShifts.map((s) => s.client_name?.trim() || "Generic Client"),
          ),
        );

        clientStatsArray = uniqueClients.map((clientName) => {
          const clientShifts = currentShifts.filter(
            (s) => (s.client_name?.trim() || "Generic Client") === clientName,
          );
          const revenueSum = clientShifts.reduce(
            (acc, s) => acc + (Number(s.total_pay) || 0),
            0,
          );
          return {
            id: clientName,
            name: clientName,
            revenue: revenueSum,
          };
        });
      } else {
        const departmentsMap: { [key: string]: any } = {};
        currentShifts.forEach((shift: any) => {
          const dept = shift.departments;
          if (!dept) return;

          if (!departmentsMap[dept.id]) {
            departmentsMap[dept.id] = {
              id: dept.id,
              name: dept.name,
              plannedBudget: Number(dept.monthly_budget) || 0,
              effectiveSpent: 0,
            };
          }
          departmentsMap[dept.id].effectiveSpent +=
            Number(shift.total_pay) || 0;
        });

        finalizedDepartments = Object.values(departmentsMap).map(
          (dept: any) => ({
            ...dept,
            availableBudget: dept.plannedBudget - dept.effectiveSpent,
          }),
        );
      }

      setReportStats({
        departments: finalizedDepartments,
        clients: clientStatsArray,
        totalMonthlyRevenue: totalSpent,
      });
    } catch (error) {
      console.error("Error loading monthly statistics:", error);
    } finally {
      setIsInitialLoading(false);
      setLoading(false);
    }
  }, [currentYear, currentMonth, businessType]);

  useFocusEffect(
    useCallback(() => {
      loadMonthlyHistory();
    }, [loadMonthlyHistory]),
  );

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((prev) => prev - 1);
    } else {
      setCurrentMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((prev) => prev + 1);
    } else {
      setCurrentMonth((prev) => prev + 1);
    }
  };

  // Blocco a schermo intero solo al primissimo avvio assoluto
  if (isInitialLoading || businessType === null) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="small" color={theme.text} />
      </View>
    );
  }

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      {/* Selettore dei mesi */}
      <View
        style={[
          styles.dateSelector,
          { backgroundColor: theme.card, borderColor: theme.border },
        ]}
      >
        <Pressable onPress={handlePrevMonth} style={styles.arrowBtn}>
          <Ionicons name="chevron-back" size={20} color={theme.text} />
        </Pressable>
        <Text style={[styles.dateText, { color: theme.text }]}>
          {MONTHS_IT[currentMonth]} {currentYear}
        </Text>
        <Pressable onPress={handleNextMonth} style={styles.arrowBtn}>
          <Ionicons name="chevron-forward" size={20} color={theme.text} />
        </Pressable>
      </View>

      {/* KPI Card riassuntive del mese */}
      <HistoryStatsCard
        spending={monthlySpending}
        count={filteredHistory.length}
        theme={theme}
      />

      {/* Segmented Control Tabs */}
      <View
        style={[styles.tabSegmentContainer, { backgroundColor: theme.card }]}
      >
        <Pressable
          onPress={() => setActiveTab("shifts")}
          style={[
            styles.tabSegment,
            activeTab === "shifts" && { backgroundColor: theme.background },
          ]}
        >
          <Text
            style={[
              styles.tabLabel,
              { color: theme.text },
              activeTab !== "shifts" && styles.inactiveText,
            ]}
          >
            Past Shifts
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setActiveTab("finance")}
          style={[
            styles.tabSegment,
            activeTab === "finance" && { backgroundColor: theme.background },
          ]}
        >
          <Text
            style={[
              styles.tabLabel,
              { color: theme.text },
              activeTab !== "finance" && styles.inactiveText,
            ]}
          >
            Finance Report
          </Text>
        </Pressable>
      </View>
    </View>
  );

  return (
    <ScreenWrapper scrollable={activeTab === "finance"}>
      <Stack.Screen
        options={{ title: "Shifts History", headerShadowVisible: false }}
      />

      {/* 🌟 EFFETTO OPACITÀ LEGGERO: I dati caricano in background senza smontare la UI */}
      <View style={[{ flex: 1 }, loading && styles.backgroundLoading]}>
        {activeTab === "shifts" ? (
          <FlatList
            data={filteredHistory}
            keyExtractor={(item) => item.id}
            numColumns={2}
            columnWrapperStyle={styles.columnRow}
            contentContainerStyle={[{ paddingBottom: insets.bottom + 40 }]}
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={renderHeader()}
            renderItem={({ item }) => (
              <ShiftCard
                item={item}
                onPress={() =>
                  router.push(`/(manager)/(tabs)/shift/${item.id}`)
                }
              />
            )}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons
                  name="calendar-outline"
                  size={48}
                  color={theme.text}
                  style={{ opacity: 0.1 }}
                />
                <Text
                  style={[
                    styles.emptyText,
                    { color: theme.text, marginBottom: isPastMonth ? 0 : 24 },
                  ]}
                >
                  No shifts posted in this month.
                </Text>
                {!isPastMonth && (
                  <Pressable
                    style={({ pressed }) => [
                      styles.btnCreateShift,
                      { backgroundColor: theme.text },
                      pressed && {
                        opacity: 0.85,
                        transform: [{ scale: 0.98 }],
                      },
                    ]}
                    onPress={() => router.push("/(manager)/(tabs)/create")}
                  >
                    <Text style={[styles.btnText, { color: theme.background }]}>
                      Schedule a Shift
                    </Text>
                  </Pressable>
                )}
              </View>
            }
          />
        ) : (
          <View style={{ paddingBottom: insets.bottom + 40 }}>
            {renderHeader()}
            <View style={styles.financeWrapper}>
              <FinancialOverview
                stats={reportStats}
                theme={theme}
                refreshDashboard={loadMonthlyHistory}
                isHistory={true}
                businessType={businessType}
              />
            </View>
          </View>
        )}
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  columnRow: {
    justifyContent: "space-between",
    marginBottom: 12,
  },
  headerContainer: {
    marginTop: 20,
    marginBottom: 8,
  },
  dateSelector: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 20,
    borderWidth: 0, // Tolto bordo per un look più pulito
    backgroundColor: "rgba(0,0,0,0.03)", // Grigio leggero invece di card forte
    marginBottom: 20,
  },
  dateText: {
    fontSize: 15,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 1.2,
  },
  arrowBtn: {
    padding: 10,
    backgroundColor: "#FFF",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  tabSegmentContainer: {
    flexDirection: "row",
    padding: 4,
    borderRadius: 16,
    marginTop: 24,
    marginBottom: 20,
    backgroundColor: "rgba(0,0,0,0.03)",
  },
  tabSegment: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 12,
  },
  tabLabel: {
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  inactiveText: { opacity: 0.3 },
  financeWrapper: {
    marginTop: 8,
  },
  emptyContainer: {
    marginTop: 60,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    opacity: 0.5,
    marginTop: 16,
    fontWeight: "500",
    textAlign: "center",
  },
  btnCreateShift: {
    marginTop: 24,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  btnText: { fontSize: 15, fontWeight: "800" },
  backgroundLoading: { opacity: 0.5 },
});
