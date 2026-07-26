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

  console.log(
    "🟢 WorkerDetailsScreen caricato - workerId:",
    workerId,
    "| month:",
    month,
  );

  useEffect(() => {
    const fetchWorkerShifts = async () => {
      if (!workerId || !month) {
        console.log("⚠️ Parametri mancanti workerId o month");
        return;
      }

      try {
        console.log("🔄 Recupero turni per il worker...");
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
            `
            id, shift_date, total_pay, status, client_name, image_url,
            applications!inner(profile_id)
          `,
          )
          .eq("applications.profile_id", workerId)
          .gte("shift_date", start)
          .lte("shift_date", end);

        if (error) {
          console.error("❌ Errore caricamento turni worker:", error);
        } else {
          console.log(
            "✅ Turni caricati con successo:",
            data?.length || 0,
            "trovati",
          );
        }

        setShifts(data || []);
      } catch (err) {
        console.error("❌ Eccezione durante il fetch dei turni:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkerShifts();
  }, [workerId, month]);

  const totalPayable = shifts
    .filter((s) => s.status !== "paid")
    .reduce((acc, curr) => acc + (Number(curr.total_pay) || 0), 0);

  // 💳 Funzione per pagare un singolo turno tramite Edge Function
  const handlePayShift = async (shiftId: string) => {
    console.log("🚀 Inizio pagamento per il singolo turno ID:", shiftId);
    try {
      setLoading(true);

      console.log("📡 Invocazione Edge Function 'pay-worker-shift' con body:", {
        shiftId,
        workerId,
      });
      const { data, error } = await supabase.functions.invoke(
        "pay-worker-shift",
        {
          body: { shiftId, workerId },
        },
      );

      if (error) {
        console.error("❌ Errore Edge Function 'pay-worker-shift':", error);
        throw error;
      }

      console.log("✅ Risposta Edge Function ricevuta:", data);
      Alert.alert("Successo", "Pagamento inviato correttamente!");

      // Aggiorna lo stato localmente
      setShifts((prev) =>
        prev.map((s) => (s.id === shiftId ? { ...s, status: "paid" } : s)),
      );
    } catch (err: any) {
      console.error("❌ Errore catch in handlePayShift:", err.message || err);
      Alert.alert(
        "Errore",
        err.message || "Impossibile completare il pagamento.",
      );
    } finally {
      setLoading(false);
    }
  };

  // 🚀 Funzione per pagare tutti i turni in sospeso
  const handlePayAllPending = async () => {
    const pendingShifts = shifts.filter((s) => s.status !== "paid");
    console.log("📦 Turni pendenti da pagare:", pendingShifts.length);

    if (pendingShifts.length === 0) return;

    Alert.alert(
      "Conferma Pagamento",
      `Vuoi procedere al pagamento di ${pendingShifts.length} turni per un totale di ${totalPayable.toLocaleString()} SEK?`,
      [
        { text: "Annulla", style: "cancel" },
        {
          text: "Paga Tutto",
          onPress: async () => {
            setLoading(true);
            try {
              console.log(
                "🚀 Avvio pagamento massivo per",
                pendingShifts.length,
                "turni",
              );

              for (const shift of pendingShifts) {
                console.log("➡️ Pagamento turno in corso ID:", shift.id);
                const { data, error } = await supabase.functions.invoke(
                  "pay-worker-shift",
                  {
                    body: { shiftId: shift.id, workerId },
                  },
                );

                if (error) {
                  console.error(`❌ Errore sul turno ${shift.id}:`, error);
                  throw error;
                }
                console.log(`✅ Turno ${shift.id} pagato con successo:`, data);
              }

              Alert.alert(
                "Successo",
                "Tutti i pagamenti sono stati inviati con successo!",
              );

              // Segna tutti come paid localmente
              setShifts((prev) => prev.map((s) => ({ ...s, status: "paid" })));
            } catch (err: any) {
              console.error(
                "❌ Errore durante il ciclo di pagamenti multipli:",
                err.message || err,
              );
              Alert.alert(
                "Errore",
                err.message ||
                  "Qualcosa è andato storto durante i pagamenti multipli.",
              );
            } finally {
              setLoading(false);
            }
          },
        },
      ],
    );
  };

  if (loading && shifts.length === 0) {
    return (
      <View
        style={[
          styles.container,
          styles.center,
          { backgroundColor: theme.background },
        ]}
      >
        <ActivityIndicator size="large" color={theme.text} />
      </View>
    );
  }

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
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={[styles.card, { backgroundColor: theme.card }]}>
            <Image
              source={{
                uri: item.image_url || "https://via.placeholder.com/150",
              }}
              style={styles.clientImage}
            />

            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text
                style={{ fontSize: 16, fontWeight: "700", color: theme.text }}
              >
                {item.client_name || "Turno di lavoro"}
              </Text>
              <Text style={{ color: theme.text + "80", fontSize: 12 }}>
                {new Date(item.shift_date).toLocaleDateString()} •{" "}
                {item.total_pay} SEK
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
                onPress={() => handlePayShift(item.id)}
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
          <Text style={{ color: theme.text, fontWeight: "700", fontSize: 16 }}>
            {totalPayable.toLocaleString()} SEK
          </Text>
          <Pressable
            style={[styles.mainBtn, { backgroundColor: theme.tint }]}
            onPress={handlePayAllPending}
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
  center: { justifyContent: "center", alignItems: "center" },
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
