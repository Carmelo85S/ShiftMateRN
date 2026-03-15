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
        console.log(data);
      }
      setLoading(false);
    };

    fetchShifts();
  }, []);

  const renderShift = ({ item }: { item: Shift }) => (
    <Pressable
      style={[styles.shiftCard, { backgroundColor: theme.card }]}
      onPress={() => router.push(`/shifts/${item.id}`)}
    >
      <Text style={[styles.shiftTitle, { color: theme.text }]}>
        {item.title}
      </Text>
      <Text style={[styles.shiftTime, { color: theme.text }]}>
        {item.shift_date} | {item.start_time} - {item.end_time}
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
        contentContainerStyle={{ paddingBottom: 24 }}
        ListEmptyComponent={
          <Text style={[styles.emptyText, { color: theme.text }]}>
            {loading ? "Loading..." : "No shifts available"}
          </Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 16 },
  shiftCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  shiftTitle: { fontSize: 16, fontWeight: "600" },
  shiftTime: { fontSize: 14, marginTop: 4, opacity: 0.7 },
  emptyText: { textAlign: "center", marginTop: 50, fontSize: 16 },
});
