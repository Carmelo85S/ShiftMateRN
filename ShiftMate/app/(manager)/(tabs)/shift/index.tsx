// /(manager)/(tabs)/shift.tsx
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Pressable,
  useColorScheme,
  ActivityIndicator,
  Image,
} from "react-native";
import React, { useState, useCallback } from "react";
import { Colors } from "@/constants/theme";
import { supabase } from "@/lib/supabase";
import { useRouter, useFocusEffect } from "expo-router";

type Shift = {
  id: string;
  title: string;
  shift_date: string;
  start_time: string;
  end_time: string;
  image_url: string | null;
  status: string;
};

export default function ShiftsManager() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];

  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchShifts = useCallback(async () => {
    setLoading(true);

    try {
      const { data } = await supabase.auth.getUser();
      const user = data.user;
      if (!user) {
        setShifts([]);
        setLoading(false);
        return;
      }

      const { data: shiftsData, error } = await supabase
        .from("shifts")
        .select(
          "id, title, shift_date, start_time, end_time, image_url, status"
        )
        .eq("status", "open")
        .eq("manager_id", user.id)
        .order("shift_date", { ascending: true });

      if (error) throw error;
      setShifts(shiftsData || []);
    } catch (err) {
      console.error("Error fetching shifts:", err);
      setShifts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // 🔄 Refresh automatico quando lo screen torna in focus
  useFocusEffect(
    useCallback(() => {
      fetchShifts();
    }, [fetchShifts])
  );

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.tint} />
      </View>
    );
  }

  return (
    <FlatList
      data={shifts}
      keyExtractor={(item) => item.id}
      contentContainerStyle={{ padding: 16 }}
      ListEmptyComponent={
        <Text style={{ textAlign: "center", marginTop: 20, color: theme.text }}>
          No open shifts
        </Text>
      }
      renderItem={({ item }) => (
        <View style={[styles.card, { backgroundColor: theme.card }]}>
          {/* IMAGE */}
          {item.image_url && (
            <Image
              source={{ uri: item.image_url }}
              style={styles.cardImage}
              resizeMode="cover"
            />
          )}

          {/* TITLE */}
          <Text style={[styles.title, { color: theme.text }]}>{item.title}</Text>

          {/* DATE & TIME */}
          <Text style={{ color: theme.text, marginBottom: 8 }}>
            {new Date(item.shift_date).toLocaleDateString("en-GB", {
              weekday: "short",
              day: "numeric",
              month: "short",
            })}{" "}
            | {item.start_time.slice(0, 5)} - {item.end_time.slice(0, 5)}
          </Text>

          {/* STATUS BADGE */}
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: theme.tint + "22" },
            ]}
          >
            <Text style={[styles.statusText, { color: theme.tint }]}>
              {item.status.toUpperCase()}
            </Text>
          </View>

          {/* VIEW / EDIT BUTTON */}
          <Pressable
            style={({ pressed }) => [
              styles.button,
              {
                backgroundColor: theme.tint,
                opacity: pressed ? 0.85 : 1,
              },
            ]}
            onPress={() => router.push(`/shift/${item.id}`)}
          >
            <Text style={styles.buttonText}>View / Edit</Text>
          </Pressable>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  card: {
    borderRadius: 18,
    marginBottom: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  cardImage: {
    width: "100%",
    height: 160,
    borderRadius: 12,
    marginBottom: 12,
  },
  title: { fontSize: 18, fontWeight: "700", marginBottom: 4 },
  statusBadge: {
    alignSelf: "flex-start",
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 16,
    marginBottom: 8,
  },
  statusText: { fontWeight: "700", fontSize: 12 },
  button: {
    marginTop: 8,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontWeight: "700", fontSize: 14 },
});