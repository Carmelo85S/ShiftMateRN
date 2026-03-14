// app/(tabs)/shifts/[id].tsx
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { supabase } from "@/lib/supabase";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

type Shift = {
  id: string;
  title: string;
  shift_date: string;
  start_time: string;
  end_time: string;
  status: string;
};

export default function ShiftDetails() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string }>();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];

  const [shift, setShift] = useState<Shift | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchShift = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("shifts")
          .select(
            `
            id,
            title,
            shift_date,
            start_time,
            end_time,
            status
          `,
          )
          .eq("id", params.id)
          .single();

        if (error) throw error;

        setShift(data); // ✅ assegna i dati dello shift
      } catch (err: any) {
        console.error(err);
        setShift(null);
      } finally {
        setLoading(false);
      }
    };

    fetchShift();
  }, [params.id]);

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.tint} />
      </View>
    );
  }

  if (!shift) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Text style={[styles.text, { color: theme.text }]}>
          Shift not found
        </Text>
        <Pressable
          onPress={() => router.back()}
          style={[styles.backButton, { borderColor: theme.tint }]}
        >
          <Text style={[styles.backButtonText, { color: theme.tint }]}>
            Back
          </Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Pressable
        onPress={() => router.back()}
        style={[styles.backButton, { borderColor: theme.tint }]}
      >
        <Text style={[styles.backButtonText, { color: theme.tint }]}>Back</Text>
      </Pressable>

      <Text style={[styles.title, { color: theme.tint }]}>{shift.title}</Text>
      <Text style={[styles.subtitle, { color: theme.text }]}>
        Date: {shift.shift_date}
      </Text>
      <Text style={[styles.subtitle, { color: theme.text }]}>
        Time: {shift.start_time} - {shift.end_time}
      </Text>
      <Text style={[styles.subtitle, { color: theme.text }]}>
        Status: {shift.status}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24 },
  title: { fontSize: 28, fontWeight: "bold", marginTop: 20, marginBottom: 8 },
  subtitle: { fontSize: 18, marginBottom: 6 },
  text: { fontSize: 16, marginBottom: 12 },
  backButton: {
    padding: 12,
    borderWidth: 1,
    borderRadius: 10,
    alignSelf: "flex-start",
    marginBottom: 16,
  },
  backButtonText: { fontWeight: "600", fontSize: 16 },
});
