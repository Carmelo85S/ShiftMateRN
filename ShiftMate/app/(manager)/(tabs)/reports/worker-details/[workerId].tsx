import { Colors } from "@/constants/theme";
import { supabase } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Pressable,
    StyleSheet,
    Text,
    View,
    useColorScheme,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function WorkerDetailsScreen() {
  const { workerId, name, month } = useLocalSearchParams();
  const [shifts, setShifts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const insets = useSafeAreaInsets();
  const theme = Colors[useColorScheme() ?? "light"];

  useEffect(() => {
    const fetchWorkerShifts = async () => {
      if (!workerId || !month) return;
      const date = new Date(month as string);
      const start = new Date(
        date.getFullYear(),
        date.getMonth(),
        1,
      ).toISOString();
      const end = new Date(
        date.getFullYear(),
        date.getMonth() + 1,
        0,
      ).toISOString();

      const { data, error } = await supabase
        .from("shifts")
        .select(
          `id, shift_date, client_name, total_pay, status, applications!inner(profile_id)`,
        )
        .eq("applications.profile_id", workerId)
        .gte("shift_date", start)
        .lte("shift_date", end);

      setShifts(data || []);
      setLoading(false);
    };
    fetchWorkerShifts();
  }, [workerId, month]);

  const totalPayable = shifts
    .filter((s) => s.status !== "paid")
    .reduce((acc, curr) => acc + (Number(curr.total_pay) || 0), 0);

  const handlePayAll = () => {
    Alert.alert(
      "Confirm Payment",
      `Proceed to pay ${totalPayable.toLocaleString()} SEK to ${name}?`,
      [
        { text: "Cancel" },
        {
          text: "Confirm",
          onPress: () => console.log("Processing payment..."),
        },
      ],
    );
  };

  if (loading) return <ActivityIndicator style={{ flex: 1 }} />;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <Text style={[styles.title, { color: theme.text }]}>Worker Report</Text>
        <Pressable onPress={() => router.back()} style={styles.closeButton}>
          <Ionicons name="close" size={22} color={theme.text} />
        </Pressable>
      </View>

      {/* Hero Section */}
      <View style={styles.hero}>
        <Text style={[styles.workerName, { color: theme.text }]}>{name}</Text>
        <Text style={[styles.totalAmount, { color: theme.tint }]}>
          {totalPayable.toLocaleString()} SEK
        </Text>
        <Text style={[styles.subLabel, { color: theme.text + "60" }]}>
          Pending Payout
        </Text>
      </View>

      <FlatList
        data={shifts}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Shift History
          </Text>
        }
        renderItem={({ item }) => (
          <View style={[styles.card, { backgroundColor: theme.card }]}>
            <View style={styles.dateBadge}>
              <Text style={styles.day}>
                {new Date(item.shift_date).getDate()}
              </Text>
              <Text style={styles.month}>
                {new Date(item.shift_date).toLocaleString("default", {
                  month: "short",
                })}
              </Text>
            </View>
            <View style={styles.cardInfo}>
              <Text style={[styles.client, { color: theme.text }]}>
                {item.client_name}
              </Text>
              <Text style={{ color: theme.text + "70", fontSize: 12 }}>
                {item.status}
              </Text>
            </View>
            {item.status !== "paid" ? (
              <Pressable
                style={styles.payButton}
                onPress={() => Alert.alert("Pay", "Pay this shift?")}
              >
                <Text style={styles.payButtonText}>Pay</Text>
              </Pressable>
            ) : (
              <Ionicons name="checkmark-circle" size={24} color="#34C759" />
            )}
          </View>
        )}
      />

      {/* Action Bar Fissa */}
      {totalPayable > 0 && (
        <View
          style={[
            styles.footer,
            { backgroundColor: theme.card, paddingBottom: insets.bottom + 15 },
          ]}
        >
          <View>
            <Text style={{ color: theme.text + "80", fontSize: 12 }}>
              Total to pay
            </Text>
            <Text
              style={{ fontSize: 20, fontWeight: "800", color: theme.text }}
            >
              {totalPayable.toLocaleString()} SEK
            </Text>
          </View>
          <Pressable style={styles.mainPayButton} onPress={handlePayAll}>
            <Text style={styles.mainPayButtonText}>Pay All Pending</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 20,
    alignItems: "center",
  },
  title: { fontSize: 14, fontWeight: "700", letterSpacing: 0.5, opacity: 0.6 },
  closeButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.05)",
  },
  hero: { alignItems: "center", marginVertical: 30 },
  workerName: { fontSize: 28, fontWeight: "800" },
  totalAmount: { fontSize: 42, fontWeight: "900", marginVertical: 8 },
  subLabel: { fontSize: 14, fontWeight: "500" },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 15,
    paddingHorizontal: 20,
  },
  list: { paddingBottom: 100 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 20,
  },
  dateBadge: {
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.05)",
    padding: 10,
    borderRadius: 12,
    width: 50,
  },
  day: { fontWeight: "800", fontSize: 16 },
  month: { fontSize: 10, textTransform: "uppercase" },
  cardInfo: { flex: 1, marginLeft: 15 },
  client: { fontSize: 16, fontWeight: "700" },
  payButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "rgba(0,0,0,0.05)",
  },
  payButtonText: { fontSize: 12, fontWeight: "600" },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.1)",
  },
  mainPayButton: {
    paddingHorizontal: 30,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: "#007AFF",
  },
  mainPayButtonText: { color: "#FFF", fontWeight: "700" },
});
