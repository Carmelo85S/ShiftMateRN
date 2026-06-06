import React, { useState, useCallback } from "react";
import { 
  View, Text, StyleSheet, TextInput, Pressable, ActivityIndicator, useColorScheme 
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/theme";
import { ScreenWrapper } from "@/components/shared/wrapper/layout-wrapper";
import { Stack, useFocusEffect } from "expo-router";
import { supabase } from "@/lib/supabase";
import { useDashboardData } from "@/hooks/manager/useFetchDataDashboard";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function AnalyticsDashboardPage() {
  const { refreshing, onRefresh } = useDashboardData();
  const insets = useSafeAreaInsets();
  const theme = Colors[useColorScheme() ?? "light"];
  const { businessId } = useDashboardData(); 
  
  const [activeTab, setActiveTab] = useState<"clients" | "workers">("clients");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState<{ workers: any[]; clients: any[] }>({ workers: [], clients: [] });
  const [currentDate, setCurrentDate] = useState(new Date());

  const changeMonth = (offset: number) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + offset);
    setCurrentDate(newDate);
  };

  const loadFinancialReports = async (showLoader = true) => {
    if (!businessId) return;
    try {
      if (showLoader) setLoading(true);
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).toISOString();
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 59, 59).toISOString();

      const { data: shiftData, error: dbError } = await supabase
        .from("shifts")
        .select(`total_pay, client_name, created_at, applications ( status, profiles ( id, name, surname ) )`)
        .eq("business_id", businessId)
        .eq("status", "completed")
        .gte("created_at", startOfMonth)
        .lte("created_at", endOfMonth);

      if (dbError) throw dbError;

      const workerMap: Record<string, { name: string; amount: number }> = {};
      const clientMap: Record<string, number> = {};

      shiftData?.forEach((shift: any) => {
        const amount = parseFloat(shift.total_pay) || 0;
        if (shift.client_name) {
          clientMap[shift.client_name] = (clientMap[shift.client_name] || 0) + amount;
        }
        const app = shift.applications?.[0];
        if (app?.status && ["accepted", "approved"].includes(app.status.toLowerCase()) && app.profiles) {
          const profile = Array.isArray(app.profiles) ? app.profiles[0] : app.profiles;
          const name = `${profile.name || ""} ${profile.surname || ""}`.trim() || "Staff";
          if (!workerMap[profile.id]) workerMap[profile.id] = { name, amount: 0 };
          workerMap[profile.id].amount += amount;
        }
      });

      setReports({
        workers: Object.values(workerMap).sort((a, b) => b.amount - a.amount),
        clients: Object.entries(clientMap).map(([name, amount]) => ({ name, amount })).sort((a, b) => b.amount - a.amount)
      });
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useFocusEffect(useCallback(() => { loadFinancialReports(true); }, [businessId, currentDate]));

  const filteredData = (activeTab === "clients" ? reports.clients : reports.workers).filter(item => 
    item.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <Stack.Screen options={{ headerTitle: "Analytics" }} />
      <ScreenWrapper 
        scrollable={true}
        onRefresh={onRefresh}
        refreshing={refreshing}
        style={styles.wrapperCustom}
      >
        <View style={[styles.contentContainer, { paddingTop: insets.top }]}>
          {/* Filtro Mese */}
          <View style={styles.datePicker}>
            <Pressable onPress={() => changeMonth(-1)}><Ionicons name="chevron-back" size={24} color={theme.text} /></Pressable>
            <Text style={[styles.dateText, { color: theme.text }]}>
              {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
            </Text>
            <Pressable onPress={() => changeMonth(1)}><Ionicons name="chevron-forward" size={24} color={theme.text} /></Pressable>
          </View>

          <View style={styles.searchContainer}>
            <TextInput
              placeholder="Search..."
              value={search}
              onChangeText={setSearch}
              style={[styles.searchInput, { backgroundColor: theme.card, color: theme.text }]}
            />
          </View>

          <View style={[styles.tabContainer, { backgroundColor: theme.card }]}>
            {["clients", "workers"].map((tab) => (
              <Pressable key={tab} onPress={() => setActiveTab(tab as any)} style={[styles.tabButton, activeTab === tab && { backgroundColor: theme.text }]}>
                <Text style={{ color: activeTab === tab ? theme.background : theme.text, fontWeight: 'bold' }}>
                  {tab === "clients" ? "Clients" : "Staff Pay"}
                </Text>
              </Pressable>
            ))}
          </View>

          {loading ? <ActivityIndicator style={{ marginTop: 20 }} /> : (
            <View style={styles.listContainer}>
              {filteredData.map((item, index) => (
                <View key={index} style={[styles.reportRow, { backgroundColor: theme.card }]}>
                  <Text style={{ color: theme.text, fontWeight: '600' }}>{item.name}</Text>
                  <Text style={{ color: theme.text, fontWeight: '700' }}>{Math.round(item.amount).toLocaleString()} SEK</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScreenWrapper>
    </>
  );
}

const styles = StyleSheet.create({
  wrapperCustom: { 
    flex: 1, 
    paddingHorizontal: 0 
  },
  // Questo view deve avere flex 1 per occupare tutto lo spazio verticale
  contentContainer: { 
    flex: 1, 
    paddingTop: 100, 
    paddingBottom: 40 
  },
  datePicker: { 
    flexDirection: 'row', 
    justifyContent: 'center', 
    alignItems: 'center', 
    paddingVertical: 15, 
    gap: 20 
  },
  dateText: { fontSize: 18, fontWeight: '800' },
  searchContainer: { paddingHorizontal: 24, marginBottom: 16 },
  searchInput: { height: 50, borderRadius: 16, paddingHorizontal: 20 },
  tabContainer: { flexDirection: "row", marginHorizontal: 24, padding: 4, borderRadius: 16, marginBottom: 20 },
  tabButton: { flex: 1, height: 40, borderRadius: 12, justifyContent: "center", alignItems: "center" },
  listContainer: { paddingHorizontal: 24 },
  reportRow: { flexDirection: "row", justifyContent: "space-between", padding: 16, borderRadius: 20, marginBottom: 10 }
});