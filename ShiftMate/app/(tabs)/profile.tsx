import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { supabase } from "@/lib/supabase";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View, Image } from "react-native";

type Profile = {
  id: string;
  name: string | null;
  surname: string | null;
  job_role: string | null;
  bio: string | null;
  avatar_url: string | null;
};

export default function ProfileScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];
  const router = useRouter();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;

    const { data, error } = await supabase
      .from("profiles")
      .select("id, name, surname, job_role, bio, avatar_url")
      .eq("id", userData.user.id)
      .single();

    if (error) {
      console.error(error);
      Alert.alert("Error", "Failed to load profile");
    } else if (data) {
      setProfile(data);
    }

    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace("/");
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
      
      {/* Avatar */}
      <View style={styles.avatar}>
        {profile.avatar_url ? (
          <Image
            source={{ uri: profile.avatar_url }}
            style={styles.avatarImage}
            resizeMode="cover"
          />
        ) : (
          <Text style={{ color: theme.text, fontSize: 24 }}>👤</Text>
        )}
      </View>

      <Text style={[styles.name, { color: theme.text }]}>{displayName}</Text>

      {profile.job_role && (
        <Text style={[styles.jobRole, { color: theme.text }]}>
          {profile.job_role}
        </Text>
      )}

      {profile.bio && (
        <Text style={[styles.bio, { color: theme.text }]}>{profile.bio}</Text>
      )}

      <Pressable
        onPress={() => router.push("/profile/editProfile")}
        style={[styles.button, { backgroundColor: theme.tint }]}
      >
        <Text style={styles.buttonText}>Edit Profile</Text>
      </Pressable>

      <Pressable
        onPress={handleLogout}
        style={[styles.button, { backgroundColor: "#e53935" }]}
      >
        <Text style={styles.buttonText}>Logout</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    padding: 24,
  },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  avatar: {
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 2,
    borderColor: "#aaa",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarImage: {
    width: "100%",
    height: "100%",
    borderRadius: 65,
  },
  name: { fontSize: 22, fontWeight: "bold", marginBottom: 4 },
  jobRole: { fontSize: 16, opacity: 0.8, marginBottom: 4 },
  bio: { fontSize: 14, textAlign: "center", lineHeight: 20, marginBottom: 16 },
  button: {
    width: "60%",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 12,
  },
  buttonText: { color: "white", fontWeight: "bold", fontSize: 16 },
});