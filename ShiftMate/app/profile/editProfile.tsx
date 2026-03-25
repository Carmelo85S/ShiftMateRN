import AvatarPicker from "@/components/imagePicker";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { supabase } from "@/lib/supabase";
import * as FileSystem from "expo-file-system";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

type Profile = {
  id: string;
  name: string | null;
  surname: string | null;
  job_role: string | null;
  bio: string | null;
  avatar_url?: string | null;
};

export default function EditProfileScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];
  const router = useRouter();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [jobRole, setJobRole] = useState("");
  const [bio, setBio] = useState("");
  const [avatar, setAvatar] = useState<string | null>(null);

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
      setName(data.name ?? "");
      setSurname(data.surname ?? "");
      setJobRole(data.job_role ?? "");
      setBio(data.bio ?? "");
      setAvatar(data.avatar_url ?? null);
    }

    setLoading(false);
  };

  // Funzione per upload avatar su Supabase Storage
  const uploadAvatar = async (uri: string) => {
    try {
      if (!profile) return null;

      const fileExt = uri.split(".").pop();
      const fileName = `${profile.id}.${fileExt}`;
      const fileUri = uri;

      const file = await FileSystem.readAsStringAsync(fileUri, {
        encoding: "base64",
      });

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, Buffer.from(file, "base64"), { upsert: true });

      if (uploadError) {
        console.error(uploadError);
        return null;
      }

      // qui prendo solo il publicUrl
      const { data: publicData } = supabase.storage
        .from("avatars")
        .getPublicUrl(fileName);
      return publicData.publicUrl;
    } catch (err) {
      console.error(err);
      return null;
    }
  };

  const handleSave = async () => {
    if (!profile) return;

    let avatar_url = profile.avatar_url ?? null;

    if (avatar && avatar !== profile.avatar_url) {
      const uploadedUrl = await uploadAvatar(avatar);
      if (uploadedUrl) avatar_url = uploadedUrl;
    }

    const { error } = await supabase
      .from("profiles")
      .update({
        name,
        surname,
        job_role: jobRole,
        bio,
        avatar_url,
      })
      .eq("id", profile.id);

    if (error) {
      console.error(error);
      Alert.alert("Error", "Failed to save profile");
    } else {
      Alert.alert("Success", "Profile updated");
      router.back();
    }
  };

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <Text style={{ color: theme.text }}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.text }]}>Edit Profile</Text>

      <AvatarPicker value={avatar} onChange={setAvatar} />

      {avatar ? (
        <Image
          source={{ uri: avatar }}
          style={{ width: 150, height: 150, borderRadius: 75, marginTop: 12 }}
        />
      ) : null}
      <Text>LOG Public URL: {avatar}</Text>

      <Text style={[styles.label, { color: theme.text }]}>Name</Text>
      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="Name"
        placeholderTextColor="#999"
        style={[styles.input, { borderColor: theme.tint, color: theme.text }]}
      />

      {/* Surname */}
      <Text style={[styles.label, { color: theme.text }]}>Surname</Text>
      <TextInput
        value={surname}
        onChangeText={setSurname}
        placeholder="Surname"
        placeholderTextColor="#999"
        style={[styles.input, { borderColor: theme.tint, color: theme.text }]}
      />

      {/* Job Role */}
      <Text style={[styles.label, { color: theme.text }]}>Job Role</Text>
      <TextInput
        value={jobRole}
        onChangeText={setJobRole}
        placeholder="Receptionist, Housekeeping..."
        placeholderTextColor="#999"
        style={[styles.input, { borderColor: theme.tint, color: theme.text }]}
      />

      {/* Bio */}
      <Text style={[styles.label, { color: theme.text }]}>Bio</Text>
      <TextInput
        value={bio}
        onChangeText={setBio}
        placeholder="Short bio about yourself"
        placeholderTextColor="#999"
        style={[
          styles.textArea,
          { borderColor: theme.tint, color: theme.text },
        ]}
        multiline
        numberOfLines={4}
      />

      {/* Buttons */}
      <View style={styles.buttonContainer}>
        <Pressable
          onPress={handleSave}
          style={[styles.button, { backgroundColor: theme.tint }]}
        >
          <Text style={styles.buttonText}>Save</Text>
        </Pressable>

        <Pressable
          onPress={async () => {
            if (!profile) return;
            Alert.alert("Delete profile", "Are you sure?", [
              { text: "Cancel", style: "cancel" },
              {
                text: "Delete",
                style: "destructive",
                onPress: async () => {
                  const { error } = await supabase
                    .from("profiles")
                    .delete()
                    .eq("id", profile.id);
                  if (error) Alert.alert("Error", "Failed to delete profile");
                  else {
                    await supabase.auth.signOut();
                    router.replace("/auth/login");
                  }
                },
              },
            ]);
          }}
          style={[styles.button, { backgroundColor: "#e53935" }]}
        >
          <Text style={styles.buttonText}>Delete Profile</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 26, fontWeight: "bold", marginBottom: 24 },
  label: { marginTop: 12, marginBottom: 4, fontSize: 14, fontWeight: "500" },
  input: {
    borderWidth: 1,
    padding: 14,
    borderRadius: 12,
    fontSize: 16,
    marginBottom: 8,
  },
  textArea: {
    borderWidth: 1,
    padding: 14,
    borderRadius: 12,
    fontSize: 16,
    marginBottom: 8,
    height: 100,
    textAlignVertical: "top",
  },
  buttonContainer: { marginTop: 24, gap: 12 },
  button: { padding: 16, borderRadius: 12, alignItems: "center" },
  buttonText: { color: "white", fontWeight: "bold", fontSize: 16 },
});
