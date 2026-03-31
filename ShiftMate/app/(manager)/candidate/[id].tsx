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
} from "react-native";
import { useLocalSearchParams, Stack, useRouter } from "expo-router";
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { Colors } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Profile = {
  id: string;
  name: string | null;
  surname: string | null;
  avatar_url: string | null;
  bio: string | null;
  experience: string | null;
  phone: string | null;
  job_role: string | null;
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
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      setProfile(data);
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
      const { error } = await supabase
        .from("applications")
        .update({ status: status })
        .eq("shift_id", shiftId)
        .eq("profile_id", id);

      if (error) throw error;

      Alert.alert(
        status === "accepted" ? "Candidate Accepted" : "Candidate Rejected",
        `The application status has been updated successfully.`,
        [{ text: "OK", onPress: () => router.back() }]
      );
    } catch (err) {
      console.error("Update Error:", err);
      Alert.alert("Error", "Could not update application status. Please try again.");
    } finally {
      setProcessing(null);
    }
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
        <Text style={{ color: theme.text, fontSize: 16, opacity: 0.6 }}>
          Candidate profile not found.
        </Text>
      </View>
    );
  }

  const fullName = `${profile.name ?? ""} ${profile.surname ?? ""}`.trim() || "Candidate";

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={colorScheme === "dark" ? "light-content" : "dark-content"} />
      <Stack.Screen 
        options={{ 
          title: fullName, // Premium dynamic title
          headerBackTitle: "Back",
          headerShadowVisible: false,
          headerStyle: { backgroundColor: theme.background },
          headerTintColor: theme.text,
          headerTitleStyle: { fontWeight: "700", fontSize: 18 },
        }} 
      />
      
      <ScrollView 
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 120 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header Area */}
        <View style={styles.profileHeader}>
          <View style={[styles.avatarWrapper, { shadowColor: theme.text }]}>
            {profile.avatar_url ? (
              <Image source={{ uri: profile.avatar_url }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.avatarPlaceholder, { backgroundColor: theme.card }]}>
                <Ionicons name="person" size={48} color={theme.text} style={{ opacity: 0.2 }} />
              </View>
            )}
          </View>
          
          <Text style={[styles.role, { color: theme.text, backgroundColor: theme.card }]}>
            {profile.job_role?.toUpperCase() || "APPLICANT"}
          </Text>
        </View>

        {/* Info Sections - Clean Cards */}
        <View style={styles.infoContainer}>
          <View style={[styles.sectionCard, { backgroundColor: theme.card }]}>
            <Text style={[styles.sectionLabel, { color: theme.text }]}>Biography</Text>
            <Text style={[styles.sectionText, { color: theme.text }]}>
              {profile.bio || "No biography provided by the candidate."}
            </Text>
          </View>

          <View style={[styles.sectionCard, { backgroundColor: theme.card }]}>
            <Text style={[styles.sectionLabel, { color: theme.text }]}>Professional Experience</Text>
            <Text style={[styles.sectionText, { color: theme.text }]}>
              {profile.experience || "Experience details not specified."}
            </Text>
          </View>
          
          {profile.phone && (
            <View style={[styles.sectionCard, styles.contactCard, { backgroundColor: theme.card }]}>
              <Ionicons name="call-outline" size={20} color={theme.text} style={{ opacity: 0.6 }} />
              <Text style={[styles.contactText, { color: theme.text }]}>{profile.phone}</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Premium Action Buttons - Fixed at bottom */}
      <View style={[styles.actionBar, { backgroundColor: theme.background, paddingBottom: insets.bottom + 20 }]}>
        <View style={styles.actionRow}>
          {/* Reject Button - Subtle Outline */}
          <Pressable 
            style={({ pressed }) => [
              styles.button, 
              styles.buttonSecondary, 
              { borderColor: theme.text, opacity: pressed || processing ? 0.6 : 1 }
            ]} 
            onPress={() => handleUpdateStatus('rejected')}
            disabled={processing !== null}
          >
            {processing === 'rejected' ? (
              <ActivityIndicator size="small" color={theme.text} />
            ) : (
              <Text style={[styles.buttonTextSecondary, { color: theme.text }]}>Reject</Text>
            )}
          </Pressable>

          {/* Accept Button - Prime Solid */}
          <Pressable 
            style={({ pressed }) => [
              styles.button, 
              styles.buttonPrimary, 
              { backgroundColor: theme.text, opacity: pressed || processing ? 0.8 : 1 }
            ]} 
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
  scrollContent: { padding: 24 },
  
  // Header Style
  profileHeader: { alignItems: "center", marginBottom: 32, marginTop: 10 },
  avatarWrapper: {
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    borderRadius: 65,
    marginBottom: 20,
  },
  avatar: { width: 130, height: 130, borderRadius: 65 },
  avatarPlaceholder: { justifyContent: 'center', alignItems: 'center' },
  role: { 
    fontSize: 11, 
    fontWeight: "800", 
    letterSpacing: 1.5, 
    paddingHorizontal: 16, 
    paddingVertical: 6, 
    borderRadius: 20, 
    overflow: 'hidden' 
  },

  // Info Cards Style
  infoContainer: { gap: 16 },
  sectionCard: {
    padding: 20,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  sectionLabel: { fontSize: 14, fontWeight: "700", marginBottom: 10, opacity: 0.5, letterSpacing: 0.5 },
  sectionText: { fontSize: 16, lineHeight: 24, fontWeight: "400" },
  
  // Contact Card
  contactCard: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 16 },
  contactText: { fontSize: 16, fontWeight: "600" },

  // Action Bar Style
  actionBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  actionRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  button: {
    flex: 1,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  
  // Primary Button (Accept)
  buttonPrimary: {},
  buttonTextPrimary: { fontWeight: "700", fontSize: 16 },
  
  // Secondary Button (Reject)
  buttonSecondary: {
    borderWidth: 1.5,
    backgroundColor: 'transparent',
  },
  buttonTextSecondary: { fontWeight: "700", fontSize: 16 },
});