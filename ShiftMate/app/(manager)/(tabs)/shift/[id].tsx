// /(manager)/(tabs)/shift/[id].tsx
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  Image,
  Pressable,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Colors } from "@/constants/theme";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";

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
  status: "pending" | "accepted" | "rejected" | string;
  applied_at: string;
  profile?: {
    name: string | null;
    surname: string | null;
    avatar_url: string | null;
  };
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

  // 1. Load shift details
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

  // 2. Load applications with profile data
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
            profiles!inner (
              name,
              surname,
              avatar_url
            )
          `)
          .eq("shift_id", shift.id)
          .order("applied_at", { ascending: true });

        if (error) throw error;

        const apps: Application[] = (data as any[]).map((app) => ({
          id: app.id,
          profile_id: app.profile_id,
          status: app.status,
          applied_at: app.applied_at,
          profile: app.profiles,
        }));

        setApplications(apps);
      } catch (err: any) {
        console.error("Error fetching applications:", err.message);
      } finally {
        setLoadingApplications(false);
      }
    };

    fetchApplications();
  }, [shift?.id]);

  // 3. Update application status
  const handleUpdateStatus = async (appId: string, newStatus: "accepted" | "rejected") => {
    try {
      const { error } = await supabase
        .from("applications")
        .update({ status: newStatus })
        .eq("id", appId);

      if (error) throw error;

      setApplications((prev) =>
        prev.map((app) => (app.id === appId ? { ...app, status: newStatus } : app))
      );
    } catch (err: any) {
      Alert.alert("Error", "Unable to update application status.");
    }
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
      <Stack.Screen options={{ title: "Shift Detail" }} />
      <ScrollView
        style={[styles.container, { backgroundColor: theme.background }]}
        contentContainerStyle={{ padding: 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Cover Image */}
        <View style={styles.imageWrapper}>
          {shift.image_url ? (
            <Image source={{ uri: shift.image_url }} style={styles.coverImage} resizeMode="cover" />
          ) : (
            <View
              style={[
                styles.coverImage,
                { backgroundColor: theme.tint + "20", justifyContent: "center", alignItems: "center" },
              ]}
            >
              <Ionicons name="image-outline" size={48} color={theme.tint} />
            </View>
          )}
        </View>

        {/* Shift Header */}
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.title, { color: theme.text }]}>{shift.title}</Text>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: shift.status === "open" ? "#E0F7FA" : "#F5F5F5" },
              ]}
            >
              <Text
                style={[
                  styles.statusText,
                  { color: shift.status === "open" ? "#00796B" : "#666" },
                ]}
              >
                {shift.status.toUpperCase()}
              </Text>
            </View>
          </View>
          <Pressable
            onPress={() => router.push({ pathname: `/shift/editShift`, params: { id: shift.id } })}
            style={({ pressed }) => [styles.editIcon, { backgroundColor: theme.tint + "15", opacity: pressed ? 0.7 : 1 }]}
          >
            <Ionicons name="pencil" size={20} color={theme.tint} />
          </Pressable>
        </View>

        <Text style={[styles.description, { color: theme.text }]}>{shift.description}</Text>

        {/* Date & Time Card */}
        <View style={[styles.infoCard, { backgroundColor: theme.card }]}>
          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={18} color={theme.tint} />
            <Text style={[styles.infoText, { color: theme.text }]}>
              {new Date(shift.shift_date).toLocaleDateString("en-GB", {
                weekday: "short",
                day: "numeric",
                month: "long",
              })}
            </Text>
          </View>
          <View style={[styles.infoRow, { marginTop: 10 }]}>
            <Ionicons name="time-outline" size={18} color={theme.tint} />
            <Text style={[styles.infoText, { color: theme.text }]}>
              {shift.start_time.slice(0, 5)} - {shift.end_time.slice(0, 5)}
            </Text>
          </View>
        </View>

        {/* Applications Horizontal Scroll */}
        <View style={{ marginTop: 32 }}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Applications ({applications.length})
          </Text>

          {loadingApplications ? (
            <ActivityIndicator color={theme.tint} style={{ marginTop: 20 }} />
          ) : applications.length === 0 ? (
            <Text style={{ color: theme.text, opacity: 0.6, fontStyle: "italic" }}>
              No applicants yet.
            </Text>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 12 }}>
              {applications.map((app) => (
                <View
                  key={app.id}
                  style={[
                    styles.appHorizontalCard,
                    { backgroundColor: theme.card },
                  ]}
                >
                  {/* Avatar */}
                  {app.profile?.avatar_url ? (
                    <Image source={{ uri: app.profile.avatar_url }} style={styles.avatarHorizontal} />
                  ) : (
                    <View style={[styles.avatarHorizontal, styles.avatarPlaceholder]}>
                      <Text style={styles.avatarInitial}>
                        {app.profile?.name?.[0] || "?"}
                      </Text>
                    </View>
                  )}

                  <Text style={[styles.applicantNameHorizontal, { color: theme.text }]} numberOfLines={1}>
                    {app.profile?.name} {app.profile?.surname}
                  </Text>

                  <View
                    style={[
                      styles.statusDotHorizontal,
                      {
                        backgroundColor:
                          app.status === "accepted"
                            ? "#4CAF50"
                            : app.status === "rejected"
                            ? "#F44336"
                            : "#FF9800",
                      },
                    ]}
                  />

                  {/* Action Buttons */}
                  {app.status === "pending" && (
                    <View style={styles.actionRowHorizontal}>
                      <Pressable
                        onPress={() => handleUpdateStatus(app.id, "accepted")}
                        style={styles.actionBtnHorizontal}
                      >
                        <Ionicons name="checkmark-circle-outline" size={20} color="#4CAF50" />
                      </Pressable>
                      <Pressable
                        onPress={() => handleUpdateStatus(app.id, "rejected")}
                        style={styles.actionBtnHorizontal}
                      >
                        <Ionicons name="close-circle-outline" size={20} color="#F44336" />
                      </Pressable>
                    </View>
                  )}
                </View>
              ))}
            </ScrollView>
          )}
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  imageWrapper: {
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 20,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  coverImage: { width: "100%", height: 200 },
  headerRow: { flexDirection: "row", alignItems: "flex-start", marginBottom: 12 },
  title: { fontSize: 26, fontWeight: "800", marginBottom: 6 },
  editIcon: { padding: 10, borderRadius: 12 },
  description: { fontSize: 16, lineHeight: 24, opacity: 0.7, marginBottom: 20 },
  statusBadge: { alignSelf: "flex-start", paddingVertical: 4, paddingHorizontal: 10, borderRadius: 8 },
  statusText: { fontWeight: "700", fontSize: 11 },
  infoCard: { padding: 16, borderRadius: 16, borderWidth: 1, marginBottom: 10 },
  infoRow: { flexDirection: "row", alignItems: "center" },
  infoText: { marginLeft: 10, fontWeight: "600", fontSize: 15 },
  sectionTitle: { fontWeight: "800", fontSize: 20, marginBottom: 16 },
  appHorizontalCard: {
    width: 110,
    height: 150,
    borderRadius: 16,
    padding: 10,
    marginRight: 12,
    alignItems: "center",
    justifyContent: "flex-start",
    borderWidth: 1,
    overflow: "hidden",
  },
  avatarHorizontal: { width: 50, height: 50, borderRadius: 25, marginBottom: 6 },
  avatarPlaceholder: { backgroundColor: "#E1E1E1", justifyContent: "center", alignItems: "center" },
  avatarInitial: { fontWeight: "700", color: "#666", fontSize: 18 },
  applicantNameHorizontal: { fontWeight: "700", fontSize: 14, textAlign: "center" },
  statusDotHorizontal: { width: 10, height: 10, borderRadius: 5, marginTop: 6 },
  actionRowHorizontal: { flexDirection: "row", marginTop: 8, gap: 8 },
  actionBtnHorizontal: { flex: 1, justifyContent: "center", alignItems: "center" },
});