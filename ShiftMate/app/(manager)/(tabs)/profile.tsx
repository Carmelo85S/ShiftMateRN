import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { supabase } from "@/lib/supabase";
import { useRouter, useFocusEffect } from "expo-router";
import React, { useState, useCallback } from "react";
import { Alert, Pressable, StyleSheet, Text, View, Image } from "react-native";

type Profile = {
  id: string;
  name: string | null;
  surname: string | null;
  job_role: string | null;
  bio: string | null;
  avatar_url: string | null;
};

export default function ProfileManager() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];
  const router = useRouter();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    setLoading(true);
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

  // 🔄 Aggiorna profilo ogni volta che lo screen torna in focus
  useFocusEffect(
    useCallback(() => {
      fetchProfile();
    }, [fetchProfile])
  );

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace("/auth/login");
  };

  const handleEdit = () => {
    router.push("/profile/editProfile");
  };

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <Text style={{ color: theme.text }}>Loading...</Text>
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <Text style={{ color: theme.text }}>No profile found</Text>
      </View>
    );
  }

  const displayName =
    profile.name || profile.surname
      ? `${profile.name ?? ""} ${profile.surname ?? ""}`.trim()
      : "User";

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View
        style={[styles.avatarWrapper, { shadowColor: theme.tint, borderColor: theme.tint }]}
      >
        {profile.avatar_url ? (
          <Image
            source={{ uri: profile.avatar_url }}
            style={styles.avatarImage}
            resizeMode="cover"
          />
        ) : (
          <Text style={{ color: theme.text, fontSize: 36 }}>👤</Text>
        )}
      </View>

      <Text style={[styles.name, { color: theme.text }]}>{displayName}</Text>
      {profile.job_role && (
        <Text style={[styles.jobRole, { color: theme.tint }]}>{profile.job_role}</Text>
      )}

      {profile.bio && (
        <View style={[styles.bioCard, { backgroundColor: theme.card }]}>
          <Text style={[styles.bio, { color: theme.text }]}>{profile.bio}</Text>
        </View>
      )}

      <Pressable
        onPress={handleEdit}
        style={[styles.button, { backgroundColor: theme.tint }]}
      >
        <Text style={styles.buttonText}>Edit Profile</Text>
      </Pressable>

      <Pressable
        onPress={handleLogout}
        style={[styles.button, { backgroundColor: theme.delete }]}
      >
        <Text style={styles.buttonText}>Logout</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", padding: 24 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  avatarWrapper: {
    width: 140,
    height: 140,
    borderRadius: 70,
    overflow: "hidden",
    marginBottom: 16,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  avatarImage: { width: "100%", height: "100%" },

  name: { fontSize: 24, fontWeight: "bold", marginBottom: 4 },
  jobRole: { fontSize: 16, fontWeight: "500", opacity: 0.9, marginBottom: 8 },

  bioCard: {
    width: "85%",
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 3,
  },
  bio: { fontSize: 15, textAlign: "center", lineHeight: 22 },

  button: {
    width: "70%",
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 12,
  },
  buttonText: { color: "white", fontWeight: "bold", fontSize: 16 },
});