import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  LayoutAnimation,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  UIManager,
  useColorScheme,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ScreenHeader } from "@/components/shared/Header";
import { ScreenWrapper } from "@/components/shared/wrapper/layout-wrapper";
import { Colors } from "@/constants/theme";
import { useDashboardData } from "@/hooks/manager/useFetchDataDashboard";
import { supabase } from "@/lib/supabase";

// Abilita LayoutAnimation per Android
if (Platform.OS === "android") {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

export default function AnalyticsDashboardPage() {
  const insets = useSafeAreaInsets();
  const theme = Colors[useColorScheme() ?? "light"];
  const { businessId } = useDashboardData();

  const [activeTab, setActiveTab] = useState<"clients" | "workers">("clients");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState<{ workers: any[]; clients: any[] }>({
    workers: [],
    clients: [],
  });
  const [currentDate, setCurrentDate] = useState(new Date());

  const changeMonth = (offset: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + offset);
    setCurrentDate(newDate);
  };

  const loadFinancialReports = async (showLoader = true) => {
    if (!businessId) return;
    try {
      if (showLoader) setLoading(true);

      const startOfMonth = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        1,
      )
        .toISOString()
        .split("T")[0];
      const endOfMonth = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1,
        0,
      )
        .toISOString()
        .split("T")[0];

      const { data: shiftData, error: dbError } = await supabase
        .from("shifts")
        .select(
          `
          total_pay, client_name, shift_date, 
          applications!inner ( status, profiles ( id, name, surname ) )
        `,
        )
        .eq("business_id", businessId)
        .eq("status", "completed")
        .gte("shift_date", startOfMonth)
        .lte("shift_date", endOfMonth);

      if (dbError) throw dbError;

      const workerMap: Record<string, { name: string; amount: number }> = {};
      const clientMap: Record<string, number> = {};

      shiftData?.forEach((shift: any) => {
        const amount = parseFloat(shift.total_pay) || 0;
        if (shift.client_name) {
          clientMap[shift.client_name] =
            (clientMap[shift.client_name] || 0) + amount;
        }
        const app = shift.applications?.[0];
        if (
          app?.status &&
          ["accepted", "approved"].includes(app.status.toLowerCase()) &&
          app.profiles
        ) {
          const profile = Array.isArray(app.profiles)
            ? app.profiles[0]
            : app.profiles;
          const name =
            `${profile.name || ""} ${profile.surname || ""}`.trim() || "Staff";
          if (!workerMap[profile.id])
            workerMap[profile.id] = { name, amount: 0 };
          workerMap[profile.id].amount += amount;
        }
      });

      setReports({
        workers: Object.values(workerMap).sort((a, b) => b.amount - a.amount),
        clients: Object.entries(clientMap)
          .map(([name, amount]) => ({ name, amount }))
          .sort((a, b) => b.amount - a.amount),
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadFinancialReports(true);
    }, [businessId, currentDate]),
  );

  const filteredData = (
    activeTab === "clients" ? reports.clients : reports.workers
  ).filter((item) => item.name?.toLowerCase().includes(search.toLowerCase()));

  const totalAmount = filteredData.reduce((acc, curr) => acc + curr.amount, 0);

  const AnalyticsCard = ({
    item,
    theme,
    progress,
  }: {
    item: { name: string; amount: number };
    theme: any;
    progress: number;
  }) => (
    <View style={[styles.card, { backgroundColor: theme.card }]}>
      <View style={styles.cardHeader}>
        <View>
          <Text style={[styles.cardTitle, { color: theme.text }]}>
            {item.name}
          </Text>
          <Text style={[styles.subtitle, { color: theme.text + "80" }]}>
            Performance index
          </Text>
        </View>
        <View
          style={[styles.amountBadge, { backgroundColor: theme.background }]}
        >
          <Text style={[styles.cardAmount, { color: theme.text }]}>
            {Math.round(item.amount).toLocaleString()}
          </Text>
        </View>
      </View>
      <View style={[styles.progressBarBg, { backgroundColor: theme.border }]}>
        <View
          style={[
            styles.progressBarFill,
            { backgroundColor: theme.tint, width: `${progress}%` },
          ]}
        />
      </View>
    </View>
  );

  return (
    <ScreenWrapper scrollable={true}>
      <ScreenHeader
        kpi="Monthly Overview"
        title="Analytics"
        theme={theme}
        containerStyle={{ paddingTop: insets.top }}
      />

      <View style={styles.datePicker}>
        <Pressable onPress={() => changeMonth(-1)}>
          <Ionicons name="chevron-back" size={24} color={theme.text} />
        </Pressable>
        <Text style={[styles.dateText, { color: theme.text }]}>
          {currentDate.toLocaleString("default", {
            month: "long",
            year: "numeric",
          })}
        </Text>
        <Pressable onPress={() => changeMonth(1)}>
          <Ionicons name="chevron-forward" size={24} color={theme.text} />
        </Pressable>
      </View>

      <View style={[styles.totalCard, { backgroundColor: theme.text }]}>
        <Text style={styles.totalLabel}>
          TOTAL FOR{" "}
          {currentDate
            .toLocaleString("default", { month: "long" })
            .toUpperCase()}
        </Text>
        <Text style={styles.totalValue}>
          {Math.round(totalAmount).toLocaleString()} SEK
        </Text>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          placeholder="Search..."
          value={search}
          onChangeText={setSearch}
          style={[
            styles.searchInput,
            { backgroundColor: theme.card, color: theme.text },
          ]}
        />
      </View>

      <View style={[styles.tabContainer, { backgroundColor: theme.card }]}>
        {["clients", "workers"].map((tab) => (
          <Pressable
            key={tab}
            onPress={() => {
              LayoutAnimation.configureNext(
                LayoutAnimation.Presets.easeInEaseOut,
              );
              setActiveTab(tab as any);
            }}
            style={[
              styles.tabButton,
              activeTab === tab && { backgroundColor: theme.text },
            ]}
          >
            <Text
              style={{
                color: activeTab === tab ? theme.background : theme.text,
                fontWeight: "bold",
              }}
            >
              {tab === "clients" ? "Clients" : "Staff Pay"}
            </Text>
          </Pressable>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 20 }} />
      ) : filteredData.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons
            name="bar-chart-outline"
            size={42}
            color={theme.text}
            style={{ opacity: 0.3 }}
          />
          <Text style={[styles.emptyTitle, { color: theme.text }]}>
            No data found
          </Text>
        </View>
      ) : (
        <View style={styles.listContainer}>
          {filteredData.map((item, index) => {
            const maxAmount = Math.max(...filteredData.map((d) => d.amount));
            const progress =
              maxAmount > 0 ? (item.amount / maxAmount) * 100 : 0;
            return (
              <AnalyticsCard
                key={index}
                item={item}
                theme={theme}
                progress={progress}
              />
            );
          })}
        </View>
      )}
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  datePicker: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 15,
    gap: 20,
  },
  dateText: { fontSize: 18, fontWeight: "800" },
  totalCard: {
    padding: 24,
    borderRadius: 24,
    marginHorizontal: 24,
    marginBottom: 24,
    alignItems: "center",
  },
  totalLabel: {
    color: "#FFF",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.5,
    opacity: 0.7,
  },
  totalValue: { color: "#FFF", fontSize: 36, fontWeight: "800", marginTop: 8 },
  searchContainer: { paddingHorizontal: 24, marginBottom: 16 },
  searchInput: { height: 50, borderRadius: 16, paddingHorizontal: 20 },
  tabContainer: {
    flexDirection: "row",
    padding: 4,
    borderRadius: 16,
    marginBottom: 20,
    marginHorizontal: 24,
  },
  tabButton: {
    flex: 1,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  listContainer: { paddingHorizontal: 24, paddingBottom: 40 },
  card: {
    padding: 20,
    borderRadius: 24,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  cardTitle: { fontSize: 16, fontWeight: "700" },
  subtitle: { fontSize: 12, marginTop: 4 },
  cardAmount: { fontSize: 16, fontWeight: "800" },
  amountBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
  },
  progressBarBg: { height: 6, borderRadius: 3, overflow: "hidden" },
  progressBarFill: { height: "100%", borderRadius: 3 },
  emptyContainer: { marginTop: 60, alignItems: "center" },
  emptyTitle: { fontSize: 18, fontWeight: "800", marginTop: 16 },
});
