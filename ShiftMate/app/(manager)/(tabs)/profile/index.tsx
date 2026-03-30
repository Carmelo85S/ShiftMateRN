import { Colors } from "@/constants/theme";
import { supabase } from "@/lib/supabase";
import { useRouter, useFocusEffect } from "expo-router";
import React, { useState, useCallback } from "react";
import { 
  Alert, 
  Pressable, 
  StyleSheet, 
  Text, 
  View, 
  Image, 
  ScrollView, 
  ActivityIndicator, 
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ProfileManager() {
  const theme = Colors.light; 
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;
    const { data } = await supabase.from("profiles").select("*").eq("id", userData.user.id).single();
    setProfile(data);
    setLoading(false);
  }, []);

  useFocusEffect(useCallback(() => { fetchProfile(); }, [fetchProfile]));

  if (loading) return (
    <View style={[styles.center, { backgroundColor: theme.background }]}>
      <ActivityIndicator size="small" color={theme.tint} />
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <ScrollView
        contentContainerStyle={{ 
          paddingTop: insets.top + 20, 
          paddingHorizontal: 20, 
          paddingBottom: 40 
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* HEADER: Titolo Pulito e Avatar laterale per coerenza */}
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.welcomeText, { color: theme.secondaryText }]}>Account</Text>
            <Text style={[styles.nameTitle, { color: theme.text }]}>
              {profile?.name || "Manager"}
            </Text>
          </View>
          <View style={[styles.avatarFrame, { backgroundColor: theme.card, borderColor: theme.border }]}>
            {profile?.avatar_url ? (
              <Image source={{ uri: profile.avatar_url }} style={styles.avatar} />
            ) : (
              <Ionicons name="person" size={30} color={theme.tint} />
            )}
          </View>
        </View>

        {/* INFO CARD: Unico elemento che stacca leggermente dallo sfondo */}
        <View style={[styles.infoCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={styles.infoItem}>
            <Text style={[styles.infoLabel, { color: theme.secondaryText }]}>ROLE</Text>
            <Text style={[styles.infoValue, { color: theme.text }]}>{profile?.job_role || "Administrator"}</Text>
          </View>
          <View style={[styles.verticalDivider, { backgroundColor: theme.border }]} />
          <View style={styles.infoItem}>
            <Text style={[styles.infoLabel, { color: theme.secondaryText }]}>STATUS</Text>
            <View style={styles.statusBadge}>
              <View style={[styles.statusDot, { backgroundColor: theme.success }]} />
              <Text style={[styles.statusText, { color: theme.success }]}>Active</Text>
            </View>
          </View>
        </View>

        {/* BIO INTEGRATA */}
        <View style={styles.bioSection}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Biography</Text>
          <Text style={[styles.bioDescription, { color: theme.secondaryText }]}>
            {profile?.bio || "Describe your professional experience here."}
          </Text>
        </View>

        {/* MENU: Righe eleganti con icone a sinistra */}
        <View style={styles.menuList}>
          <MenuRow 
            label="Edit Details" 
            icon="person-outline" 
            onPress={() => router.push("/(manager)/(tabs)/profile/editProfile")}
            theme={theme}
          />
          <MenuRow 
            label="Security" 
            icon="shield-checkmark-outline" 
            onPress={() => {}}
            theme={theme}
          />
          <MenuRow 
            label="Notifications" 
            icon="notifications-outline" 
            onPress={() => {}}
            theme={theme}
          />
          
          <Pressable 
            onPress={() => supabase.auth.signOut().then(() => router.replace("/auth/login"))}
            style={styles.logoutBtn}
          >
            <Ionicons name="log-out-outline" size={20} color={theme.delete} />
            <Text style={[styles.logoutText, { color: theme.delete }]}>Sign Out</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const MenuRow = ({ label, icon, onPress, theme }: any) => (
  <Pressable 
    onPress={onPress} 
    style={({ pressed }) => [
      styles.menuRow, 
      { borderBottomColor: theme.border, opacity: pressed ? 0.6 : 1 }
    ]}
  >
    <View style={styles.menuLeft}>
      <View style={[styles.iconCircle, { backgroundColor: theme.background }]}>
        <Ionicons name={icon} size={20} color={theme.text} />
      </View>
      <Text style={[styles.menuLabel, { color: theme.text }]}>{label}</Text>
    </View>
    <Ionicons name="chevron-forward" size={18} color={theme.icon} />
  </Pressable>
);

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 30 },
  welcomeText: { fontSize: 16, fontWeight: "600", marginBottom: 2 },
  nameTitle: { fontSize: 32, fontWeight: "800", letterSpacing: -1 },
  avatarFrame: { width: 64, height: 64, borderRadius: 20, borderWidth: 1, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  avatar: { width: '100%', height: '100%' },

  infoCard: { flexDirection: 'row', borderRadius: 24, padding: 20, borderWidth: 1, marginBottom: 35 },
  infoItem: { flex: 1, gap: 4 },
  infoLabel: { fontSize: 10, fontWeight: "800", letterSpacing: 1 },
  infoValue: { fontSize: 16, fontWeight: "700" },
  verticalDivider: { width: 1, height: '100%', marginHorizontal: 15 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusText: { fontSize: 14, fontWeight: "700" },

  bioSection: { marginBottom: 40 },
  sectionTitle: { fontSize: 18, fontWeight: "800", marginBottom: 8 },
  bioDescription: { fontSize: 15, lineHeight: 22, fontWeight: "500" },

  menuList: { gap: 5 },
  menuRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 16, borderBottomWidth: 1 },
  menuLeft: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  iconCircle: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  menuLabel: { fontSize: 16, fontWeight: "600" },

  logoutBtn: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 40, alignSelf: 'center' },
  logoutText: { fontSize: 16, fontWeight: "700" },
});