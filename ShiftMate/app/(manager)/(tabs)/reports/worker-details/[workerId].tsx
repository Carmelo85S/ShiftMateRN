import { ScreenHeader } from "@/components/shared/Header";
import { Colors } from "@/constants/theme";
import { supabase } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Image,
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

      // Query diretta su 'shifts' usando le colonne che hai definito
      const { data } = await supabase
        .from("shifts")
        .select(
          `
          id, shift_date, total_pay, status, client_name, image_url,
          applications!inner(profile_id)
        `,
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
    .filter((s) => s.status !== "paid") // Assicurati che lo status 'paid' sia gestito nel DB
    .reduce((acc, curr) => acc + (Number(curr.total_pay) || 0), 0);

  if (loading) return <ActivityIndicator style={{ flex: 1 }} />;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "flex-start",
          paddingRight: 20,
        }}
      >
        <View style={{ flex: 1 }}>
          <ScreenHeader
            kpi="Worker Details"
            title={name as string}
            theme={theme}
            containerStyle={{ paddingTop: insets.top + 20, paddingLeft: 20 }}
          />
        </View>
        <Pressable
          onPress={() => router.back()}
          style={{ marginTop: insets.top + 20, padding: 8 }}
        >
          <Ionicons name="close" size={28} color={theme.text} />
        </Pressable>
      </View>

      <FlatList
        data={shifts}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={[styles.card, { backgroundColor: theme.card }]}>
            {/* Usiamo direttamente image_url dalla tabella shifts */}
            <Image
              source={{
                uri: item.image_url,
              }}
              style={styles.clientImage}
            />

            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text
                style={{ fontSize: 16, fontWeight: "700", color: theme.text }}
              >
                {item.client_name}
              </Text>
              <Text style={{ color: theme.text + "80", fontSize: 12 }}>
                {new Date(item.shift_date).toLocaleDateString()}
              </Text>
            </View>

            {item.status === "paid" ? (
              <Ionicons
                name="checkmark-circle"
                size={24}
                color={theme.tint || "#34C759"}
              />
            ) : (
              <Pressable
                style={[styles.payBtn, { backgroundColor: theme.tint }]}
                onPress={() =>
                  Alert.alert("Pay", `Pagare ${item.total_pay} SEK?`)
                }
              >
                <Text
                  style={{ color: "#FFF", fontSize: 12, fontWeight: "700" }}
                >
                  Pay
                </Text>
              </Pressable>
            )}
          </View>
        )}
      />

      {totalPayable > 0 && (
        <View
          style={[
            styles.footer,
            { backgroundColor: theme.card, paddingBottom: insets.bottom + 15 },
          ]}
        >
          <Text style={{ color: theme.text, fontWeight: "700" }}>
            {totalPayable.toLocaleString()} SEK
          </Text>
          <Pressable
            style={[styles.mainBtn, { backgroundColor: theme.tint }]}
            onPress={() => {}}
          >
            <Text style={{ color: "#FFF", fontWeight: "700" }}>
              Pay All Pending
            </Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: { paddingHorizontal: 20, paddingTop: 10 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderRadius: 20,
    marginBottom: 12,
  },
  clientImage: {
    width: 45,
    height: 45,
    borderRadius: 12,
    backgroundColor: "#eee",
  },
  payBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.1)",
  },
  mainBtn: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
});
