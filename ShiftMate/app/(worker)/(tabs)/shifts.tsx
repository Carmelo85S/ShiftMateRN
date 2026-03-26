import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { supabase } from "@/lib/supabase";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";

type Shift = {
  id: string;
  title: string;
  shift_date: string;
  start_time: string;
  end_time: string;
};

export default function Shifts() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];

  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchShifts = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from("shifts")
        .select("id, title, shift_date, start_time, end_time")
        .eq("status", "open")
        .order("shift_date", { ascending: true });

      if (error) {
        console.error("Error fetching shifts:", error.message);
      } else {
        setShifts(data as Shift[]);
      }

      setLoading(false);
    };

    fetchShifts();
  }, []);

  const formatDate = (date: string) => {
    const d = new Date(date);
    return d.toLocaleDateString("en-GB", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });
  };

  const renderShift = ({ item }: { item: Shift }) => (
    <Pressable
      style={({ pressed }) => [
        styles.shiftCard,
        { backgroundColor: theme.card, opacity: pressed ? 0.85 : 1 },
      ]}
      onPress={() => router.push(`/shift/${item.id}`)}
    >
      <View style={styles.cardHeader}>
        <Text style={[styles.shiftTitle, { color: theme.text }]}>
          {item.title}
        </Text>

        <View style={[styles.badge, { backgroundColor: theme.tint }]}>
          <Text style={styles.badgeText}>OPEN</Text>
        </View>
      </View>

      <Text style={[styles.date, { color: theme.text }]}>
        {formatDate(item.shift_date)}
      </Text>

      <Text style={[styles.time, { color: theme.text }]}>
        {item.start_time.slice(0, 5)} - {item.end_time.slice(0, 5)}
      </Text>
    </Pressable>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.text }]}>
        Available Shifts
      </Text>

      <FlatList
        data={shifts}
        keyExtractor={(item) => item.id}
        renderItem={renderShift}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 30 }}
        ListEmptyComponent={
          <Text style={[styles.emptyText, { color: theme.text }]}>
            {loading ? "Loading shifts..." : "No shifts available"}
          </Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },

  title: {
    fontSize: 26,
    fontWeight: "700",
    marginBottom: 20,
  },

  shiftCard: {
    padding: 18,
    borderRadius: 16,
    marginBottom: 16,

    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },

    elevation: 3,
  },

  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  shiftTitle: {
    fontSize: 18,
    fontWeight: "600",
  },

  date: {
    marginTop: 8,
    fontSize: 15,
    opacity: 0.8,
  },

  time: {
    marginTop: 4,
    fontSize: 16,
    fontWeight: "500",
  },

  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },

  badgeText: {
    color: "white",
    fontSize: 11,
    fontWeight: "700",
  },

  emptyText: {
    textAlign: "center",
    marginTop: 60,
    fontSize: 16,
    opacity: 0.7,
  },
});
