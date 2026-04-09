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
    const start = Date.now();
    if (!id) return;
    
    try {
      // 1. Lanciamo ENTRAMBE le query insieme
      const [shiftRes, appsRes] = await Promise.all([
        supabase.from("shifts").select("*").eq("id", id).single(),
        supabase.from("applications")
          .select(`id, status, profile_id, profiles(name, surname, avatar_url)`)
          .eq("shift_id", id)
      ]);

      // 2. Gestiamo i risultati
      if (shiftRes.data) setShift(shiftRes.data);
      if (appsRes.data) setApplications(appsRes.data);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingApps(false);
      const end = Date.now();
      console.log(`🚀 ShiftDetail optimized duration: ${end - start}ms`);
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
  
  // HERO SECTION: Immagine immersiva
  heroContainer: { height: 380, width: '100%' },
  heroImage: { width: '100%', height: '100%' },
  heroOverlay: { 
    ...StyleSheet.absoluteFillObject, 
    backgroundColor: 'rgba(0,0,0,0.35)' // Leggermente più chiaro per far respirare i colori
  },
  heroContent: { 
    position: 'absolute', 
    bottom: 50, // Più spazio dal bordo per l'overlap della card
    left: 28, 
    right: 28 
  },
  heroTitle: { 
    color: '#FFF', 
    fontSize: 34, 
    fontWeight: '800', 
    letterSpacing: -1,
    lineHeight: 38 
  },
  badge: { 
    alignSelf: 'flex-start', 
    paddingHorizontal: 10, 
    paddingVertical: 5, 
    borderRadius: 10, 
    marginBottom: 14,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 10
  },
  badgeText: { color: '#FFF', fontSize: 11, fontWeight: '800', letterSpacing: 0.5 },
  
  // MAIN CONTENT: La "superficie" che sale
  mainContent: { 
    flex: 1, 
    marginTop: -35, 
    borderTopLeftRadius: 36, 
    borderTopRightRadius: 36, 
    padding: 28,
    // Un'ombra leggerissima verso l'alto per dare profondità all'overlap
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
  },

  // CHIPS: Pillole di informazione eleganti
  chipRow: { flexDirection: 'row', gap: 12, marginBottom: 35 },
  chip: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 8, 
    paddingHorizontal: 16, 
    paddingVertical: 12, 
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.02)', // Soft background
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)'
  },
  chipText: { fontSize: 14, fontWeight: '600', letterSpacing: -0.2 },
  
  // TESTI
  sectionTitle: { 
    fontSize: 22, 
    fontWeight: '700', 
    marginBottom: 12, 
    letterSpacing: -0.6 
  },
  description: { 
    fontSize: 16, 
    lineHeight: 25, 
    opacity: 0.5, 
    marginBottom: 35,
    fontWeight: '400' 
  },
  
  // APPLICANTS: Grid di candidati "Clean"
  sectionHeader: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', // Titolo a sx, conteggio a dx
    marginBottom: 20 
  },
  countBadge: { 
    paddingHorizontal: 12, 
    paddingVertical: 6, 
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.04)' 
  },
  
  appsGrid: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    gap: 14, // Aumentato il gap
    justifyContent: 'space-between'
  },
  appCard: { 
    width: (width - 70) / 3, // Calcolo preciso per 3 colonne
    paddingVertical: 18,
    paddingHorizontal: 10, 
    borderRadius: 24, 
    alignItems: 'center',
    backgroundColor: '#FFF',
    // Invece di ombre forti, usiamo un bordo quasi invisibile o ombra "cloud"
    shadowColor: '#000', 
    shadowOpacity: 0.03, 
    shadowRadius: 15, 
    elevation: 2 
  },
  appAvatar: { 
    width: 56, 
    height: 56, 
    borderRadius: 20, // Avatar "Squircle" per coerenza
    marginBottom: 10 
  },
  appName: { 
    fontSize: 13, 
    fontWeight: '600', 
    textAlign: 'center' 
  },
  statusDot: { 
    width: 8, 
    height: 8, 
    borderRadius: 4, 
    marginTop: 8,
    borderWidth: 1.5,
    borderColor: '#FFF' // Effetto "ritaglio" sul dot
  },
  
  emptyApps: { 
    padding: 50, 
    alignItems: 'center', 
    justifyContent: 'center', 
    borderWidth: 2, 
    borderStyle: 'dashed', 
    borderColor: 'rgba(0,0,0,0.05)', 
    borderRadius: 24 
  },
  
  // FAB: Azione principale
  fab: { 
    position: 'absolute', 
    right: 28, 
    width: 52, // Leggermente più grande
    height: 52,
    borderRadius: 32, 
    justifyContent: "center",
    alignItems: "center",
    // Ombra molto più diffusa (Soft Shadow)
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  }
});