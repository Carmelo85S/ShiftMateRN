import AvatarUploader from "@/components/imagePicker/imagePicker";
import { Colors } from "@/constants/theme";
import { supabase } from "@/lib/supabase";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
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
  const theme = Colors.light;
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

  const handleSave = async () => {
    if (!profile) return;

    const { error } = await supabase
      .from("profiles")
      .update({
        name,
        surname,
        job_role: jobRole,
        bio,
        avatar_url: avatar, // <- salva l’avatar
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

  const handleDelete = async () => {
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
    <ScrollView 
      style={{ flex: 1, backgroundColor: theme.background }}
      contentContainerStyle={{ paddingTop: 20, paddingHorizontal: 25, paddingBottom: 60 }}
    >
      <View style={styles.headerArea}>
        <Text style={[styles.kpi, { color: theme.tint }]}>SETTINGS</Text>
        <Text style={[styles.title, { color: theme.text }]}>Edit Profile</Text>
      </View>

      {/* Avatar Uploader - Centrato ma pulito */}
      <View style={styles.uploaderWrapper}>
        <AvatarUploader
          initialUrl={avatar}
          onUpload={(url) => {
            const cacheBusted = `${url}?t=${Date.now()}`;
            setAvatar(cacheBusted);
          }}
        />
        <Text style={[styles.uploaderHint, { color: theme.secondaryText }]}>Tap to change photo</Text>
      </View>

      <View style={styles.form}>
        <CustomInput label="FIRST NAME" value={name} onChange={setName} theme={theme} />
        <CustomInput label="LAST NAME" value={surname} onChange={setSurname} theme={theme} />
        <CustomInput 
          label="JOB ROLE" 
          value={jobRole} 
          onChange={setJobRole} 
          placeholder="e.g. Receptionist" 
          theme={theme} 
        />
        
        <Text style={[styles.label, { color: theme.secondaryText }]}>BIO / EXPERIENCE</Text>
        <TextInput
          value={bio}
          onChangeText={setBio}
          placeholder="Tell us about your skills..."
          placeholderTextColor="#999"
          multiline
          style={[styles.textArea, { backgroundColor: theme.card, color: theme.text, borderColor: theme.border }]}
        />
      </View>

      {/* Action Buttons - Uno primario, uno ghost per il delete */}
      <View style={styles.footer}>
        <Pressable
          onPress={handleSave}
          style={({ pressed }) => [
            styles.saveButton,
            { backgroundColor: theme.text, opacity: pressed ? 0.8 : 1 }
          ]}
        >
          <Text style={[styles.saveButtonText, { color: theme.background }]}>SAVE CHANGES</Text>
        </Pressable>

        <Pressable onPress={handleDelete} style={styles.deleteButton}>
          <Text style={[styles.deleteButtonText, { color: theme.delete }]}>Delete Account</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

// Sottocomponente per Input coerente
const CustomInput = ({ label, value, onChange, placeholder, theme }: any) => (
  <View style={styles.inputWrapper}>
    <Text style={[styles.label, { color: theme.secondaryText }]}>{label}</Text>
    <TextInput
      value={value}
      onChangeText={onChange}
      placeholder={placeholder}
      placeholderTextColor="#BBB"
      style={[styles.input, { backgroundColor: theme.card, color: theme.text, borderColor: theme.border }]}
    />
  </View>
);

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  headerArea: { marginBottom: 30, marginVertical: 110 },
  kpi: { fontSize: 11, fontWeight: "900", letterSpacing: 2, marginBottom: 4 },
  title: { fontSize: 42, fontWeight: "900", letterSpacing: -2 },

  uploaderWrapper: { alignItems: 'center', marginBottom: 30 },
  uploaderHint: { fontSize: 12, fontWeight: "600", marginTop: 10, opacity: 0.6 },

  form: { gap: 20 },
  inputWrapper: { gap: 8 },
  label: { fontSize: 10, fontWeight: "800", letterSpacing: 1.5 },
  input: {
    height: 56,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 16,
    fontSize: 16,
    fontWeight: "600",
  },
  textArea: {
    height: 120,
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    fontWeight: "600",
    textAlignVertical: 'top',
  },

  footer: { marginTop: 40, gap: 15 },
  saveButton: {
    height: 64,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButtonText: { fontSize: 16, fontWeight: "900", letterSpacing: 1 },
  deleteButton: { paddingVertical: 10, alignItems: 'center' },
  deleteButtonText: { fontSize: 14, fontWeight: "700", opacity: 0.8 },
});