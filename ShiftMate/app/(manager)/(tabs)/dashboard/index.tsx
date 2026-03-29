import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
} from "react-native";
import { Colors } from "@/constants/theme";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { supabase } from "@/lib/supabase";

type Stats = {
  totalWorkers: number;
  totalShifts: number;
  openShifts: number;
};

type Shift = {
  id: string;
  title: string;
  shift_date: string;
  start_time: string;
  end_time: string;
  status: string;
};

export default function Dashboard() {
  const theme = Colors.light;

  const [stats, setStats] = useState<Stats | null>(null);
  const [nextShift, setNextShift] = useState<Shift | null>(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      const fetchData = async () => {
        setLoading(true);
        try {
          const { data: userData } = await supabase.auth.getUser();
          const user = userData.user;
          if (!user) return;

          // --- STATISTICS ---
          const { count: workersCount } = await supabase
            .from("profiles")
            .select("id", { count: "exact" })
            .eq("role", "worker");

          const { count: shiftsCount } = await supabase
            .from("shifts")
            .select("id", { count: "exact" })
            .eq("manager_id", user.id);

          const { count: openShiftsCount } = await supabase
            .from("shifts")
            .select("id", { count: "exact" })
            .eq("manager_id", user.id)
            .eq("status", "open");

          setStats({
            totalWorkers: workersCount || 0,
            totalShifts: shiftsCount || 0,
            openShifts: openShiftsCount || 0,
          });

          // --- NEXT SHIFT ---
          const today = new Date().toISOString().split("T")[0];
          const { data: shiftData, error } = await supabase
            .from("shifts")
            .select("id, title, shift_date, start_time, end_time, status")
            .eq("manager_id", user.id)
            .gte("shift_date", today)
            .order("shift_date", { ascending: true })
            .limit(1)
            .single();

          if (!error && shiftData) {
            setNextShift(shiftData);
          }
        } catch (error) {
          console.error("Error fetching dashboard data:", error);
        } finally {
          setLoading(false);
        }
      };

      fetchData();
    }, [])
  );

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.tint} />
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={{ padding: 20 }}
      showsVerticalScrollIndicator={false}
    >

      {/* STAT CARDS */}
      <View style={[styles.card, { backgroundColor: theme.tint + "11" }]}>
        <Text style={[styles.cardTitle, { color: theme.text }]}>
          Total Workers
        </Text>
        <Text style={[styles.cardValue, { color: theme.tint }]}>
          {stats?.totalWorkers}
        </Text>
      </View>

      <View style={[styles.card, { backgroundColor: theme.tint + "11" }]}>
        <Text style={[styles.cardTitle, { color: theme.text }]}>
          Total Shifts
        </Text>
        <Text style={[styles.cardValue, { color: theme.tint }]}>
          {stats?.totalShifts}
        </Text>
      </View>

      <View style={[styles.card, { backgroundColor: theme.tint + "11" }]}>
        <Text style={[styles.cardTitle, { color: theme.text }]}>Open Shifts</Text>
        <Text style={[styles.cardValue, { color: theme.tint }]}>
          {stats?.openShifts}
        </Text>
      </View>

      {/* NEXT SHIFT */}
      <Text style={[styles.sectionTitle, { color: theme.text, marginTop: 20 }]}>
        Next Shift
      </Text>
      {nextShift ? (
        <View style={[styles.shiftCard, { backgroundColor: theme.card }]}>
          <Text style={[styles.shiftTitle, { color: theme.text }]}>
            {nextShift.title}
          </Text>
          <Text style={{ color: theme.text, opacity: 0.7 }}>
            {nextShift.shift_date} | {nextShift.start_time} - {nextShift.end_time}
          </Text>
          <Text
            style={{ color: theme.tint, fontWeight: "600", marginTop: 4 }}
          >
            {nextShift.status}
          </Text>
        </View>
      ) : (
        <Text style={{ color: theme.text, opacity: 0.7, marginTop: 10 }}>
          No upcoming shifts
        </Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  title: { fontSize: 28, fontWeight: "700", marginBottom: 24 },

  card: {
    padding: 20,
    borderRadius: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  cardTitle: { fontSize: 16, fontWeight: "600", marginBottom: 8 },
  cardValue: { fontSize: 28, fontWeight: "700" },

  sectionTitle: { fontSize: 18, fontWeight: "700", marginBottom: 12 },

  shiftCard: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  shiftTitle: { fontSize: 16, fontWeight: "600", marginBottom: 4 },
});