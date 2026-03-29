import { Colors } from "@/constants/theme";
import { supabase } from "@/lib/supabase";
import { useRouter, useFocusEffect } from "expo-router";
import React, { useState, useCallback } from "react";
import { Alert, Pressable, StyleSheet, Text, View, Image, ScrollView, ActivityIndicator } from "react-native";

type Profile = {
  id: string;
  name: string | null;
  surname: string | null;
  job_role: string | null;
  bio: string | null;
  avatar_url: string | null;
};

export default function ProfileManager() {
  const theme = Colors.light;
  const router = useRouter();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;

      const { data, error } = await supabase
        .from("profiles")
        .select("id, name, surname, job_role, bio, avatar_url")
        .eq("id", userData.user.id)
        .single();

      if (error) throw error;
      if (data) setProfile(data);
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to load profile");
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => {
    fetchProfile();
  }, [fetchProfile]));

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace("/auth/login");
  };

  const handleEdit = () => {
    router.push("/profile/editProfile");
  };

  // --- Display placeholders se loading
  const displayName = profile?.name || profile?.surname
    ? `${profile?.name ?? ""} ${profile?.surname ?? ""}`.trim()
    : "User";

  const avatarUrl = profile?.avatar_url ?? null;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.background }}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      {loading && (
        <View style={{ marginBottom: 10, alignItems: "center" }}>
          <ActivityIndicator size="small" color={theme.tint} />
          <Text style={{ color: theme.text, marginTop: 4 }}>Loading latest data...</Text>
        </View>
      )}

      {/* AVATAR */}
      <View style={[styles.avatarWrapper, { shadowColor: theme.tint, borderColor: theme.tint }]}>
        {avatarUrl ? (
          <Image source={{ uri: avatarUrl }} style={styles.avatarImage} resizeMode="cover" />
        ) : (
          <Text style={{ color: theme.text, fontSize: 36 }}>👤</Text>
        )}
      </View>

      {/* NOME E RUOLO */}
      <Text style={[styles.name, { color: theme.text }]}>{displayName}</Text>
      {profile?.job_role && <Text style={[styles.jobRole, { color: theme.tint }]}>{profile.job_role}</Text>}

      {/* BIO */}
      {profile?.bio && (
        <View style={[styles.bioCard, { backgroundColor: theme.card }]}>
          <Text style={[styles.bio, { color: theme.text }]}>{profile.bio}</Text>
        </View>
      )}

      {/* PULSANTI */}
      <Pressable onPress={handleEdit} style={[styles.button, { backgroundColor: theme.tint }]}>
        <Text style={styles.buttonText}>Edit Profile</Text>
      </Pressable>

      <Pressable onPress={handleLogout} style={[styles.button, { backgroundColor: theme.delete }]}>
        <Text style={styles.buttonText}>Logout</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: "center", paddingVertical: 32, paddingHorizontal: 24 },
  avatarWrapper: { width: 140, height: 140, borderRadius: 70, overflow: "hidden", marginBottom: 20, borderWidth: 2, justifyContent: "center", alignItems: "center", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 8 },
  avatarImage: { width: "100%", height: "100%" },
  name: { fontSize: 28, fontWeight: "bold", marginBottom: 4 },
  jobRole: { fontSize: 16, fontWeight: "600", opacity: 0.9, marginBottom: 12 },
  bioCard: { width: "90%", borderRadius: 16, padding: 20, marginBottom: 24, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 6, elevation: 4 },
  bio: { fontSize: 16, textAlign: "center", lineHeight: 24 },
  button: { width: "80%", padding: 16, borderRadius: 16, alignItems: "center", marginTop: 12 },
  buttonText: { color: "white", fontWeight: "bold", fontSize: 16 },
});