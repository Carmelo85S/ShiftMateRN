// /(manager)/(tabs)/dashboard.tsx
import { View, Text, ScrollView, StyleSheet, Pressable } from "react-native";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import { router } from "expo-router";

type Stats = {
  totalWorkers: number;
  totalShifts: number;
};

export default function Dashboard() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];

  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Esempio: conteggio workers
        const { count: workersCount } = await supabase
          .from("profiles")
          .select("id", { count: "exact" })
          .eq("role", "worker");

        const { data: userData } = await supabase.auth.getUser();
        const user = userData.user;

        const { count: shiftsCount } = await supabase
          .from("shifts")
          .select("id", { count: "exact" })
          .eq("manager_id", user?.id); // solo i tuoi shift

        setStats({
          totalWorkers: workersCount || 0,
          totalShifts: shiftsCount || 0,
        });
      } catch (error) {
        console.log("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <Text style={{ color: theme.text }}>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={{ padding: 16 }}
    >
      <Text style={[styles.title, { color: theme.text }]}>Dashboard</Text>

      <View style={[styles.card, { backgroundColor: theme.tint + "22" }]}>
        <Text style={[styles.cardTitle, { color: theme.text }]}>
          Total Workers
        </Text>
        <Text style={[styles.cardValue, { color: theme.text }]}>
          {stats?.totalWorkers}
        </Text>
      </View>

      <View style={[styles.card, { backgroundColor: theme.tint + "22" }]}>
        <Text style={[styles.cardTitle, { color: theme.text }]}>
          Total Shifts
        </Text>
        <Text style={[styles.cardValue, { color: theme.text }]}>
          {stats?.totalShifts}
        </Text>
      </View>

      <Pressable
        style={[styles.button, { backgroundColor: theme.tint }]}
        onPress={async () => {
          await supabase.auth.signOut();
          router.replace("/auth/login")
        }}
      >
        <Text style={{ color: "#fff", fontWeight: "bold" }}>Logout</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 28, fontWeight: "bold", marginBottom: 24 },
  card: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  cardTitle: { fontSize: 18, marginBottom: 8 },
  cardValue: { fontSize: 24, fontWeight: "bold" },
  button: {
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 24,
  },
});