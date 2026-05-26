import React, { useState, useCallback } from "react";
import { View, Text, StyleSheet, FlatList, ActivityIndicator, useColorScheme, Pressable } from "react-native";
import { Colors } from "@/constants/theme";
import { useFocusEffect, Stack, router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { supabase } from "@/lib/supabase";
import { ScreenWrapper } from "@/components/shared/wrapper/layout-wrapper";
import { Ionicons } from "@expo/vector-icons";
import { HistoryStatsCard } from "@/components/manager/history/HistoryStatsCard";
import { FinancialOverview } from "@/components/manager/dashboard/FinancialOverview";
import { ShiftCard } from "@/components/shared/shiftCard/ShiftCard";


const MONTHS_IT = [
  "Januari", "February", "Mars", "April", "Maj", "Juni",
  "Juli", "August", "September", "October", "November", "December"
];

export default function HistoryScreen() {
  const theme = Colors[useColorScheme() ?? "light"];
  const insets = useSafeAreaInsets();

  const now = new Date();
  const [currentYear, setCurrentYear] = useState(now.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(now.getMonth());
  const [activeTab, setActiveTab] = useState<"shifts" | "finance">("shifts");

  const [filteredHistory, setFilteredHistory] = useState<any[]>([]);
  const [reportStats, setReportStats] = useState<{ departments: any[] }>({ departments: [] });
  const [monthlySpending, setMonthlySpending] = useState(0);
  const [loading, setLoading] = useState(true);

  const loadMonthlyHistory = useCallback(async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;
      if (!userId) return;

      // 1. Recuperiamo il profilo del manager per avere il business_id
      const { data: profile } = await supabase
        .from("profiles")
        .select("business_id")
        .eq("id", userId)
        .single();

      const businessId = profile?.business_id;
      if (!businessId) return;

      // 2. Scarichiamo TUTTI i dipartimenti reali del locale
      const { data: allDepartments, error: deptError } = await supabase
        .from("departments")
        .select("id, name, monthly_budget")
        .eq("business_id", businessId);

      if (deptError) throw deptError;

      // Intervallo date del mese selezionato
      const startDate = new Date(currentYear, currentMonth, 1).toISOString().split('T')[0];
      const endDate = new Date(currentYear, currentMonth + 1, 0).toISOString().split('T')[0];

      // 3. Scarichiamo i turni includendo la relazione del nome dipartimento
      const { data: shifts, error: shiftError } = await supabase
        .from("shifts")
        .select(`
          *,
          departments (
            name
          )
        `)
        .eq("manager_id", userId)
        .gte("shift_date", startDate)
        .lte("shift_date", endDate);

      if (shiftError) throw shiftError;

      const currentShifts = shifts || [];
      setFilteredHistory(currentShifts);

      // Somma totale spending del mese per la HistoryStatsCard
      const totalSpent = currentShifts.reduce((acc, s) => acc + (Number(s.total_pay) || 0), 0);
      setMonthlySpending(totalSpent);

      // 4. STRUTTURAZIONE RIGIDA DEI BUDGET (Anche con 0 turni)
      const finalizedDepartments = (allDepartments || []).map((dept) => {
        const deptShifts = currentShifts.filter((s) => s.department_id === dept.id);
        const effectiveSpent = deptShifts.reduce((acc, s) => acc + (Number(s.total_pay) || 0), 0);
        const plannedBudget = Number(dept.monthly_budget) || 0;

        return {
          id: dept.id,
          name: dept.name,
          plannedBudget,
          effectiveSpent,
          availableBudget: plannedBudget - effectiveSpent,
        };
      });

      setReportStats({ departments: finalizedDepartments });

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

            <HistoryStatsCard spending={monthlySpending} count={filteredHistory.length} theme={theme} />

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

            {activeTab === "finance" && (
              <View style={styles.financeWrapper}>
                <FinancialOverview 
                  stats={reportStats} 
                  theme={theme} 
                  refreshDashboard={loadMonthlyHistory}
                />
              </View>
            )}
          </View>
        }

        renderItem={activeTab === "shifts" ? ({ item }) => {
         const safeItem = {
            ...item,
            status: "completed"
          };

          return (
            <ShiftCard 
              item={safeItem} 
              onPress={() => router.push(`/(manager)/(tabs)/shift/${item.id}`)}
              variant="manager"
            />
          );
        } : null}

        ListEmptyComponent={
          activeTab === "shifts" ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="calendar-outline" size={48} color={theme.text} style={{ opacity: 0.1 }} />
              <Text style={[styles.emptyText, { color: theme.text }]}>
                No shifts posted in this month.
              </Text>
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
  emptyContainer: { 
    flex: 1,
    marginTop: 50, 
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    paddingHorizontal: 20,
  },
  emptyText: { 
    fontSize: 14, 
    opacity: 0.4, 
    marginTop: 12, 
    marginBottom: 20, 
    fontWeight: "600",
    textAlign: "center"
  },
});