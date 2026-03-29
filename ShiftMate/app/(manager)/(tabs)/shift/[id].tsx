// /(manager)/(tabs)/shift/[id].tsx
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  Image,
  Pressable,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { Colors } from "@/constants/theme";
import { useLocalSearchParams, useRouter, Stack, useFocusEffect } from "expo-router";
import { useState, useCallback } from "react";
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
  const theme = Colors.light;  
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const [shift, setShift] = useState<Shift | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loadingApplications, setLoadingApplications] = useState(true);

  // Funzione centralizzata per il caricamento dati
  const loadAllData = useCallback(async () => {
    if (!id) return;
    
    try {
      // 1. Fetch Shift
      const { data: shiftData, error: shiftError } = await supabase
        .from("shifts")
        .select("*")
        .eq("id", id)
        .single();

      if (shiftError) throw shiftError;
      setShift(shiftData as Shift);

      // 2. Fetch Applications
      setLoadingApplications(true);
      const { data: appsData, error: appsError } = await supabase
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
        .eq("shift_id", id)
        .order("applied_at", { ascending: true });

      if (appsError) throw appsError;

      const formattedApps: Application[] = (appsData as any[]).map((app) => ({
        id: app.id,
        profile_id: app.profile_id,
        status: app.status,
        applied_at: app.applied_at,
        profile: app.profiles,
      }));

      setApplications(formattedApps);
    } catch (err) {
      console.error("Error loading shift detail data:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingApplications(false);
    }
  }, [id]);

  // useFocusEffect ricarica i dati ogni volta che la pagina torna visibile
  useFocusEffect(
    useCallback(() => {
      loadAllData();
    }, [loadAllData])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadAllData();
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
      <Stack.Screen options={{ 
          title: "Shift Detail", 
          headerShown: true,
          headerBackTitle: "", 
        }}
       />
      <ScrollView
        style={[styles.container, { backgroundColor: theme.background }]}
        contentContainerStyle={{ padding: 20 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.tint} />
        }
      >
        {/* Cover Image con Cache Buster */}
        <View style={styles.imageWrapper}>
          {shift.image_url ? (
            <Image 
              source={{ uri: `${shift.image_url}?t=${new Date().getTime()}` }} 
              style={styles.coverImage} 
              resizeMode="cover" 
            />
          ) : (
            <View style={[styles.coverImage, { backgroundColor: theme.tint + "20", justifyContent: "center", alignItems: "center" }]}>
              <Ionicons name="image-outline" size={48} color={theme.tint} />
            </View>
          )}
        </View>

        {/* Shift Header */}
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.title, { color: theme.text }]}>{shift.title}</Text>
            <View style={[styles.statusBadge, { backgroundColor: shift.status === "open" ? "#E0F7FA" : "#F5F5F5" }]}>
              <Text style={[styles.statusText, { color: shift.status === "open" ? "#00796B" : "#666" }]}>
                {shift.status.toUpperCase()}
              </Text>
            </View>
          </View>
          <Pressable
            onPress={() => router.push({ 
              pathname: "/(manager)/(tabs)/shift/editShift", 
              params: { id: shift.id } 
            })}   
           style={({ pressed }) => [styles.editIcon, { backgroundColor: theme.tint + "15", opacity: pressed ? 0.7 : 1 }]}
          >
            <Ionicons name="pencil" size={20} color={theme.tint} />
          </Pressable>
        </View>

        <Text style={[styles.description, { color: theme.text }]}>{shift.description}</Text>

        {/* Info Card Date/Time */}
        <View style={[styles.infoCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={18} color={theme.tint} />
            <Text style={[styles.infoText, { color: theme.text }]}>
              {new Date(shift.shift_date).toLocaleDateString("it-IT", { weekday: "short", day: "numeric", month: "long" })}
            </Text>
          </View>
          <View style={[styles.infoRow, { marginTop: 10 }]}>
            <Ionicons name="time-outline" size={18} color={theme.tint} />
            <Text style={[styles.infoText, { color: theme.text }]}>
              {shift.start_time.slice(0, 5)} - {shift.end_time.slice(0, 5)}
            </Text>
          </View>
        </View>

        {/* Sezione Candidati */}
        <View style={{ marginTop: 32 }}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Applications ({applications.length})
          </Text>

          {loadingApplications ? (
            <ActivityIndicator color={theme.tint} style={{ marginTop: 20 }} />
          ) : applications.length === 0 ? (
            <Text style={{ color: theme.text, opacity: 0.6, fontStyle: "italic" }}>No applicants yet.</Text>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 12 }}>
              {applications.map((app) => (
                <Pressable
                  key={app.id}
                  onPress={() =>
                    router.push({
                      pathname: "/(manager)/candidate/[id]",
                      params: { 
                        id: app.profile_id, 
                        shiftId: id 
                      },
                    })
                  }
                  style={({ pressed }) => [
                    styles.appHorizontalCard,
                    { 
                      backgroundColor: theme.card, 
                      borderColor: theme.border,
                      opacity: pressed ? 0.8 : 1,
                      transform: [{ scale: pressed ? 0.98 : 1 }] 
                    },
                  ]}
                >
                  {app.profile?.avatar_url ? (
                    <Image source={{ uri: app.profile.avatar_url }} style={styles.avatarHorizontal} />
                  ) : (
                    <View style={[styles.avatarHorizontal, styles.avatarPlaceholder]}>
                      <Text style={styles.avatarInitial}>{app.profile?.name?.[0] || "?"}</Text>
                    </View>
                  )}

                  <Text style={[styles.applicantNameHorizontal, { color: theme.text }]} numberOfLines={2}>
                    {app.profile?.name} {app.profile?.surname}
                  </Text>

                  <View style={[styles.statusDotHorizontal, { backgroundColor: app.status === "accepted" ? "#4CAF50" : app.status === "rejected" ? "#F44336" : "#FF9800" }]} />
                </Pressable>
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
  imageWrapper: { borderRadius: 20, overflow: "hidden", marginBottom: 20, elevation: 4, shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 10 },
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
    width: 115,
    height: 160,
    borderRadius: 16,
    padding: 12,
    marginRight: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  avatarHorizontal: { width: 56, height: 56, borderRadius: 28, marginBottom: 8 },
  avatarPlaceholder: { backgroundColor: "#E1E1E1", justifyContent: "center", alignItems: "center" },
  avatarInitial: { fontWeight: "700", color: "#666", fontSize: 20 },
  applicantNameHorizontal: { fontWeight: "700", fontSize: 13, textAlign: "center", height: 35 },
  statusDotHorizontal: { width: 10, height: 10, borderRadius: 5, marginTop: 4 },
});