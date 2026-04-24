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
  useColorScheme, 
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { fetchUserProfile } from "@/queries/managerQueries";

export default function ProfileManager() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Load profile data from Supabase
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

  // Reload data every time the screen comes into focus
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
          paddingHorizontal: 28, // Aligned with Shift screens
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
              {profile?.job_role || "Manager"}
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

const MenuRow = ({ label, icon, onPress, theme }: any) => (
  <Pressable 
    onPress={onPress} 
    style={({ pressed }) => [
      styles.menuRow, 
      { backgroundColor: pressed ? theme.card : 'transparent' }
    ]}
  >
    <View style={styles.menuLeft}>
      <View style={[styles.iconCircle, { backgroundColor: theme.card }]}>
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
  nameTitle: { fontSize: 32, fontWeight: "900", letterSpacing: -1 },
  avatarFrame: { 
    width: 74, height: 74, borderRadius: 28, justifyContent: 'center', alignItems: 'center',
    borderWidth: 1,
  },
  avatar: { width: '100%', height: '100%', borderRadius: 27 },
  infoCard: { 
    flexDirection: 'row', borderRadius: 24, padding: 24, marginBottom: 40, borderWidth: 1,
  },
  infoItem: { flex: 1, gap: 6 },
  infoLabel: { fontSize: 11, fontWeight: "800", opacity: 0.4, letterSpacing: 0.6 },
  infoValue: { fontSize: 16, fontWeight: "700" },
  verticalDivider: { width: 1, height: '80%', alignSelf: 'center', marginHorizontal: 20 },
  statusBadge: { 
    flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(52, 199, 89, 0.1)', 
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, alignSelf: 'flex-start'
  },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 12, fontWeight: "700" },
  bioSection: { marginBottom: 35 },
  sectionTitle: { fontSize: 18, fontWeight: "800", marginBottom: 10 },
  bioDescription: { fontSize: 15, lineHeight: 22, opacity: 0.7 },
  menuList: { gap: 4 },
  menuRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, paddingHorizontal: 12, borderRadius: 20 },
  menuLeft: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  iconCircle: { width: 46, height: 46, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  menuLabel: { fontSize: 16, fontWeight: "600" },
});