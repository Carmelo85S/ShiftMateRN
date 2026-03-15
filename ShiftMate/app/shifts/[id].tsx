import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { supabase } from "@/lib/supabase";
import { Stack, useLocalSearchParams } from "expo-router";
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
};

export default function ShiftDetail() {
  const { id } = useLocalSearchParams();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];

  const [shift, setShift] = useState<Shift | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchShift = async () => {
      const { data, error } = await supabase
        .from("shifts")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error(error);
      } else {
        setShift(data);
      }

      setLoading(false);
    };

    fetchShift();
  }, []);

  const formatDate = (date: string) => {
    const d = new Date(date);
    return d.toLocaleDateString("en-GB", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
  };

  const handleApply = () => {
    console.log("User applied to shift:", shift?.id);
  };

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.tint} />
      </View>
    );
  }

  if (!shift) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <Text style={{ color: theme.text }}>Shift not found</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: "Shift Details",
          headerShown: true,
        }}
      />
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={[styles.card, { backgroundColor: theme.card }]}>
          <Text style={[styles.title, { color: theme.text }]}>
            {shift.title}
          </Text>

          <View style={styles.infoRow}>
            <Text style={[styles.label, { color: theme.text }]}>Date</Text>
            <Text style={[styles.value, { color: theme.text }]}>
              {formatDate(shift.shift_date)}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={[styles.label, { color: theme.text }]}>Time</Text>
            <Text style={[styles.value, { color: theme.text }]}>
              {shift.start_time.slice(0, 5)} - {shift.end_time.slice(0, 5)}
            </Text>
          </View>
        </View>

        <Pressable
          onPress={handleApply}
          style={[styles.applyButton, { backgroundColor: theme.tint }]}
        >
          <Text style={styles.applyText}>Apply for this shift</Text>
        </Pressable>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: "space-between",
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  card: {
    padding: 24,
    borderRadius: 18,

    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },

    elevation: 4,
  },

  title: {
    fontSize: 26,
    fontWeight: "700",
    marginBottom: 20,
  },

  infoRow: {
    marginBottom: 16,
  },

  label: {
    fontSize: 13,
    opacity: 0.6,
    marginBottom: 4,
  },

  value: {
    fontSize: 17,
    fontWeight: "600",
  },

  applyButton: {
    padding: 18,
    borderRadius: 14,
    alignItems: "center",
  },

  applyText: {
    color: "white",
    fontWeight: "700",
    fontSize: 16,
  },
});
