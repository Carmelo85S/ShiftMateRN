import React, { useState, useCallback, useEffect } from "react";
import { View, Text, StyleSheet, FlatList, ActivityIndicator, useColorScheme, Pressable } from "react-native";
import { Colors } from "@/constants/theme";
import { useFocusEffect, Stack, router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { supabase } from "@/lib/supabase";
import { ScreenWrapper } from "@/components/shared/wrapper/layout-wrapper";
import { ShiftCard } from "@/components/shared/shiftCard/ShiftCard";
import { Ionicons } from "@expo/vector-icons";
import { HistoryStatsCard } from "@/components/manager/history/HistoryStatsCard";
import { FinancialOverview } from "@/components/manager/dashboard/FinancialOverview";

const MONTHS_IT = [
  "January", "February", "Mars", "April", "Maj", "Juni",
  "Juli", "August", "September", "October", "November", "December"
];

export default function HistoryScreen() {
  const theme = Colors[useColorScheme() ?? "light"];
  const insets = useSafeAreaInsets();

  // State for past months navigation
  const now = new Date();
  const [currentYear, setCurrentYear] = useState(now.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(now.getMonth());

  // Tab switch state
  const [activeTab, setActiveTab] = useState<"shifts" | "finance">("shifts");

  // Business type tracking
  const [businessType, setBusinessType] = useState<"standard" | "staffing">("standard");

  // Historical data states calculated locally per month
  const [filteredHistory, setFilteredHistory] = useState<any[]>([]);
  const [reportStats, setReportStats] = useState<{ departments: any[]; clients: any[]; totalMonthlyRevenue: number }>({ 
    departments: [], 
    clients: [], 
    totalMonthlyRevenue: 0 
  });
  const [monthlySpending, setMonthlySpending] = useState(0);
  const [loading, setLoading] = useState(true);

  // Check if the selected month/year is in the past compared to the current date
  const isPastMonth = 
    currentYear < now.getFullYear() || 
    (currentYear === now.getFullYear() && currentMonth < now.getMonth());

  // Dynamic fetch driven by selected month and year
  const loadMonthlyHistory = useCallback(async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;
      if (!userId) return;

      // 1. Recupera il profilo e determina dinamicamente il tipo di business
      const { data: profileData } = await supabase
        .from("profiles")
        .select("name, business_id, businesses ( business_type )")
        .eq("id", userId)
        .single();
      
      const bType = (profileData?.businesses as any)?.business_type || "standard";
      setBusinessType(bType);

      // Calculate date range for the selected month (Safe strings generation)
      const pad = (n: number) => String(n).padStart(2, "0");
      const startDate = `${currentYear}-${pad(currentMonth + 1)}-01`;
      const endDate = `${currentYear}-${pad(currentMonth + 1)}-${pad(new Date(currentYear, currentMonth + 1, 0).getDate())}`;

      // 2. Query flessibile sui turni storici del mese corrente
      let query = supabase
        .from("shifts")
        .select(`
          *,
          department_id,
          departments ( id, name, monthly_budget )
        `)
        .eq("manager_id", userId)
        .gte("shift_date", startDate)
        .lte("shift_date", endDate);

      // Se ristorante filtra solo i completati, per l'agenzia includiamo anche i turni attivi/assegnati del mese
      if (bType === "standard") {
        query = query.eq("status", "completed");
      } else {
        query = query.in("status", ["completed", "filled", "assigned", "open"]);
      }

      const { data: shifts, error } = await query;
      if (error) throw error;

      const currentShifts = shifts || [];
      setFilteredHistory(currentShifts);

      // Calcola i ricavi / costi totali generati nel mese selezionato
      const totalSpent = currentShifts.reduce((acc, s) => acc + (Number(s.total_pay) || 0), 0);
      setMonthlySpending(totalSpent);

      let finalizedDepartments: any[] = [];
      let clientStatsArray: any[] = [];

      // ==========================================
      // 🌟 AGGREGAZIONE DATI IN BASE AL BUSINESS
      // ==========================================
      if (bType === "staffing") {
        // Estrazione dei clienti unici per la vista Staffing Agency
        const uniqueClients = Array.from(
          new Set(currentShifts.map(s => s.client_name?.trim() || "Generic Client"))
        );

        clientStatsArray = uniqueClients.map(clientName => {
          const clientShifts = currentShifts.filter(
            s => (s.client_name?.trim() || "Generic Client") === clientName
          );
          const revenueSum = clientShifts.reduce((acc, s) => acc + (Number(s.total_pay) || 0), 0);
          return {
            id: clientName,
            name: clientName,
            revenue: revenueSum
          };
        });
      } else {
        // Raggruppamento classico per Dipartimenti (Ristoranti Standard)
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
          departmentsMap[dept.id].effectiveSpent += Number(shift.total_pay) || 0;
        });

        finalizedDepartments = Object.values(departmentsMap).map((dept: any) => ({
          ...dept,
          availableBudget: dept.plannedBudget - dept.effectiveSpent
        }));
      }

      // Imposta lo stato globale formattato in modo asimmetrico per la dashboard
      setReportStats({ 
        departments: finalizedDepartments,
        clients: clientStatsArray,
        totalMonthlyRevenue: totalSpent
      });

    } catch (error) {
      console.error("Error loading monthly statistics:", error);
    } finally {
      setLoading(false);
    }
  }, [currentYear, currentMonth]);

  useFocusEffect(
    useCallback(() => {
      loadMonthlyHistory();
    }, [loadMonthlyHistory])
  );

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="small" color={theme.text} />
      </View>
    );
  }

  return (
    <ScreenWrapper scrollable={false}>
      <Stack.Screen options={{ title: "Shifts History", headerShadowVisible: false }} />
      
      <FlatList
        data={activeTab === "shifts" ? filteredHistory : []}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.columnRow}
        contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.headerContainer}>
            {/* Month selector component */}
            <View style={[styles.dateSelector, { backgroundColor: theme.card, borderColor: theme.border }]}>
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

            {/* Stats Card component integrated with the monthly data */}
            <HistoryStatsCard spending={monthlySpending} count={filteredHistory.length} theme={theme} />

            {/* Segmented Control Switch */}
            <View style={[styles.tabSegmentContainer, { backgroundColor: theme.card }]}>
              <Pressable 
                onPress={() => setActiveTab("shifts")}
                style={[styles.tabSegment, activeTab === "shifts" && { backgroundColor: theme.background }]}
              >
                <Text style={[styles.tabLabel, { color: theme.text }, activeTab !== "shifts" && styles.inactiveText]}>
                  Past Shifts
                </Text>
              </Pressable>
              <Pressable 
                onPress={() => setActiveTab("finance")}
                style={[styles.tabSegment, activeTab === "finance" && { backgroundColor: theme.background }]}
              >
                <Text style={[styles.tabLabel, { color: theme.text }, activeTab !== "finance" && styles.inactiveText]}>
                  Finance Report
                </Text>
              </Pressable>
            </View>

            {/* Render FinancialOverview when finance tab is active */}
            {activeTab === "finance" && (
              <View style={styles.financeWrapper}>
                <FinancialOverview 
                  stats={reportStats} 
                  theme={theme} 
                  refreshDashboard={loadMonthlyHistory} 
                  isHistory={true} 
                  businessType={businessType} // 🌟 PASSO IL BUSINESS TYPE REALE
                />
              </View>
            )}
          </View>
        }

        renderItem={activeTab === "shifts" ? ({ item }) => (
          <ShiftCard 
            item={item} 
            onPress={() => router.push(`/(manager)/(tabs)/shift/${item.id}`)} 
          />
        ) : null}

        ListEmptyComponent={
          activeTab === "shifts" ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="calendar-outline" size={48} color={theme.text} style={{ opacity: 0.1 }} />
              <Text style={[styles.emptyText, { color: theme.text, marginBottom: isPastMonth ? 0 : 24 }]}>
                No shifts posted in this month.
              </Text>
              
              {!isPastMonth && (
                <Pressable 
                  style={({ pressed }) => [
                    styles.btnCreateShift, 
                    { backgroundColor: theme.text }, 
                    pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] }
                  ]}
                  onPress={() => router.push('/(manager)/(tabs)/create')} 
                >
                  <Text style={[styles.btnText, { color: theme.background }]}>
                    Schedule a Shift
                  </Text>
                </Pressable>
              )}
            </View>
          ) : null
        }
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  listContent: { paddingHorizontal: 20 },
  columnRow: { justifyContent: 'space-between', marginBottom: 4 },
  headerContainer: { marginTop: 16, marginBottom: 16 },
  dateSelector: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 12, borderRadius: 15, borderWidth: 1, marginBottom: 15 },
  dateText: { fontSize: 14, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.5 },
  arrowBtn: { padding: 6 },
  tabSegmentContainer: { flexDirection: "row", padding: 4, borderRadius: 12, marginTop: 16, marginBottom: 8 },
  tabSegment: { flex: 1, paddingVertical: 10, alignItems: "center", borderRadius: 10 },
  tabLabel: { fontSize: 13, fontWeight: "700" },
  inactiveText: { opacity: 0.4 },
  financeWrapper: { marginTop: 8 },
  emptyContainer: { flex: 1, marginTop: 40, alignItems: "center", justifyContent: "center", width: "100%", alignSelf: "center", paddingHorizontal: 20 },
  emptyText: { fontSize: 14, opacity: 0.4, marginTop: 12, fontWeight: "600", textAlign: "center" },
  btnCreateShift: { paddingHorizontal: 28, paddingVertical: 14, borderRadius: 16, justifyContent: "center", alignItems: "center", minWidth: 180, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
  btnText: { fontSize: 14, fontWeight: "700" }
});