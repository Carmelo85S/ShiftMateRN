import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  Image,
  Pressable,
  ActivityIndicator,
  RefreshControl,
  useColorScheme,
  Dimensions,
} from "react-native";
import { Colors } from "@/constants/theme";
import { useLocalSearchParams, useRouter, Stack, useFocusEffect } from "expo-router";
import { useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

export default function ShiftDetail() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams();

  const [shift, setShift] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [applications, setApplications] = useState<any[]>([]);
  const [loadingApps, setLoadingApps] = useState(true);

  const loadData = useCallback(async () => {
    if (!id) return;
    try {
      const { data: shiftData } = await supabase.from("shifts").select("*").eq("id", id).single();
      setShift(shiftData);

      setLoadingApps(true);
      const { data: appsData } = await supabase
        .from("applications")
        .select(`id, status, profile_id, profiles(name, surname, avatar_url)`)
        .eq("shift_id", id);
      
      setApplications(appsData || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingApps(false);
    }
  }, [id]);

  useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

  if (loading) return (
    <View style={[styles.center, { backgroundColor: theme.background }]}>
      <ActivityIndicator size="small" color={theme.text} />
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <Stack.Screen options={{ 
        headerTitle: "Shift details", 
        headerTransparent: true,
        headerTintColor: "#FFF", 
      }} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadData(); }} />}
      >
        {/* HERO IMAGE SECTION */}
        <View style={styles.heroContainer}>
          {shift?.image_url ? (
            <Image source={{ uri: shift.image_url }} style={styles.heroImage} />
          ) : (
            <View style={[styles.heroImage, { backgroundColor: theme.text + "10" }]} />
          )}
          <View style={styles.heroOverlay} />
          <View style={[styles.heroContent, { paddingBottom: 30 }]}>
             <View style={[styles.badge, { backgroundColor: theme.tint }]}>
                <Text style={styles.badgeText}>{shift?.status?.toUpperCase()}</Text>
             </View>
             <Text style={styles.heroTitle}>{shift?.title}</Text>
          </View>
        </View>

        <View style={[styles.mainContent, { backgroundColor: theme.background }]}>
          {/* INFO CHIPS */}
          <View style={styles.chipRow}>
            <View style={[styles.chip, { backgroundColor: theme.card }]}>
              <Ionicons name="calendar" size={16} color={theme.tint} />
              <Text style={[styles.chipText, { color: theme.text }]}>
                {new Date(shift?.shift_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </Text>
            </View>
            <View style={[styles.chip, { backgroundColor: theme.card }]}>
              <Ionicons name="time" size={16} color={theme.tint} />
              <Text style={[styles.chipText, { color: theme.text }]}>
                {shift?.start_time?.slice(0,5)} - {shift?.end_time?.slice(0,5)}
              </Text>
            </View>
          </View>

          {/* DESCRIPTION */}
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Description</Text>
          <Text style={[styles.description, { color: theme.text }]}>{shift?.description || "No description provided."}</Text>

          {/* APPLICANTS SECTION */}
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Applicants</Text>
            <View style={[styles.countBadge, { backgroundColor: theme.text + "10" }]}>
              <Text style={{ color: theme.text, fontWeight: "700" }}>{applications.length}</Text>
            </View>
          </View>

          {loadingApps ? (
            <ActivityIndicator size="small" color={theme.tint} />
          ) : applications.length === 0 ? (
            <View style={styles.emptyApps}>
              <Text style={{ color: theme.text, opacity: 0.4 }}>No applications yet</Text>
            </View>
          ) : (
            <View style={styles.appsGrid}>
              {applications.map((app) => (
                <Pressable
                  key={app.id}
                  onPress={() => router.push({ pathname: "/(manager)/candidate/[id]", params: { id: app.profile_id, shiftId: id }})}
                  style={[styles.appCard, { backgroundColor: theme.card }]}
                >
                  <Image 
                    source={app.profiles?.avatar_url ? { uri: app.profiles.avatar_url } : require("@/assets/images/icon.png")} 
                    style={styles.appAvatar} 
                  />
                  <Text style={[styles.appName, { color: theme.text }]} numberOfLines={1}>
                    {app.profiles?.name}
                  </Text>
                  <View style={[styles.statusDot, { 
                    backgroundColor: app.status === 'accepted' ? '#4CAF50' : app.status === 'rejected' ? '#FF3B30' : '#FFCC00' 
                  }]} />
                </Pressable>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* FLOATING ACTION BUTTON (EDIT) */}
      <Pressable 
        onPress={() => router.push({ pathname: "/(manager)/(tabs)/shift/editShift", params: { id: shift.id } })}
        style={[styles.fab, { backgroundColor: theme.text, bottom: insets.bottom + 20 }]}
      >
        <Ionicons name="pencil" size={24} color={theme.background} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  heroContainer: { height: 350, width: '100%' },
  heroImage: { width: '100%', height: '100%' },
  heroOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.4)' },
  heroContent: { position: 'absolute', bottom: 0, left: 24, right: 24, paddingBottom: 40 },
  heroTitle: { color: '#FFF', fontSize: 32, fontWeight: '800', letterSpacing: -0.5 },
  badge: { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 8, marginBottom: 12 },
  badgeText: { color: '#FFF', fontSize: 10, fontWeight: '800' },
  
  mainContent: { flex: 1, marginTop: -30, borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24 },
  chipRow: { flexDirection: 'row', gap: 12, marginBottom: 32 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 16 },
  chipText: { fontSize: 14, fontWeight: '600' },
  
  sectionTitle: { fontSize: 20, fontWeight: '800', marginBottom: 12, letterSpacing: -0.5 },
  description: { fontSize: 16, lineHeight: 24, opacity: 0.6, marginBottom: 32 },
  
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20 },
  countBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  
  appsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  appCard: { width: (width - 72) / 3, padding: 12, borderRadius: 20, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
  appAvatar: { width: 50, height: 50, borderRadius: 25, marginBottom: 8 },
  appName: { fontSize: 12, fontWeight: '700' },
  statusDot: { width: 8, height: 8, borderRadius: 4, marginTop: 6 },
  
  emptyApps: { padding: 40, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderStyle: 'dashed', borderColor: '#CCC', borderRadius: 20 },
  
  fab: { position: 'absolute', right: 24, width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 10, elevation: 5 }
});