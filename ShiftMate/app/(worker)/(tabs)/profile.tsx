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
import { Colors } from "@/constants/theme";
import { supabase } from "@/lib/supabase";
import { useRouter, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ProfileScreen() {
  const theme = Colors.light;
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Funzione per recuperare i dati dal database
  const fetchProfile = useCallback(async () => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;

      const { data, error } = await supabase
        .from("profiles")
        .select("id, name, surname, job_role, bio, avatar_url")
        .eq("id", userData.user.id)
        .single();

      if (error) throw error;
      if (data) setProfile(data);
    } catch (err) {
      console.error("Error fetching profile:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Questo hook fa scattare il refresh ogni volta che la tab torna in primo piano
  useFocusEffect(
    useCallback(() => {
      fetchProfile();
    }, [fetchProfile])
  );

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="small" color={theme.text} />
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <Text style={{ color: theme.text }}>No profile found</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.background }}
      contentContainerStyle={{
        paddingTop: insets.top + 20,
        paddingHorizontal: 25,
        paddingBottom: 50,
      }}
      showsVerticalScrollIndicator={false}
    >
      {/* HEADER TITOLO */}
      <View style={styles.headerArea}>
        <Text style={[styles.kpi, { color: theme.tint }]}>MY IDENTITY</Text>
        <Text style={[styles.title, { color: theme.text }]}>Profile</Text>
      </View>

      {/* CARD IDENTITÀ (Stile Badge Digitale) */}
      <View
        style={[
          styles.identityCard,
          { backgroundColor: theme.card, borderColor: theme.border },
        ]}
      >
        <View style={styles.avatarRow}>
          <View
            style={[
              styles.avatarCircle,
              { backgroundColor: theme.background, borderColor: theme.border },
            ]}
          >
            {profile?.avatar_url ? (
              <Image
                key={profile.avatar_url} // Forza il refresh dell'immagine se l'URL cambia (cache busting)
                source={{ uri: profile.avatar_url }}
                style={styles.avatarImage}
                resizeMode="cover"
              />
            ) : (
              <Ionicons name="person-sharp" size={40} color={theme.text} />
            )}
          </View>
          <View style={styles.nameSection}>
            <Text style={[styles.nameText, { color: theme.text }]} numberOfLines={1}>
              {profile?.name} {profile?.surname}
            </Text>
            <View style={[styles.roleBadge, { backgroundColor: theme.text }]}>
              <Text style={[styles.roleText, { color: theme.background }]}>
                {profile?.job_role?.toUpperCase() || "GENERAL WORKER"}
              </Text>
            </View>
          </View>
        </View>

        {profile?.bio && (
          <View style={styles.bioSection}>
            <Text style={[styles.bioLabel, { color: theme.secondaryText }]}>
              BIO / EXPERIENCE
            </Text>
            <Text style={[styles.bioText, { color: theme.text }]}>
              {profile.bio}
            </Text>
          </View>
        )}
      </View>

      {/* MENU AZIONI (Lista di pulsanti pulita) */}
      <View style={styles.menuSection}>
        <MenuButton
          icon="pencil-sharp"
          label="Edit Profile"
          onPress={() => router.push("/(worker)/profile/editProfile")}
          theme={theme}
        />
        <MenuButton
          icon="settings-sharp"
          label="App Settings"
          onPress={() => router.push("/(worker)/settingWorker/settingWorker")}
          theme={theme}
        />
      </View>
    </ScrollView>
  );
}

const MenuButton = ({ icon, label, onPress, theme, isDelete }: any) => (
  <Pressable
    onPress={onPress}
    style={({ pressed }) => [
      styles.menuBtn,
      { borderBottomColor: theme.border, opacity: pressed ? 0.6 : 1 },
    ]}
  >
    <View style={styles.menuLeft}>
      <Ionicons
        name={icon}
        size={22}
        color={isDelete ? "#FF3B30" : theme.text}
      />
      <Text
        style={[
          styles.menuLabel,
          { color: isDelete ? "#FF3B30" : theme.text },
        ]}
      >
        {label}
      </Text>
    </View>
    <Ionicons name="chevron-forward" size={18} color={theme.border} />
  </Pressable>
);

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  headerArea: { marginBottom: 30 },
  kpi: { fontSize: 11, fontWeight: "900", letterSpacing: 2, marginBottom: 4 },
  title: { fontSize: 42, fontWeight: "900", letterSpacing: -2 },

  identityCard: {
    padding: 24,
    borderRadius: 28,
    borderWidth: 1,
    marginBottom: 40,
    shadowColor: "#000",
    shadowOpacity: 0.02,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  avatarRow: { flexDirection: "row", alignItems: "center", gap: 20 },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 30,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  avatarImage: { width: "100%", height: "100%" },

  nameSection: { flex: 1, gap: 6 },
  nameText: { fontSize: 24, fontWeight: "800", letterSpacing: -0.5 },
  roleBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  roleText: { fontSize: 10, fontWeight: "900", letterSpacing: 0.5 },

  bioSection: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  bioLabel: { fontSize: 10, fontWeight: "800", marginBottom: 8, letterSpacing: 1 },
  bioText: { fontSize: 15, lineHeight: 22, fontWeight: "500" },

  menuSection: { gap: 5 },
  menuBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 20,
    borderBottomWidth: 1,
  },
  menuLeft: { flexDirection: "row", alignItems: "center", gap: 15 },
  menuLabel: { fontSize: 16, fontWeight: "700" },
});