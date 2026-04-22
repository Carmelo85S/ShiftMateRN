import {
  View,
  Text,
  StyleSheet,
  Image,
  ActivityIndicator,
  ScrollView,
  Pressable,
  Alert,
  useColorScheme,
  StatusBar,
  Linking,
} from "react-native";
import { useLocalSearchParams, Stack, useRouter } from "expo-router";
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { Colors } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { fetchCandidateProfile, fetchCandidateShiftDetails, updateApplicationStatus } from "@/queries/managerQueries";

// --- TYPES ---
type Profile = {
  id: string;
  name: string | null;
  surname: string | null;
  avatar_url: string | null;
  bio: string | null;
  experience: string | null;
  phone: string | null;
  job_role: string | null;
  department: string | null;
};

type ShiftInfo = {
  title: string;
  shift_date: string;
  start_time: string;
  end_time: string;
};

interface ShiftDbResponse {
  status: string;
  title: string;
  shift_date: string;
  start_time: string;
  end_time: string;
}

export default function CandidateProfile() {
  const { id, shiftId } = useLocalSearchParams();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];
  const insets = useSafeAreaInsets();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<"accepted" | "rejected" | null>(null);
  
  const [applicationStatus, setApplicationStatus] = useState<string | null>(null);
  const [shiftStatus, setShiftsStatus] = useState<string | null>(null);
  const [shiftInfo, setShiftInfo] = useState<ShiftInfo | null>(null);

  const fetchProfile = useCallback(async () => {
    if (!id || !shiftId) return;
    setLoading(true);
    try {
      const data = await fetchCandidateShiftDetails(shiftId as string, id as string);
      
      if (!data.profile) {
        setProfile(null);
        return;
      }
      setProfile(data.profile);
      setApplicationStatus(data.applicationStatus);
      setShiftsStatus(data.shiftStatus);
      setShiftInfo(data.shiftInfo);
    } catch (err) {
      console.error("Error fetching profile:", err);
      Alert.alert("Error", "Could not load candidate profile.");
    } finally {
      setLoading(false);
    }
  }, [id, shiftId]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleUpdateStatus = async (status: "accepted" | "rejected") => {
    if (!shiftId || !id) {
      Alert.alert("Error", "Missing shift or candidate information.");
      return;
    }

    setProcessing(status);
    try {
      await updateApplicationStatus(shiftId as string, id as string, status);
      
      // Aggiornamento ottimistico dello stato locale
      setApplicationStatus(status);
      if (status === 'accepted') setShiftsStatus('filled');

      Alert.alert(
        status === "accepted" ? "Success" : "Rejected",
        `The candidate has been ${status}.`,
        [{ text: "OK", onPress: () => router.back() }]
      );
    } catch (err) {
      console.error("Update Error:", err);
      Alert.alert("Error", "Action failed. The shift might already be filled.");
    } finally {
      setProcessing(null);
    }
  };

  const makeCall = (phoneNumber: string) => {
    const url = `tel:${phoneNumber}`;
    Linking.canOpenURL(url).then((supported) => {
      if (supported) Linking.openURL(url);
      else Alert.alert("Error", "Calls not supported.");
    });
  };

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="small" color={theme.text} />
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <Text style={{ color: theme.text, opacity: 0.6 }}>Profile not found.</Text>
      </View>
    );
  }

  const fullName = `${profile.name ?? ""} ${profile.surname ?? ""}`.trim() || "Candidate";

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={colorScheme === "dark" ? "light-content" : "dark-content"} />
      <Stack.Screen 
        options={{ 
          title: fullName, 
          headerStyle: { backgroundColor: theme.background }, 
          headerTintColor: theme.text,
          headerShadowVisible: false 
        }} 
      />
      
      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 120 }]}>
        {/* HEADER PROFILO */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarWrapper}>
            {profile.avatar_url ? (
              <Image source={{ uri: profile.avatar_url }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, { backgroundColor: theme.card, justifyContent: 'center', alignItems: 'center' }]}>
                <Ionicons name="person" size={50} color={theme.text} style={{ opacity: 0.1 }} />
              </View>
            )}
          </View>
          <View style={[styles.deptBadge, { backgroundColor: theme.tint + "15" }]}>
            <Text style={[styles.deptText, { color: theme.tint }]}>{profile.department?.toUpperCase() || "STAFF"}</Text>
          </View>
          <Text style={[styles.jobRole, { color: theme.text }]}>{profile.job_role || "Staff Member"}</Text>
        </View>

        {/* SHIFT CONTEXT CARD */}
        {shiftInfo && (
          <View style={[styles.shiftContextCard, { backgroundColor: theme.card }]}>
            <View style={[styles.shiftIconContainer, { backgroundColor: theme.tint + "15" }]}>
              <Ionicons name="calendar" size={18} color={theme.tint} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.shiftLabel, { color: theme.text + "60" }]}>APPLICATION FOR</Text>
              <Text style={[styles.shiftTitle, { color: theme.text }]}>{shiftInfo.title}</Text>
              <Text style={[styles.shiftDate, { color: theme.text + "80" }]}>
                {new Date(shiftInfo.shift_date).toLocaleDateString('it-IT', { weekday: 'short', day: 'numeric', month: 'short' })} • {shiftInfo.start_time.slice(0, 5)} - {shiftInfo.end_time.slice(0, 5)}
              </Text>
            </View>
          </View>
        )}

        <View style={styles.infoContainer}>
          <View style={[styles.sectionCard, { backgroundColor: theme.card, borderLeftWidth: 4, borderLeftColor: theme.tint }]}>
            <Text style={[styles.sectionLabel, { color: theme.text }]}>EXPERIENCE</Text>
            <Text style={[styles.experienceText, { color: theme.text }]}>{profile.experience || "No details provided."}</Text>
          </View>

          <View style={[styles.sectionCard, { backgroundColor: theme.card }]}>
            <Text style={[styles.sectionLabel, { color: theme.text }]}>ABOUT</Text>
            <Text style={[styles.sectionText, { color: theme.text }]}>{profile.bio || "No biography provided."}</Text>
          </View>

          {profile.phone && (
            <Pressable onPress={() => makeCall(profile.phone!)} style={[styles.sectionCard, styles.contactCard, { backgroundColor: theme.card }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <Ionicons name="call" size={20} color={theme.tint} />
                <Text style={[styles.contactText, { color: theme.text }]}>{profile.phone}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={theme.text} style={{ opacity: 0.3 }} />
            </Pressable>
          )}
        </View>
      </ScrollView>

      {/* --- DYNAMIC ACTION BAR --- */}
      <View style={[styles.actionBar, { backgroundColor: theme.background, paddingBottom: insets.bottom + 20 }]}>
        {applicationStatus === 'accepted' ? (
          <View style={[styles.statusBanner, { backgroundColor: '#4CAF5015' }]}>
            <Ionicons name="checkmark-circle" size={22} color="#4CAF50" />
            <Text style={[styles.statusBannerText, { color: '#4CAF50' }]}>Candidate Accepted</Text>
          </View>
        ) : shiftStatus === 'filled' || shiftStatus === 'assigned' ? (
          <View style={[styles.statusBanner, { backgroundColor: theme.card }]}>
            <Ionicons name="lock-closed" size={20} color={theme.text + "40"} />
            <Text style={[styles.statusBannerText, { color: theme.text + "40" }]}>Shift already filled</Text>
          </View>
        ) : (
          <View style={styles.actionRow}>
            <Pressable 
              style={[styles.button, styles.buttonSecondary, { borderColor: theme.text }]} 
              onPress={() => handleUpdateStatus('rejected')}
              disabled={processing !== null}
            >
              <Text style={[styles.buttonTextSecondary, { color: theme.text }]}>Reject</Text>
            </Pressable>

            <Pressable 
              style={[styles.button, styles.buttonPrimary, { backgroundColor: theme.text }]} 
              onPress={() => handleUpdateStatus('accepted')}
              disabled={processing !== null}
            >
              {processing === 'accepted' ? (
                <ActivityIndicator size="small" color={theme.background} />
              ) : (
                <Text style={[styles.buttonTextPrimary, { color: theme.background }]}>Accept Candidate</Text>
              )}
            </Pressable>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  scrollContent: { padding: 20 },
  profileHeader: { alignItems: "center", marginBottom: 25 },
  avatarWrapper: { width: 120, height: 120, borderRadius: 60, overflow: 'hidden', marginBottom: 15 },
  avatar: { width: '100%', height: '100%' },
  deptBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 8, marginBottom: 8 },
  deptText: { fontSize: 10, fontWeight: "900", letterSpacing: 1 },
  jobRole: { fontSize: 22, fontWeight: "700" },
  
  shiftContextCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 20,
    marginBottom: 25,
    alignItems: 'center',
    gap: 15,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)',
  },
  shiftIconContainer: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  shiftLabel: { fontSize: 9, fontWeight: "900", letterSpacing: 0.5, marginBottom: 2 },
  shiftTitle: { fontSize: 15, fontWeight: "800" },
  shiftDate: { fontSize: 13, fontWeight: "600", marginTop: 2 },

  infoContainer: { gap: 16 },
  sectionCard: { padding: 20, borderRadius: 20 },
  sectionLabel: { fontSize: 10, fontWeight: "800", marginBottom: 8, opacity: 0.4 },
  experienceText: { fontSize: 16, fontWeight: "700", lineHeight: 22 },
  sectionText: { fontSize: 15, lineHeight: 22, opacity: 0.8 },
  contactCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  contactText: { fontSize: 17, fontWeight: "700" },
  
  actionBar: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: 20, paddingTop: 15, borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.05)' },
  actionRow: { flexDirection: 'row', gap: 12 },
  button: { flex: 1, height: 60, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  buttonPrimary: { elevation: 2 },
  buttonSecondary: { borderWidth: 1.5 },
  buttonTextPrimary: { fontWeight: "800", fontSize: 16 },
  buttonTextSecondary: { fontWeight: "800", fontSize: 16 },
  statusBanner: { height: 60, borderRadius: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, width: '100%' },
  statusBannerText: { fontSize: 16, fontWeight: '800' },
});