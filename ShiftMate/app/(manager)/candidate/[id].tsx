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
import { fetchCandidateProfile, updateApplicationStatus } from "@/queries/managerQueries";

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

export default function CandidateProfile() {
  const { id, shiftId } = useLocalSearchParams();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];
  const insets = useSafeAreaInsets();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<"accepted" | "rejected" | null>(null);

  const fetchProfile = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      // Fetch candidate profile using the query function defined in managerQueries.ts
      const profileData = await fetchCandidateProfile(id as string);
      setProfile(profileData);
    } catch (err) {
      console.error("Error fetching profile:", err);
      Alert.alert("Error", "Could not load candidate profile.");
    } finally {
      setLoading(false);
    }
  }, [id]);

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

      Alert.alert(
        status === "accepted" ? "Success" : "Rejected",
        `The candidate has been ${status}.`,
        [{ text: "OK", onPress: () => router.back() }]
      );
    } catch (err) {
      console.error("Update Error:", err);
      Alert.alert("Error", "Action failed. Please try again.");
    } finally {
      setProcessing(null);
    }
  };

  const makeCall = (phoneNumber: string) => {
    const url = `tel:${phoneNumber}`;
    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) Linking.openURL(url);
        else Alert.alert("Error", "Phone calls are not supported on this device.");
      })
      .catch((err) => console.error(err));
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
          headerShadowVisible: false,
          headerStyle: { backgroundColor: theme.background },
          headerTintColor: theme.text,
        }} 
      />
      
      <ScrollView 
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 120 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header con Avatar e Dipartimento */}
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
            <Text style={[styles.deptText, { color: theme.tint }]}>
              {profile.department?.toUpperCase() || "STAFF"}
            </Text>
          </View>
          
          <Text style={[styles.jobRole, { color: theme.text }]}>
            {profile.job_role || "No specific role"}
          </Text>
        </View>

        <View style={styles.infoContainer}>
          {/* Esperienza - Card evidenziata */}
          <View style={[styles.sectionCard, { backgroundColor: theme.card, borderLeftWidth: 4, borderLeftColor: theme.tint }]}>
            <Text style={[styles.sectionLabel, { color: theme.text }]}>PROFESSIONAL EXPERIENCE</Text>
            <Text style={[styles.experienceText, { color: theme.text }]}>
              {profile.experience || "No experience details provided."}
            </Text>
          </View>

          {/* Biografia */}
          <View style={[styles.sectionCard, { backgroundColor: theme.card }]}>
            <Text style={[styles.sectionLabel, { color: theme.text }]}>ABOUT</Text>
            <Text style={[styles.sectionText, { color: theme.text }]}>
              {profile.bio || "Candidate has not provided a biography."}
            </Text>
          </View>
          
          {/* Card Contatto - Interattiva */}
          {profile.phone && (
            <Pressable 
              onPress={() => makeCall(profile.phone!)}
              style={({ pressed }) => [
                styles.sectionCard, 
                styles.contactCard, 
                { backgroundColor: theme.card, opacity: pressed ? 0.7 : 1 }
              ]}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <View style={[styles.iconCircle, { backgroundColor: theme.tint }]}>
                  <Ionicons name="call" size={18} color={theme.background} />
                </View>
                <View>
                  <Text style={[styles.sectionLabel, { color: theme.text, marginBottom: 0 }]}>PHONE NUMBER</Text>
                  <Text style={[styles.contactText, { color: theme.text }]}>{profile.phone}</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color={theme.text} style={{ opacity: 0.3 }} />
            </Pressable>
          )}
        </View>
      </ScrollView>

      {/* Footer con bottoni di azione */}
      <View style={[styles.actionBar, { backgroundColor: theme.background, paddingBottom: insets.bottom + 20 }]}>
        <View style={styles.actionRow}>
          <Pressable 
            style={[styles.button, styles.buttonSecondary, { borderColor: theme.text }]} 
            onPress={() => handleUpdateStatus('rejected')}
            disabled={processing !== null}
          >
            {processing === 'rejected' ? (
              <ActivityIndicator size="small" color={theme.text} />
            ) : (
              <Text style={[styles.buttonTextSecondary, { color: theme.text }]}>Reject</Text>
            )}
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
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  scrollContent: { padding: 20 },
  profileHeader: { alignItems: "center", marginBottom: 30 },
  avatarWrapper: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: 'hidden',
    marginBottom: 15,
    borderWidth: 3,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  avatar: { width: '100%', height: '100%' },
  deptBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 8,
  },
  deptText: { fontSize: 10, fontWeight: "900", letterSpacing: 1 },
  jobRole: { fontSize: 20, fontWeight: "700", letterSpacing: -0.5 },

  infoContainer: { gap: 16 },
  sectionCard: {
    padding: 20,
    borderRadius: 20,
  },
  sectionLabel: { fontSize: 10, fontWeight: "800", marginBottom: 8, opacity: 0.4, letterSpacing: 1 },
  experienceText: { fontSize: 16, fontWeight: "700", lineHeight: 22 },
  sectionText: { fontSize: 15, lineHeight: 22, opacity: 0.8 },
  
  contactCard: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between' 
  },
  iconCircle: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  contactText: { fontSize: 17, fontWeight: "700" },

  actionBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.03)',
  },
  actionRow: { flexDirection: 'row', gap: 12 },
  button: {
    flex: 1,
    height: 60,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonPrimary: { elevation: 2 },
  buttonSecondary: { borderWidth: 1.5 },
  buttonTextPrimary: { fontWeight: "800", fontSize: 16 },
  buttonTextSecondary: { fontWeight: "800", fontSize: 16 },
});