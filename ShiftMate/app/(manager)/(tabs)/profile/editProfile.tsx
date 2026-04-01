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
    avatar_url: null as string | null,
  });

  useEffect(() => { fetchProfile(); }, []);

  const fetchProfile = async () => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;
    const { data, error } = await supabase.from("profiles").select("*").eq("id", userData.user.id).single();
    if (!error && data) setForm({
      id: data.id,
      name: data.name ?? "",
      surname: data.surname ?? "",
      job_role: data.job_role ?? "",
      bio: data.bio ?? "",
      avatar_url: data.avatar_url ?? null,
    });
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase.from("profiles").update({
      name: form.name,
      surname: form.surname,
      job_role: form.job_role,
      bio: form.bio,
      avatar_url: form.avatar_url,
    }).eq("id", form.id);
    setSaving(false);
    if (error) Alert.alert("Error", "Save failed");
    else router.back();
  };

  if (loading) return (
    <View style={[styles.center, { backgroundColor: theme.background }]}>
      <ActivityIndicator size="small" color={theme.tint} />
    </View>
  );

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1, backgroundColor: theme.background }}>
      <ScrollView 
        contentContainerStyle={{ paddingTop: insets.top + 10, paddingHorizontal: 20, paddingBottom: 60 }}
        showsVerticalScrollIndicator={false}
      >

        {/* AVATAR STRATIFICATO */}
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

        {/* INFO CARDS */}
        <View style={styles.formSection}>
          <Text style={[styles.sectionLabel, { color: theme.text }]}>Basic Information</Text>
          
          <View style={[styles.inputGroup, { backgroundColor: theme.card }]}>
            <View style={styles.inputRow}>
              <Ionicons name="person-outline" size={20} color={form.name ? theme.tint : theme.text + "40"} />
              <TextInput
                value={form.name}
                onChangeText={(val) => setForm({...form, name: val})}
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
                onChangeText={(val) => setForm({...form, surname: val})}
                placeholder="Last Name"
                placeholderTextColor={theme.text + "30"}
                style={[styles.field, { color: theme.text }]}
              />
            </View>
          </View>

          <Text style={[styles.sectionLabel, { color: theme.text, marginTop: 24 }]}>Work Detail</Text>
          <Pressable 
            onPress={() => {
              Alert.alert("Job Role", "Select your position", [
                { text: "Hotel Manager", onPress: () => setForm({...form, job_role: "Hotel Manager"}) },
                { text: "Restaurant Manager", onPress: () => setForm({...form, job_role: "Restaurant Manager"}) },
                { text: "Breakfast Manager", onPress: () => setForm({...form, job_role: "Breakfast Manager"}) },
                { text: "Kitchen Manager", onPress: () => setForm({...form, job_role: "Kitchen Manager"}) },
                { text: "Event Coordinator", onPress: () => setForm({...form, job_role: "Event Coordinator"}) },
                { text: "Bar Manager", onPress: () => setForm({...form, job_role: "Bar Manager"}) },
                { text: "Housekeeping Manager", onPress: () => setForm({...form, job_role: "Housekeeping Manager"}) },
                { text: "Front Desk Manager", onPress: () => setForm({...form, job_role: "Front Desk Manager"}) },
                { text: "Cancel", style: "cancel" }
              ]);
            }}
            style={[styles.roleCard, { backgroundColor: theme.card }]}
          >
            <View style={styles.roleContent}>
              <View style={[styles.roleIcon, { backgroundColor: theme.tint + "15" }]}>
                <Ionicons name="briefcase" size={20} color={theme.tint} />
              </View>
              <View>
                <Text style={[styles.roleLabel, { color: theme.text + "60" }]}>Current Role</Text>
                <Text style={[styles.roleValue, { color: theme.text }]}>{form.job_role || "Not specified"}</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color={theme.text + "20"} />
          </Pressable>

          <Text style={[styles.sectionLabel, { color: theme.text, marginTop: 24 }]}>About Me</Text>
          <View style={[styles.bioWrapper, { backgroundColor: theme.card }]}>
            <TextInput
              value={form.bio}
              onChangeText={(val) => setForm({...form, bio: val})}
              multiline
              placeholder="Write a short bio for your team..."
              placeholderTextColor={theme.text + "30"}
              style={[styles.bioField, { color: theme.text }]}
            />
          </View>
          {/* TOP NAVIGATION */}
            <View style={styles.footer}>
  <Pressable 
    onPress={handleSave} 
    disabled={saving} 
    style={({ pressed }) => [
      styles.saveBtn, 
      { 
        backgroundColor: theme.text, // Contrasto massimo (Nero in light, Bianco in dark)
        opacity: pressed ? 0.8 : 1,
        transform: [{ scale: pressed ? 0.98 : 1 }] 
      }
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
  navBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 30 },
  iconBtn: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  navTitle: { fontSize: 18, fontWeight: "800", letterSpacing: -0.5 },
  saveBadge: { paddingHorizontal: 20, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  saveBadgeText: { color: "#FFF", fontWeight: "800", fontSize: 15 },

  avatarSection: { alignItems: "center", marginBottom: 40, position: 'relative' },
  avatarUnderlay: { position: 'absolute', top: 20, width: 100, height: 100, borderRadius: 50, backgroundColor: '#000', opacity: 0.05, transform: [{ scale: 1.1 }] },
  avatarContainer: { width: 120, height: 120, borderRadius: 60, borderWidth: 4, overflow: 'hidden', zIndex: 1 },
  cameraBadge: { position: 'absolute', bottom: 5, right: '35%', width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center', zIndex: 2, borderBottomWidth: 0 },
formSection: { 
    width: '100%', 
    marginBottom: 20 
  },
  sectionLabel: { 
    fontSize: 12, 
    fontWeight: "600", 
    letterSpacing: 0.5, 
    textTransform: 'uppercase', 
    marginBottom: 12, 
    opacity: 0.4, // Molto discreto
    marginLeft: 8 
  },
  
  // INPUT GROUP: Superficie scavata invece di ombre esterne
  inputGroup: { 
    borderRadius: 24, 
    paddingVertical: 4, 
    paddingHorizontal: 16, 
    backgroundColor: 'rgba(0,0,0,0.02)', // Soft background
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)',
  },
  inputRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    height: 56, 
    gap: 12 
  },
  field: { 
    flex: 1, 
    fontSize: 16, 
    fontWeight: "500", // Più pulito del 600
    letterSpacing: -0.2 
  },
  divider: { 
    height: 1, 
    width: '90%', 
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.05)' 
  },

  // ROLE CARD: Floating card con ombra diffusa
  roleCard: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    padding: 16, 
    borderRadius: 24, 
    backgroundColor: '#FFF', // Stacca dal background grigio
    shadowColor: "#000", 
    shadowOpacity: 0.04, 
    shadowRadius: 15, 
    shadowOffset: { width: 0, height: 8 },
    elevation: 3 
  },
  roleContent: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 16 
  },
  roleIcon: { 
    width: 44, 
    height: 44, 
    borderRadius: 14, 
    justifyContent: 'center', 
    alignItems: 'center',
    // backgroundColor impostato dinamicamente nel componente (tint + "15")
  },
  roleLabel: { 
    fontSize: 11, 
    fontWeight: "600", 
    opacity: 0.5, 
    marginBottom: 2 
  },
  roleValue: { 
    fontSize: 16, 
    fontWeight: "700" // Da 800 a 700
  },

  // BIO: Textarea morbida
  bioWrapper: { 
    borderRadius: 24, 
    padding: 20, 
    minHeight: 140, 
    backgroundColor: 'rgba(0,0,0,0.02)',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)'
  },
  bioField: { 
    fontSize: 15, 
    fontWeight: "500", 
    lineHeight: 22, 
    textAlignVertical: "top" 
  },

  footer: {
    marginTop: 40,
    width: '100%',
    paddingBottom: 20
  },
  saveBtn: {
    height: 60, // Leggermente più basso (da 65)
    borderRadius: 20, 
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  saveBtnText: {
    fontSize: 17,
    fontWeight: "700", // Da 900 a 700: meno "urlo", più classe
    letterSpacing: 0.2,
  },
});