import AvatarUploader from "@/components/imagePicker/imagePicker";
import { Colors } from "@/constants/theme";
import { supabase } from "@/lib/supabase";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  ActivityIndicator,
  useColorScheme,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Department = 'bar' | 'kitchen' | 'restaurant' | 'housekeeping' | 'reception' | 'maintenance' | '';

export default function EditProfileScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    id: "",
    name: "",
    surname: "",
    job_role: "",
    bio: "",
    phone: "",
    department: "" as Department,
    avatar_url: null as string | null,
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userData.user.id)
        .single();

      if (!error && data) {
        setForm({
          id: data.id,
          name: data.name ?? "",
          surname: data.surname ?? "",
          job_role: data.job_role ?? "",
          bio: data.bio ?? "",
          phone: data.phone ?? "",
          department: (data.department as Department) ?? "",
          avatar_url: data.avatar_url ?? null,
        });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!form.name || !form.surname) {
      Alert.alert("Missing Info", "Name and Surname are required.");
      return;
    }

    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        name: form.name,
        surname: form.surname,
        job_role: form.job_role,
        bio: form.bio,
        phone: form.phone,
        department: form.department || null,
        avatar_url: form.avatar_url,
      })
      .eq("id", form.id);

    setSaving(false);

    if (error) {
      Alert.alert("Error", error.message);
    } else {
      router.back();
    }
  };

  const selectDepartment = () => {
    const deps: Department[] = ['bar', 'kitchen', 'restaurant', 'housekeeping', 'reception', 'maintenance'];
    Alert.alert("Department", "Select your area", [
      ...deps.map((dep) => ({
        text: dep.charAt(0).toUpperCase() + dep.slice(1),
        onPress: () => setForm({ ...form, department: dep }),
      })),
      { text: "Cancel", style: "cancel" as const },
    ]);
  };

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="small" color={theme.tint} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1, backgroundColor: theme.background }}
    >
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 10,
          paddingHorizontal: 20,
          paddingBottom: 60,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* HEADER */}
        <View style={styles.navBar}>
          <Pressable onPress={() => router.back()} style={styles.iconBtn}>
            <Ionicons name="close" size={26} color={theme.text} />
          </Pressable>
          <Text style={[styles.navTitle, { color: theme.text }]}>Edit Profile</Text>
          <View style={{ width: 44 }} />
        </View>

        {/* AVATAR SECTION */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarUnderlay} />
          <View style={[styles.avatarContainer, { borderColor: theme.background }]}>
            <AvatarUploader
              initialUrl={form.avatar_url}
              onUpload={(url) => setForm({ ...form, avatar_url: `${url}?t=${Date.now()}` })}
            />
          </View>
          <View style={[styles.cameraBadge, { backgroundColor: theme.text }]}>
            <Ionicons name="camera" size={16} color={theme.background} />
          </View>
        </View>

        {/* FORM SECTION */}
        <View style={styles.formSection}>
          <Text style={[styles.sectionLabel, { color: theme.text }]}>Personal Information</Text>
          <View style={[styles.inputGroup, { backgroundColor: theme.card }]}>
            <View style={styles.inputRow}>
              <Ionicons name="person-outline" size={20} color={form.name ? theme.tint : theme.text + "40"} />
              <TextInput
                value={form.name}
                onChangeText={(val) => setForm({ ...form, name: val })}
                placeholder="First Name"
                placeholderTextColor={theme.text + "30"}
                style={[styles.field, { color: theme.text }]}
              />
            </View>
            <View style={[styles.divider, { backgroundColor: theme.text + "05" }]} />
            <View style={styles.inputRow}>
              <Ionicons name="finger-print-outline" size={20} color={form.surname ? theme.tint : theme.text + "40"} />
              <TextInput
                value={form.surname}
                onChangeText={(val) => setForm({ ...form, surname: val })}
                placeholder="Last Name"
                placeholderTextColor={theme.text + "30"}
                style={[styles.field, { color: theme.text }]}
              />
            </View>
            <View style={[styles.divider, { backgroundColor: theme.text + "05" }]} />
            <View style={styles.inputRow}>
              <Ionicons name="call-outline" size={20} color={form.phone ? theme.tint : theme.text + "40"} />
              <TextInput
                value={form.phone}
                onChangeText={(val) => setForm({ ...form, phone: val })}
                placeholder="Phone Number (e.g. +46...)"
                keyboardType="phone-pad"
                placeholderTextColor={theme.text + "30"}
                style={[styles.field, { color: theme.text }]}
              />
            </View>
          </View>

          <Text style={[styles.sectionLabel, { color: theme.text, marginTop: 24 }]}>Professional Info</Text>
          
          {/* DEPARTMENT SELECTOR */}
          <Pressable onPress={selectDepartment} style={[styles.roleCard, { backgroundColor: theme.card, marginBottom: 12 }]}>
            <View style={styles.roleContent}>
              <View style={[styles.roleIcon, { backgroundColor: theme.tint + "15" }]}>
                <Ionicons name="business-outline" size={20} color={theme.tint} />
              </View>
              <View>
                <Text style={[styles.roleLabel, { color: theme.text + "60" }]}>Department</Text>
                <Text style={[styles.roleValue, { color: theme.text }]}>{form.department ? form.department.toUpperCase() : "Not Selected"}</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color={theme.text + "20"} />
          </Pressable>

          {/* JOB ROLE INPUT (Manual) */}
          <View style={[styles.inputGroup, { backgroundColor: theme.card }]}>
            <View style={styles.inputRow}>
              <Ionicons name="briefcase-outline" size={20} color={form.job_role ? theme.tint : theme.text + "40"} />
              <TextInput
                value={form.job_role}
                onChangeText={(val) => setForm({ ...form, job_role: val })}
                placeholder="Specific Job Title (e.g. Sous Chef)"
                placeholderTextColor={theme.text + "30"}
                maxLength={50}
                style={[styles.field, { color: theme.text }]}
              />
            </View>
          </View>

          <Text style={[styles.sectionLabel, { color: theme.text, marginTop: 24 }]}>Bio</Text>
          <View style={[styles.bioWrapper, { backgroundColor: theme.card }]}>
            <TextInput
              value={form.bio}
              onChangeText={(val) => setForm({ ...form, bio: val })}
              multiline
              maxLength={200}
              placeholder="Tell the team about yourself..."
              placeholderTextColor={theme.text + "30"}
              style={[styles.bioField, { color: theme.text }]}
            />
            <Text style={styles.charCount}>{form.bio.length}/200</Text>
          </View>

          <View style={styles.footer}>
            <Pressable
              onPress={handleSave}
              disabled={saving}
              style={({ pressed }) => [
                styles.saveBtn,
                {
                  backgroundColor: theme.text,
                  opacity: (saving || pressed) ? 0.8 : 1,
                  transform: [{ scale: pressed ? 0.98 : 1 }],
                },
              ]}
            >
              {saving ? (
                <ActivityIndicator size="small" color={theme.background} />
              ) : (
                <Text style={[styles.saveBtnText, { color: theme.background }]}>Save Changes</Text>
              )}
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  navBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  iconBtn: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  navTitle: { fontSize: 20, fontWeight: "800", letterSpacing: -0.5 },

  avatarSection: { alignItems: "center", marginBottom: 30, position: 'relative' },
  avatarUnderlay: { position: 'absolute', top: 20, width: 100, height: 100, borderRadius: 50, backgroundColor: '#000', opacity: 0.05, transform: [{ scale: 1.1 }] },
  avatarContainer: { width: 120, height: 120, borderRadius: 60, borderWidth: 4, overflow: 'hidden', zIndex: 1 },
  cameraBadge: { position: 'absolute', bottom: 5, right: '36%', width: 34, height: 34, borderRadius: 17, justifyContent: 'center', alignItems: 'center', zIndex: 2 },

  formSection: { width: '100%' },
  sectionLabel: { fontSize: 12, fontWeight: "700", letterSpacing: 1, textTransform: 'uppercase', marginBottom: 12, opacity: 0.4, marginLeft: 8 },
  
  inputGroup: { borderRadius: 24, paddingHorizontal: 16, backgroundColor: 'rgba(0,0,0,0.02)', borderWidth: 1, borderColor: 'rgba(0,0,0,0.03)' },
  inputRow: { flexDirection: 'row', alignItems: 'center', height: 56, gap: 12 },
  field: { flex: 1, fontSize: 16, fontWeight: "500" },
  divider: { height: 1, width: '100%', backgroundColor: 'rgba(0,0,0,0.05)' },

  roleCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderRadius: 24, shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 15, shadowOffset: { width: 0, height: 8 }, elevation: 3 },
  roleContent: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  roleIcon: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  roleLabel: { fontSize: 11, fontWeight: "600", marginBottom: 2 },
  roleValue: { fontSize: 16, fontWeight: "700" },

  bioWrapper: { borderRadius: 24, padding: 20, minHeight: 120, borderWidth: 1, borderColor: 'rgba(0,0,0,0.03)' },
  bioField: { fontSize: 15, fontWeight: "500", lineHeight: 22, textAlignVertical: "top" },
  charCount: { alignSelf: 'flex-end', fontSize: 10, opacity: 0.3, marginTop: 5 },

  footer: { marginTop: 40, width: '100%' },
  saveBtn: { height: 60, borderRadius: 22, justifyContent: 'center', alignItems: 'center', shadowColor: "#000", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 5 },
  saveBtnText: { fontSize: 17, fontWeight: "700", letterSpacing: 0.2 },
});