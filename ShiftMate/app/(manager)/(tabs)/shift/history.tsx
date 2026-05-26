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
import { FinancialOverview } from "@/components/manager/dashboard/FInancialOverview"; // ◄ AGGIUNTO

const MONTHS_IT = [
  "January", "February", "Mars", "April", "Maj", "Juni",
  "Juli", "August", "September", "October", "November", "December"
];

export default function HistoryScreen() {
  const theme = Colors[useColorScheme() ?? "light"];
  const insets = useSafeAreaInsets();

  // 🕒 Stati per la gestione dei mesi passati
  const now = new Date();
  const [currentYear, setCurrentYear] = useState(now.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(now.getMonth());

  // 🔀 Stato dello switch: 'shifts' (lista turni) oppure 'finance' (report budget)
  const [activeTab, setActiveTab] = useState<"shifts" | "finance">("shifts");

  // 📊 Stati dei dati storici calcolati localmente per mese
  const [filteredHistory, setFilteredHistory] = useState<any[]>([]);
  const [reportStats, setReportStats] = useState<{ departments: any[] }>({ departments: [] });
  const [monthlySpending, setMonthlySpending] = useState(0);
  const [loading, setLoading] = useState(true);

  // 🔌 Fetch dinamico guidato dal mese/anno selezionati
  const loadMonthlyHistory = useCallback(async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;
      if (!userId) return;

      // Intervallo date del mese selezionato
      const startDate = new Date(currentYear, currentMonth, 1).toISOString().split('T')[0];
      const endDate = new Date(currentYear, currentMonth + 1, 0).toISOString().split('T')[0];

      // Scarichiamo solo i turni completati del mese scelto
      const { data: shifts, error } = await supabase
        .from("shifts")
        .select(`
          *,
          department_id,
          departments ( id, name, monthly_budget )
        `)
        .eq("manager_id", userId)
        .eq("status", "completed")
        .gte("shift_date", startDate)
        .lte("shift_date", endDate);

      if (error) throw error;

      const currentShifts = shifts || [];
      setFilteredHistory(currentShifts);

      // 1. Somma totale spending del mese per la HistoryStatsCard
      const totalSpent = currentShifts.reduce((acc, s) => acc + (Number(s.total_pay) || 0), 0);
      setMonthlySpending(totalSpent);

      // 2. Raggruppamento per Dipartimento per il report finanziario
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

      const finalizedDepartments = Object.values(departmentsMap).map((dept: any) => ({
        ...dept,
        availableBudget: dept.plannedBudget - dept.effectiveSpent
      }));

      setReportStats({ departments: finalizedDepartments });

    } catch (error) {
      console.error("Error loading monthly statistics:", error);
    } finally {
      setLoading(false);
    }
  }, [currentYear, currentMonth]);

  // Ricarica quando lo schermo prende il focus o cambiano mese/anno
  useFocusEffect(
    useCallback(() => {
      loadMonthlyHistory();
    }, [loadMonthlyHistory])
  );

  // Navigazione Mesi
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
        
        // 🌟 SPOSTIAMO I SELETTORI NELL'HEADER DELLA LISTA PER UNA UX FLUIDA
        ListHeaderComponent={
          <View style={styles.headerContainer}>
            {/* Selettore del mese */}
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

            {/* Il tuo componente Stats Card integrato con i dati del mese */}
            <HistoryStatsCard spending={monthlySpending} count={filteredHistory.length} theme={theme} />

            {/* Segmented Control / Switch */}
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

            {/* Se siamo in finanza, mostriamo qui dentro il FinancialOverview */}
            {activeTab === "finance" && (
              <View style={styles.financeWrapper}>
                <FinancialOverview stats={reportStats} theme={theme} refreshDashboard={loadMonthlyHistory} />
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
              <Text style={[styles.emptyText, { color: theme.text }]}>No shifts posted in this month.</Text>
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
  
  // Stili Selettore Mese
  dateSelector: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 12, borderRadius: 15, borderWidth: 1, marginBottom: 15 },
  dateText: { fontSize: 14, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.5 },
  arrowBtn: { padding: 6 },

  // Stili Switch Tab
  tabSegmentContainer: { flexDirection: "row", padding: 4, borderRadius: 12, marginTop: 16, marginBottom: 8 },
  tabSegment: { flex: 1, paddingVertical: 10, alignItems: "center", borderRadius: 10 },
  tabLabel: { fontSize: 13, fontWeight: "700" },
  inactiveText: { opacity: 0.4 },

  financeWrapper: { marginTop: 8 },
  emptyContainer: { marginTop: 60, alignItems: "center" },
  emptyText: { fontSize: 14, opacity: 0.4, marginTop: 15, fontWeight: "600" },
});