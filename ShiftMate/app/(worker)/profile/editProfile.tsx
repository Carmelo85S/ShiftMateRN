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
  ActivityIndicator,
} from "react-native";

// Definizione rigorosa del tipo basata sul tuo database SQL
type Profile = {
  id: string;
  name: string | null;
  surname: string | null;
  role: 'worker' | 'manager' | 'admin' | 'owner';
  job_role: string | null;
  bio: string | null;
  avatar_url: string | null;
  phone: string | null;
  experience: string | null;
  department: 'bar' | 'kitchen' | 'restaurant' | 'housekeeping' | 'reception' | 'maintenance' | null;
};

// Props per il componente di input custom
interface CustomInputProps {
  label: string;
  value: string | null | undefined;
  onChange: (text: string) => void;
  placeholder?: string;
  theme: any;
  keyboardType?: "default" | "phone-pad" | "email-address";
}

export default function EditProfileScreen() {
  const theme = Colors.light;
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<Partial<Profile>>({});

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;

    const { data, error } = await supabase
      .from("profiles")
      .select("id, name, surname, role, job_role, bio, avatar_url, phone, experience, department")
      .eq("id", userData.user.id)
      .single();

    if (error) {
      Alert.alert("Error", "Failed to load profile");
    } else if (data) {
      setForm(data);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    const phoneTrimmed = form.phone?.trim();
    
    if (!phoneTrimmed) {
      Alert.alert("Missing Info", "Phone number is required for emergency alerts.");
      return;
    }

    const phoneRegex = /^\+?[0-9\s-]{8,20}$/;
    if (!phoneRegex.test(phoneTrimmed)) {
      Alert.alert("Invalid Phone", "Please enter a valid phone number (e.g. +46 123 456 789)");
      return;
    }

    if (!phoneTrimmed.startsWith('+')) {
        Alert.alert(
            "International Format", 
            "We recommend starting with '+' and country code (e.g. +46) for better connectivity."
        );
    }

    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        name: form.name,
        surname: form.surname,
        job_role: form.job_role,
        bio: form.bio,
        phone: phoneTrimmed,
        experience: form.experience,
        department: form.department,
        avatar_url: form.avatar_url,
      })
      .eq("id", form.id);

    setSaving(false);

    if (error) {
      Alert.alert("Error", error.message);
    } else {
      Alert.alert("Success", "Profile updated");
      router.back();
    }
  };

  const selectDepartment = () => {
    const deps = ['bar', 'kitchen', 'restaurant', 'housekeeping', 'reception', 'maintenance'];
    Alert.alert("Select Department", "Where do you work?", [
      ...deps.map(d => ({ 
        text: d.toUpperCase(), 
        onPress: () => setForm({...form, department: d as any}) 
      })),
      { text: "Cancel", style: "cancel" }
    ]);
  };

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.tint} />
      </View>
    );
  }

  return (
    <ScrollView 
      style={{ flex: 1, backgroundColor: theme.background }}
      contentContainerStyle={{ paddingTop: 60, paddingHorizontal: 25, paddingBottom: 60 }}
    >
      <View style={styles.headerArea}>
        <Text style={[styles.kpi, { color: theme.tint }]}>SETTINGS</Text>
        <Text style={[styles.title, { color: theme.text }]}>Edit Profile</Text>
      </View>

      <View style={styles.uploaderWrapper}>
        <AvatarUploader
          initialUrl={form.avatar_url}
          onUpload={(url) => setForm({...form, avatar_url: `${url}?t=${Date.now()}`})}
        />
        <Text style={[styles.uploaderHint, { color: theme.secondaryText }]}>Tap to change photo</Text>
      </View>

      <View style={styles.form}>
        <CustomInput 
          label="FIRST NAME" 
          value={form.name} 
          onChange={(v: string) => setForm({...form, name: v})} 
          theme={theme} 
        />
        
        <CustomInput 
          label="LAST NAME" 
          value={form.surname} 
          onChange={(v: string) => setForm({...form, surname: v})} 
          theme={theme} 
        />
        
        <CustomInput 
          label="PHONE" 
          value={form.phone} 
          onChange={(v: string) => setForm({...form, phone: v})} 
          placeholder="+46..." 
          keyboardType="phone-pad"
          theme={theme} 
        />
        
        <View style={styles.inputWrapper}>
          <Text style={[styles.label, { color: theme.secondaryText }]}>DEPARTMENT</Text>
          <Pressable 
            onPress={selectDepartment}
            style={[styles.input, { backgroundColor: theme.card, borderColor: theme.border, justifyContent: 'center' }]}
          >
            <Text style={{ color: form.department ? theme.text : "#BBB" }}>
              {form.department ? form.department.toUpperCase() : "Select Department"}
            </Text>
          </Pressable>
        </View>

        <CustomInput 
          label="JOB ROLE" 
          value={form.job_role} 
          onChange={(v: string) => setForm({...form, job_role: v})} 
          placeholder="e.g. Sous Chef" 
          theme={theme} 
        />

        <CustomInput 
          label="EXPERIENCE" 
          value={form.experience} 
          onChange={(v: string) => setForm({...form, experience: v})} 
          placeholder="e.g. 5 years in fine dining" 
          theme={theme} 
        />
        
        <Text style={[styles.label, { color: theme.secondaryText }]}>BIO (MAX 200 CHARS)</Text>
        <TextInput
          value={form.bio ?? ""}
          onChangeText={(v: string) => setForm({...form, bio: v})}
          placeholder="Tell the team about yourself..."
          placeholderTextColor="#999"
          multiline
          maxLength={200}
          style={[styles.textArea, { backgroundColor: theme.card, color: theme.text, borderColor: theme.border }]}
        />
      </View>

      <View style={styles.footer}>
        <Pressable
          onPress={handleSave}
          disabled={saving}
          style={({ pressed }) => [
            styles.saveButton,
            { backgroundColor: theme.text, opacity: (pressed || saving) ? 0.8 : 1 }
          ]}
        >
          {saving ? (
            <ActivityIndicator color={theme.background} />
          ) : (
            <Text style={[styles.saveButtonText, { color: theme.background }]}>SAVE CHANGES</Text>
          )}
        </Pressable>
      </View>
    </ScrollView>
  );
}

const CustomInput = ({ label, value, onChange, placeholder, theme, keyboardType }: CustomInputProps) => (
  <View style={styles.inputWrapper}>
    <Text style={[styles.label, { color: theme.secondaryText }]}>{label}</Text>
    <TextInput
      value={value ?? ""}
      onChangeText={onChange}
      placeholder={placeholder}
      placeholderTextColor="#BBB"
      keyboardType={keyboardType || "default"}
      style={[styles.input, { backgroundColor: theme.card, color: theme.text, borderColor: theme.border }]}
    />
  </View>
);

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  headerArea: { marginBottom: 30 },
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
    height: 100,
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    fontWeight: "600",
    textAlignVertical: 'top',
  },
  footer: { marginTop: 40 },
  saveButton: {
    height: 64,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButtonText: { fontSize: 16, fontWeight: "900", letterSpacing: 1 },
});