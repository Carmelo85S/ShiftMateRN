import AvatarUploader from "@/components/imagePicker/imagePicker";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { supabase } from "@/lib/supabase";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Picker } from "@react-native-picker/picker";

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
    fetchProfile();
  }, []);

  const handleSave = async () => {
    if (!profile) return;

    const { error } = await supabase
      .from("profiles")
      .update({ name, surname, job_role: jobRole, bio, avatar_url: avatar })
      .eq("id", profile.id);

    if (error) {
      console.error(error);
      Alert.alert("Error", "Failed to save profile");
    } else {
      Alert.alert("Success", "Profile updated");
      router.back();
    }
  };

  const handleDelete = async () => {
    if (!profile) return;

    Alert.alert("Delete profile", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          const { error } = await supabase.from("profiles").delete().eq("id", profile.id);
          if (error) {
            console.error(error);
            Alert.alert("Error", "Failed to delete profile");
          } else {
            await supabase.auth.signOut();
            router.replace("/auth/login");
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <Text style={{ color: theme.text }}>Loading...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1 }}
    >
      <ScrollView
        contentContainerStyle={[styles.container, { backgroundColor: theme.background }]}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={[styles.title, { color: theme.text }]}>Edit Profile</Text>

        {/* Avatar Uploader */}
        <AvatarUploader
          initialUrl={avatar}
          onUpload={(url) => setAvatar(`${url}?t=${Date.now()}`)}
        />

        {/* Name */}
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
          <View
            style={[
              styles.pickerWrapper,
              { borderColor: theme.tint, backgroundColor: theme.card, height: 140 },
            ]}
          >
          <Picker
            selectedValue={jobRole}
            onValueChange={setJobRole}
            style={{ height: 140, fontSize: 14 }}
          >
            <Picker.Item label="Receptionist" value="Receptionist" />
            <Picker.Item label="Housekeeping" value="Housekeeping" />
            <Picker.Item label="Front Desk Manager" value="Front Desk Manager" />
            <Picker.Item label="Concierge" value="Concierge" />
            <Picker.Item label="Hotel Manager" value="Hotel Manager" />
            <Picker.Item label="Restaurant Manager" value="Restaurant Manager" />
            <Picker.Item label="Event Coordinator" value="Event Coordinator" />
            <Picker.Item label="Maintenance" value="Maintenance" />
            <Picker.Item label="Other" value="Other" />
          </Picker>
        </View>

        {/* Bio */}
        <Text style={[styles.label, { color: theme.text }]}>Bio</Text>
        <TextInput
          value={bio}
          onChangeText={setBio}
          placeholder="Short bio about yourself"
          placeholderTextColor="#999"
          style={[styles.textArea, { borderColor: theme.tint, color: theme.text }]}
          multiline
          numberOfLines={4}
        />

        {/* Buttons */}
        <View style={styles.buttonContainer}>
          <Pressable onPress={handleSave} style={[styles.button, { backgroundColor: theme.tint }]}>
            <Text style={styles.buttonText}>Save</Text>
          </Pressable>

          <Pressable onPress={handleDelete} style={[styles.button, { backgroundColor: "#e53935" }]}>
            <Text style={styles.buttonText}>Delete Profile</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 16, marginTop: 55 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 16, textAlign: "center" },
  label: { marginTop: 8, marginBottom: 4, fontSize: 13, fontWeight: "500" },
  input: { borderWidth: 1, padding: 10, borderRadius: 12, fontSize: 14, marginBottom: 8 },
  textArea: { borderWidth: 1, padding: 10, borderRadius: 12, fontSize: 14, marginBottom: 8, height: 80, textAlignVertical: "top" },
  pickerWrapper: { borderWidth: 1, borderRadius: 12, marginBottom: 8, overflow: "hidden" },
  buttonContainer: { marginTop: 16, gap: 12 },
  button: { padding: 12, borderRadius: 12, alignItems: "center" },
  buttonText: { color: "white", fontWeight: "bold", fontSize: 14 },
});