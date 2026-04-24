import React, { useEffect, useState } from "react";
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
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { supabase } from "@/lib/supabase";
import { Colors } from "@/constants/theme";
import AvatarUploader from "@/components/imagePicker/imagePicker";
import { fetchUserProfile, updateUserProfile } from "@/queries/managerQueries";

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
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const data = await fetchUserProfile(user.id);
      if (data) {
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
      console.error("Error loading profile:", error);
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
    try {
      // CLEANUP: Remove timestamp from URL before saving to DB
      const cleanAvatarUrl = form.avatar_url?.split('?')[0] || null;

      await updateUserProfile(form.id, {
        ...form,
        avatar_url: cleanAvatarUrl,
      });
      router.back();
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProfile = async () => {
  Alert.alert(
    "Delete Account",
    "Are you sure? This action is permanent and will delete your profile, applications, and all associated data.",
    [
      { text: "Cancel", style: "cancel" },
      { 
        text: "Delete Everything", 
        style: "destructive", 
        onPress: async () => {
          setSaving(true);
          try {
            const { data, error } = await supabase.functions.invoke('delete-user');
            
            if (error) throw error;
            await supabase.auth.signOut();
            
            Alert.alert("Account Deleted", "Your data has been successfully removed.");
            router.replace("/");
          } catch (error: any) {
            Alert.alert("Error", error.message || "Could not delete account");
          } finally {
            setSaving(false);
          }
        }
      }
    ]
  );
};

  const selectDepartment = () => {
    const deps: Department[] = ['bar', 'kitchen', 'restaurant', 'housekeeping', 'reception', 'maintenance'];
    Alert.alert("Department", "Select your area", [
      ...deps.map((dep) => ({
        text: dep.charAt(0).toUpperCase() + dep.slice(1),
        onPress: () => setForm({ ...form, department: dep }),
      })),
      { text: "Cancel", style: "cancel" },
    ]);
  };

  if (loading) return (
    <View style={[styles.center, { backgroundColor: theme.background }]}>
      <ActivityIndicator size="small" color={theme.tint} />
    </View>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1, backgroundColor: theme.background }}
    >
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 10,
          paddingHorizontal: 28,
          paddingBottom: 60,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.navBar}>
          <Pressable onPress={() => router.back()} style={styles.iconBtn}>
            <Ionicons name="close" size={26} color={theme.text} />
          </Pressable>
          <Text style={[styles.navTitle, { color: theme.text }]}>Edit Profile</Text>
          <View style={{ width: 44 }} />
        </View>

        <View style={styles.avatarSection}>
          <View style={[styles.avatarContainer, { borderColor: theme.border }]}>
            <AvatarUploader
              initialUrl={form.avatar_url}
              onUpload={(url) => setForm({ ...form, avatar_url: `${url}?t=${Date.now()}` })}
            />
          </View>
        </View>

        <View style={styles.formSection}>
          <Text style={[styles.sectionLabel, { color: theme.text }]}>Personal Information</Text>
          <View style={[styles.inputGroup, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={styles.inputRow}>
              <Ionicons name="person-outline" size={20} color={theme.tint} />
              <TextInput
                value={form.name}
                onChangeText={(val) => setForm({ ...form, name: val })}
                placeholder="First Name"
                placeholderTextColor={theme.secondaryText}
                style={[styles.field, { color: theme.text }]}
              />
            </View>
            <View style={[styles.divider, { backgroundColor: theme.border }]} />
            <View style={styles.inputRow}>
              <Ionicons name="finger-print-outline" size={20} color={theme.tint} />
              <TextInput
                value={form.surname}
                onChangeText={(val) => setForm({ ...form, surname: val })}
                placeholder="Last Name"
                placeholderTextColor={theme.secondaryText}
                style={[styles.field, { color: theme.text }]}
              />
            </View>
          </View>

          <Text style={[styles.sectionLabel, { color: theme.text, marginTop: 24 }]}>Professional Info</Text>
          
          <Pressable onPress={selectDepartment} style={[styles.roleCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={styles.roleContent}>
              <View style={[styles.roleIcon, { backgroundColor: theme.tint + "15" }]}>
                <Ionicons name="business-outline" size={20} color={theme.tint} />
              </View>
              <View>
                <Text style={[styles.roleLabel, { color: theme.secondaryText }]}>Department</Text>
                <Text style={[styles.roleValue, { color: theme.text }]}>
                  {form.department ? form.department.toUpperCase() : "Select..."}
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color={theme.secondaryText} />
          </Pressable>

          <View style={[styles.inputGroup, { backgroundColor: theme.card, borderColor: theme.border, marginTop: 12 }]}>
            <View style={styles.inputRow}>
              <Ionicons name="briefcase-outline" size={20} color={theme.tint} />
              <TextInput
                value={form.job_role}
                onChangeText={(val) => setForm({ ...form, job_role: val })}
                placeholder="Job Title (e.g. Manager)"
                placeholderTextColor={theme.secondaryText}
                style={[styles.field, { color: theme.text }]}
              />
            </View>
          </View>

          <Text style={[styles.sectionLabel, { color: theme.text, marginTop: 24 }]}>Bio</Text>
          <View style={[styles.bioWrapper, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <TextInput
              value={form.bio}
              onChangeText={(val) => setForm({ ...form, bio: val })}
              multiline
              maxLength={200}
              placeholder="Bio..."
              placeholderTextColor={theme.secondaryText}
              style={[styles.bioField, { color: theme.text }]}
            />
          </View>

          <Pressable
            onPress={handleSave}
            disabled={saving}
            style={({ pressed }) => [
              styles.saveBtn,
              { backgroundColor: theme.text, opacity: (saving || pressed) ? 0.8 : 1 }
            ]}
          >
            {saving ? <ActivityIndicator color={theme.background} /> : <Text style={[styles.saveBtnText, { color: theme.background }]}>Save Changes</Text>}
          </Pressable>

          <Pressable
            onPress={handleDeleteProfile}
            disabled={saving}
            style={({ pressed }) => [
              styles.deleteBtn,
              { 
                borderColor: theme.delete + "30", // Bordo rosso leggero (trasparenza 30)
                opacity: (saving || pressed) ? 0.7 : 1 
              }
            ]}
          >
            {saving ? (
              <ActivityIndicator size="small" color={theme.delete} />
            ) : (
              <>
                <Ionicons name="trash-outline" size={20} color={theme.delete} />
                <Text style={[styles.deleteBtnText, { color: theme.delete }]}>
                  Delete Account
                </Text>
              </>
            )}
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  navBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 30 },
  iconBtn: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  navTitle: { fontSize: 22, fontWeight: "900", letterSpacing: -0.5 },
  avatarSection: { alignItems: "center", marginBottom: 40 },
  avatarContainer: { width: 130, height: 130, borderRadius: 50, borderWidth: 1, overflow: 'hidden' },
  formSection: { width: '100%' },
  sectionLabel: { fontSize: 12, fontWeight: "800", letterSpacing: 1, textTransform: 'uppercase', marginBottom: 12, opacity: 0.5 },
  inputGroup: { borderRadius: 24, paddingHorizontal: 20, borderWidth: 1 },
  inputRow: { flexDirection: 'row', alignItems: 'center', height: 60, gap: 14 },
  field: { flex: 1, fontSize: 16, fontWeight: "600" },
  divider: { height: 1, width: '100%' },
  roleCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderRadius: 24, borderWidth: 1 },
  roleContent: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  roleIcon: { width: 48, height: 48, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  roleLabel: { fontSize: 11, fontWeight: "700", marginBottom: 2 },
  roleValue: { fontSize: 16, fontWeight: "700" },
  bioWrapper: { borderRadius: 24, padding: 20, minHeight: 120, borderWidth: 1 },
  bioField: { fontSize: 16, fontWeight: "500", lineHeight: 24, textAlignVertical: "top" },
  saveBtn: { height: 64, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginTop: 40 },
  saveBtnText: { fontSize: 18, fontWeight: "800" },
  deleteBtn: {flexDirection: 'row',height: 64,borderRadius: 24,justifyContent: 'center',alignItems: 'center',marginTop: 20,borderWidth: 1.5,backgroundColor: 'transparent', gap: 10},
  deleteBtnText: {fontSize: 16,fontWeight: "700",letterSpacing: -0.2},
});