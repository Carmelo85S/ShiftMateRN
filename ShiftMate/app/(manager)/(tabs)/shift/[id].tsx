// /(manager)/(tabs)/shift/[id].tsx
import { ScrollView, StyleSheet, Text, View, Image, Pressable } from "react-native";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Colors } from "@/constants/theme";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Shift = {
  id: string;
  title: string;
  description: string | null;
  shift_date: string;
  start_time: string;
  end_time: string;
  status: string;
  image_url: string | null;
};

type Application = {
  id: string;
  profile_id: string;
  status: string;
  applied_at: string;
  profile?: { name: string | null; surname: string | null };
};

export default function ShiftDetail() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const [shift, setShift] = useState<Shift | null>(null);
  const [loading, setLoading] = useState(true);

  const [applications, setApplications] = useState<Application[]>([]);
  const [loadingApplications, setLoadingApplications] = useState(true);

  // Fetch shift details
  useEffect(() => {
    const fetchShift = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("shifts")
          .select("*")
          .eq("id", id)
          .single();

        if (error) throw error;
        setShift(data as Shift);
      } catch (err) {
        console.error("Error fetching shift:", err);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchShift();
  }, [id]);

  // Fetch applications
  useEffect(() => {
    if (!shift?.id) return;

    const fetchApplications = async () => {
      setLoadingApplications(true);
      try {
       const { data, error } = await supabase
        .from("applications")
        .select(`
          id,
          profile_id,
          status,
          applied_at,
          profiles!inner(name)
        `)
        .eq("shift_id", shift.id)
        .order("applied_at", { ascending: true });

        if (error) throw error;
        console.log("data: ", data)
      } catch (err: any) {
        console.error("Error fetching applications:", err.message || err);
      } finally {
        setLoadingApplications(false);
      }
    };

    fetchApplications();
  }, [shift?.id]);

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <Text style={{ color: theme.text }}>Loading...</Text>
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
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={{ padding: 20 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Cover Image */}
      {shift.image_url && (
        <View style={styles.imageWrapper}>
          <Image
            source={{ uri: shift.image_url }}
            style={styles.coverImage}
            resizeMode="cover"
          />
        </View>
      )}

      {/* Title */}
      <Text style={[styles.title, { color: theme.text }]}>{shift.title}</Text>

      {/* Description */}
      {shift.description && (
        <Text style={[styles.description, { color: theme.text }]}>
          {shift.description}
        </Text>
      )}

      {/* Date & Time */}
      <View style={styles.row}>
        <Text style={[styles.label, { color: theme.text }]}>Date:</Text>
        <Text style={[styles.value, { color: theme.text }]}>
          {new Date(shift.shift_date).toLocaleDateString("en-GB", {
            weekday: "short",
            day: "numeric",
            month: "short",
          })}
        </Text>
      </View>

      <View style={styles.row}>
        <Text style={[styles.label, { color: theme.text }]}>Time:</Text>
        <Text style={[styles.value, { color: theme.text }]}>
          {shift.start_time.slice(0, 5)} - {shift.end_time.slice(0, 5)}
        </Text>
      </View>

      {/* Status */}
      <View style={[styles.statusBadge, { backgroundColor: theme.tint + "22" }]}>
        <Text style={[styles.statusText, { color: theme.tint }]}>
          {shift.status.toUpperCase()}
        </Text>
      </View>

      {/* Edit Button */}
      <Pressable
        style={({ pressed }) => [
          styles.editButton,
          { backgroundColor: theme.tint, opacity: pressed ? 0.85 : 1 },
        ]}
        onPress={() =>
          router.push({
            pathname: `/shift/editShift`,
            params: { id: shift.id },
          })
        }
      >
        <Text style={styles.editButtonText}>Edit Shift</Text>
      </Pressable>

      {/* Applications Section */}
      <View style={{ marginTop: 30 }}>
        <Text style={{ fontWeight: "700", fontSize: 18, marginBottom: 12 }}>Applications</Text>

        {loadingApplications ? (
          <Text style={{ color: theme.text }}>Loading applications...</Text>
        ) : applications.length === 0 ? (
          <Text style={{ color: theme.text }}>No applications yet.</Text>
        ) : (
          applications.map((app) => (
            <View
              key={app.id}
              style={{
                padding: 12,
                borderRadius: 12,
                backgroundColor: theme.card,
                marginBottom: 10,
              }}
            >
              <Text style={{ color: theme.text, fontWeight: "600" }}>
                {app.profile?.name
                  ? `${app.profile.name} ${app.profile.surname || ""}`
                  : app.profile_id}
              </Text>
              <Text style={{ color: theme.text, opacity: 0.8 }}>{app.status.toUpperCase()}</Text>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  imageWrapper: {
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 5,
  },

  coverImage: {
    width: "100%",
    height: 200,
  },

  title: {
    fontSize: 26,
    fontWeight: "700",
    marginBottom: 6,
  },

  description: {
    fontSize: 16,
    lineHeight: 22,
    opacity: 0.85,
    marginBottom: 16,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },

  label: { fontWeight: "600", fontSize: 14 },
  value: { fontWeight: "400", fontSize: 14 },

  statusBadge: {
    alignSelf: "flex-start",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginTop: 12,
  },

  statusText: {
    fontWeight: "600",
    fontSize: 13,
    letterSpacing: 0.5,
  },

  editButton: {
    marginTop: 24,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: "center",
  },

  editButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
});