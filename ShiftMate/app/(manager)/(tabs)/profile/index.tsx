import { Colors } from "@/constants/theme";
import { supabase } from "@/lib/supabase";
import { useRouter, useFocusEffect } from "expo-router";
import React, { useState, useCallback } from "react";
import { 
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

// Importiamo la tua query specifica
import { fetchUserProfile } from "@/queries/managerQueries";

export default function ProfileManager() {
  const theme = Colors.light; 
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Load data function
  const loadData = useCallback(async () => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;

      const data = await fetchUserProfile(userData.user.id);
      setProfile(data);
    } catch (error) {
      console.error("Error loading profile:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Reload data when returning to this screen
  useFocusEffect(
    useCallback(() => { 
      loadData(); 
    }, [loadData])
  );

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
        {/* HEADER */}
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.welcomeText, { color: theme.secondaryText }]}>Account</Text>
            <Text style={[styles.nameTitle, { color: theme.text }]}>
              {profile?.name} {profile?.surname}
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

        {/* INFO CARD */}
        <View style={[styles.infoCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={styles.infoItem}>
            <Text style={[styles.infoLabel, { color: theme.secondaryText }]}>ROLE</Text>
            <Text style={[styles.infoValue, { color: theme.text }]}>
              {profile?.job_role || "Administrator"}
            </Text>
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

        {/* BIO */}
        <View style={styles.bioSection}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Biography</Text>
          <Text style={[styles.bioDescription, { color: theme.secondaryText }]}>
            {profile?.bio || "No biography provided yet."}
          </Text>
        </View>

        {/* MENU */}
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
        </View>
      </ScrollView>
    </View>
  );
}

// Sottocomponente per le righe del menu
const MenuRow = ({ label, icon, onPress, theme }: any) => (
  <Pressable 
    onPress={onPress} 
    style={({ pressed }) => [
      styles.menuRow, 
      { opacity: pressed ? 0.6 : 1 }
    ]}
  >
    <View style={styles.menuLeft}>
      <View style={[styles.iconCircle, { backgroundColor: 'rgba(0,0,0,0.03)' }]}>
        <Ionicons name={icon} size={20} color={theme.text} />
      </View>
      <Text style={[styles.menuLabel, { color: theme.text }]}>{label}</Text>
    </View>
    <Ionicons name="chevron-forward" size={18} color={theme.icon} />
  </Pressable>
);

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 40, marginTop: 10 },
  welcomeText: { fontSize: 14, fontWeight: "600", opacity: 0.5, letterSpacing: 0.5, textTransform: 'uppercase' },
  nameTitle: { fontSize: 30, fontWeight: "700", letterSpacing: -0.8 },
  avatarFrame: { 
    width: 70, height: 70, borderRadius: 25, justifyContent: 'center', alignItems: 'center',
    shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 3,
  },
  avatar: { width: '100%', height: '100%', borderRadius: 25 },
  infoCard: { 
    flexDirection: 'row', borderRadius: 24, padding: 24, marginBottom: 40,
    shadowColor: "#000", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.04, shadowRadius: 20, elevation: 2,
  },
  infoItem: { flex: 1, gap: 6 },
  infoLabel: { fontSize: 11, fontWeight: "600", opacity: 0.4, letterSpacing: 0.5 },
  infoValue: { fontSize: 16, fontWeight: "700" },
  verticalDivider: { width: 1, height: '80%', alignSelf: 'center', marginHorizontal: 20, opacity: 0.1 },
  statusBadge: { 
    flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(52, 199, 89, 0.1)', 
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, alignSelf: 'flex-start'
  },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 12, fontWeight: "700" },
  bioSection: { marginBottom: 30, paddingHorizontal: 4 },
  sectionTitle: { fontSize: 18, fontWeight: "700", marginBottom: 10, letterSpacing: -0.3 },
  bioDescription: { fontSize: 15, lineHeight: 22, fontWeight: "400", opacity: 0.7 },
  menuList: { marginTop: 10, gap: 8 },
  menuRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14, paddingHorizontal: 12, borderRadius: 16 },
  menuLeft: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  iconCircle: { width: 42, height: 42, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  menuLabel: { fontSize: 16, fontWeight: "500", opacity: 0.9 },
});