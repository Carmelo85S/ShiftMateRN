import { StyleSheet, Text, View, FlatList, Pressable, useColorScheme, ActivityIndicator, Image } from "react-native";
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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("shifts")
        .select("id, title, shift_date, start_time, end_time, image_url, status")
        .eq("status", "open")
        .eq("manager_id", user.id)
        .order("shift_date", { ascending: true });

      if (error) throw error;
      setShifts(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { fetchShifts(); }, [fetchShifts]));

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={theme.tint} /></View>;

  return (
    <FlatList
      data={shifts}
      keyExtractor={(item) => item.id}
      contentContainerStyle={{ padding: 16, paddingBottom: 100 }} // ✅ Spazio extra per non coprire l'ultima card con le tab
      renderItem={({ item }) => (
        <View style={[styles.card, { backgroundColor: theme.card }]}>
          {item.image_url && <Image source={{ uri: item.image_url }} style={styles.cardImage} />}
          <Text style={[styles.title, { color: theme.text }]}>{item.title}</Text>
          <Text style={{ color: theme.text, marginBottom: 8 }}>
            {new Date(item.shift_date).toLocaleDateString()} | {item.start_time.slice(0, 5)}
          </Text>
          
          {/* ✅ BOTTONE VIEW DETAILS (Path aggiornato nella stessa cartella) */}
          <Pressable
            style={[styles.button, { backgroundColor: theme.tint }]}
            onPress={() => router.push(`/(manager)/(tabs)/shift/${item.id}`)}
          >
            <Text style={styles.buttonText}>View Details</Text>
          </Pressable>

          {/* ✅ BOTTONE EDIT (Path aggiornato nella stessa cartella) */}
          <Pressable
            style={[styles.button, { backgroundColor: "transparent", borderWidth: 1, borderColor: theme.tint, marginTop: 8 }]}
            onPress={() => router.push({
              pathname: "/(manager)/(tabs)/shift/editShift",
              params: { id: item.id }
            })}
          >
            <Text style={[styles.buttonText, { color: theme.tint }]}>Edit Shift</Text>
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
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardImage: { width: "100%", height: 160, borderRadius: 12, marginBottom: 12 },
  title: { fontSize: 18, fontWeight: "700", marginBottom: 4 },
  button: { paddingVertical: 12, borderRadius: 14, alignItems: "center" },
  buttonText: { color: "#fff", fontWeight: "700" },
});