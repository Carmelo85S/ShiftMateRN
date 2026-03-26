// /(manager)/(tabs)/shift.tsx
import { StyleSheet, Text, View, FlatList, Pressable, useColorScheme, ActivityIndicator } from 'react-native';
import React, { useEffect, useState } from 'react';
import { Colors } from '@/constants/theme';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'expo-router';

type Shift = {
  id: string,
  title: string,
  shift_date: string,
  start_time: string,
  end_time: string
}

export default function ShiftsManager() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];

  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);

    useEffect(() => {
      const fetchShiftsManager = async () => {
        setLoading(true);

        // Prendi l'utente loggato
        const { data } = await supabase.auth.getUser();
        const user = data.user;

        // Se non c'è utente, non fetchare
        if (!user) {
          console.warn("No logged-in user found");
          setShifts([]);
          setLoading(false);
          return;
        }

        // Fetch degli shift solo per il manager loggato
        const { data: shiftsData, error } = await supabase
          .from("shifts")
          .select("id, title, shift_date, start_time, end_time")
          .eq("status", "open")
          .eq("manager_id", user.id)  // ✅ solo i tuoi shift
          .order("shift_date", { ascending: true });

        if (error) {
          console.error("Error fetching shifts:", error.message);
          setShifts([]);
        } else {
          setShifts(shiftsData || []);
        }

        setLoading(false);
      };

      fetchShiftsManager();
    }, []);

  if (loading) {
    return (
      <View style={styles.center}>
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
        <View style={[styles.card, { backgroundColor: theme.tint + "22" }]}>
          <Text style={[styles.title, { color: theme.text }]}>{item.title}</Text>
          <Text style={{ color: theme.text }}>
            Date: {new Date(item.shift_date).toLocaleDateString()}
          </Text>
          <Text style={{ color: theme.text }}>
            Time: {item.start_time} - {item.end_time}
          </Text>
          <Pressable
            style={[styles.button, { backgroundColor: theme.tint }]}
            onPress={() => router.push(`/(manager)/shift/${item.id}`)}
          >
            <Text style={{ color: "#fff", fontWeight: "bold" }}>View / Edit</Text>
          </Pressable>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  card: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  title: { fontSize: 18, fontWeight: "bold", marginBottom: 4 },
  button: {
    marginTop: 12,
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
  },
});