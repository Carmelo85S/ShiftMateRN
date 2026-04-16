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
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { fetchShiftFullDetails } from "@/queries/managerQueries";

const { width } = Dimensions.get("window");

export default function ShiftDetail() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams();

  // Unified state for shift details and applications
  const [data, setData] = useState<{ shift: any; applications: any[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    if (!id) return;
    try {
      const result = await fetchShiftFullDetails(id as string);
      setData(result);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  if (loading) return (
    <View style={[styles.center, { backgroundColor: theme.background }]}>
      <ActivityIndicator size="small" color={theme.text} />
    </View>
  );

  const { shift, applications } = data || {};

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <Stack.Screen options={{ 
        headerTitle: "",
        headerTransparent: true,
        headerTintColor: "#FFF",
      }} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={() => { setRefreshing(true); loadData(); }} 
            tintColor="#FFF" 
          />
        }
      >
        {/* HERO SECTION */}
        <View style={styles.heroContainer}>
          {shift?.image_url ? (
            <Image source={{ uri: shift.image_url }} style={styles.heroImage} />
          ) : (
            <View style={[styles.heroImage, { backgroundColor: theme.tint + "20" }]} />
          )}
          <View style={styles.heroGradientOverlay} />
          
          <View style={[styles.heroContent, { bottom: 60 }]}>
             <View style={[styles.statusBadge, { backgroundColor: shift?.status === 'open' ? theme.tint : '#4CAF50' }]}>
                <Text style={styles.statusBadgeText}>{shift?.status?.toUpperCase()}</Text>
             </View>
             <Text style={styles.heroTitle}>{shift?.title}</Text>
             <View style={styles.locationRow}>
                <Ionicons name="location" size={14} color="rgba(255,255,255,0.7)" />
                {/* Dynamic Business Name */}
                <Text style={styles.locationText}>
                  {shift?.businesses?.name || "Main Structure"}
                </Text>
             </View>
          </View>
        </View>

        <View style={[styles.mainContent, { backgroundColor: theme.background }]}>
          
          {/* INFO SECTION */}
          <View style={styles.infoSection}>
            <View style={styles.chipRow}>
              <View style={[styles.glassChip, { backgroundColor: theme.card }]}>
                <Ionicons name="calendar-outline" size={18} color={theme.tint} />
                <View>
                  <Text style={styles.chipLabel}>DATE</Text>
                  <Text style={[styles.chipValue, { color: theme.text }]}>
                    {shift?.shift_date ? new Date(shift.shift_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '-'}
                  </Text>
                </View>
              </View>
              
              <View style={[styles.glassChip, { backgroundColor: theme.card }]}>
                <Ionicons name="time-outline" size={18} color={theme.tint} />
                <View>
                  <Text style={styles.chipLabel}>HOURS</Text>
                  <Text style={[styles.chipValue, { color: theme.text }]}>
                    {shift?.start_time?.slice(0,5)} - {shift?.end_time?.slice(0,5)}
                  </Text>
                </View>
              </View>
            </View>

            {shift?.department && (
              <View style={[styles.deptBar, { backgroundColor: theme.text + "05" }]}>
                <View style={[styles.deptIndicator, { backgroundColor: theme.tint }]} />
                <Text style={[styles.deptText, { color: theme.secondaryText }]}>
                  Department: <Text style={{ color: theme.text, fontWeight: "700" }}>{shift.department.toUpperCase()}</Text>
                </Text>
              </View>
            )}
          </View>

          {/* DESCRIPTION */}
          <View style={styles.sectionContainer}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Description</Text>
            <Text style={[styles.description, { color: theme.secondaryText }]}>
              {shift?.description || "Providing high-quality service and maintaining the standard of the structure throughout the shift duration."}
            </Text>
          </View>

          {/* APPLICANTS */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Applicants</Text>
              <Text style={[styles.appsCount, { color: theme.tint }]}>{applications?.length || 0} total</Text>
            </View>

            {!applications || applications.length === 0 ? (
              <View style={styles.emptyAppsBox}>
                <Ionicons name="people-outline" size={32} color={theme.text + "20"} />
                <Text style={{ color: theme.text, opacity: 0.3, marginTop: 10 }}>No candidates yet</Text>
              </View>
            ) : (
              <View style={styles.appsGrid}>
                {applications.map((app: any) => (
                  <Pressable
                    key={app.id}
                    onPress={() => router.push({ pathname: "/(manager)/candidate/[id]", params: { id: app.profile_id, shiftId: id }})}
                    style={styles.candidateCard}
                  >
                    <View style={styles.avatarContainer}>
                      <Image 
                        source={app.profiles?.avatar_url ? { uri: app.profiles.avatar_url } : require("@/assets/images/icon.png")} 
                        style={styles.newAvatar} 
                      />
                      <View style={[styles.statusIndicator, { 
                        backgroundColor: app.status === 'accepted' ? '#4CAF50' : app.status === 'rejected' ? '#FF3B30' : '#FFCC00' 
                      }]} />
                    </View>
                    <Text style={[styles.newAppName, { color: theme.text }]} numberOfLines={1}>
                      {app.profiles?.name}
                    </Text>
                    <Text style={styles.appRole}>Worker</Text>
                  </Pressable>
                ))}
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* FAB */}
      <Pressable 
        onPress={() => router.push({ pathname: "/(manager)/(tabs)/shift/editShift", params: { id: shift?.id } })}
        style={[styles.enhancedFab, { backgroundColor: theme.text }]}
      >
        <Ionicons name="options-outline" size={24} color={theme.background} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  heroContainer: { height: 420, width: '100%', position: 'relative' },
  heroImage: { width: '100%', height: '100%' },
  heroGradientOverlay: { 
    ...StyleSheet.absoluteFillObject, 
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  heroContent: { position: 'absolute', left: 24, right: 24 },
  heroTitle: { color: '#FFF', fontSize: 32, fontWeight: '800', letterSpacing: -0.5, marginBottom: 8 },
  statusBadge: { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, marginBottom: 12 },
  statusBadgeText: { color: '#FFF', fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  locationText: { color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: '500' },
  mainContent: { flex: 1, marginTop: -30, borderTopLeftRadius: 32, borderTopRightRadius: 32, paddingHorizontal: 24, paddingTop: 32 },
  infoSection: { marginBottom: 32 },
  chipRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  glassChip: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)' },
  chipLabel: { fontSize: 9, fontWeight: '700', opacity: 0.4, marginBottom: 2 },
  chipValue: { fontSize: 15, fontWeight: '700' },
  deptBar: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 20, gap: 12 },
  deptIndicator: { width: 4, height: 20, borderRadius: 2 },
  deptText: { fontSize: 13, fontWeight: '600' },
  sectionContainer: { marginBottom: 32 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 16 },
  sectionTitle: { fontSize: 20, fontWeight: '800', letterSpacing: -0.5 },
  appsCount: { fontSize: 14, fontWeight: '600' },
  description: { fontSize: 15, lineHeight: 24, opacity: 0.7 },
  appsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  candidateCard: { width: (width - 80) / 3, alignItems: 'center' },
  avatarContainer: { position: 'relative', marginBottom: 8 },
  newAvatar: { width: 64, height: 64, borderRadius: 22, backgroundColor: '#EEE' },
  statusIndicator: { position: 'absolute', bottom: -2, right: -2, width: 14, height: 14, borderRadius: 7, borderWidth: 2, borderColor: '#FFF' },
  newAppName: { fontSize: 13, fontWeight: '700' },
  appRole: { fontSize: 11, opacity: 0.4, fontWeight: '600' },
  emptyAppsBox: { padding: 40, alignItems: 'center', borderRadius: 24, borderStyle: 'dashed', borderWidth: 2, borderColor: 'rgba(0,0,0,0.05)' },
  enhancedFab: { 
    position: 'absolute', right: 24, bottom: 40, width: 60, height: 60, borderRadius: 20, 
    justifyContent: "center", alignItems: "center",
    shadowColor: "#000", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.15, shadowRadius: 15, elevation: 8 
  }
});