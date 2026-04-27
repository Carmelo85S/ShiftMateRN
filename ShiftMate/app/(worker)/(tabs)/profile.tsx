import React from "react";
import {
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  Pressable,
  useColorScheme,
} from "react-native";
import { Colors } from "@/constants/theme";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

// Hooks & Components
import { useFetchProfile } from "@/hooks/worker/profile/useFetchProfile";
import { ScreenWrapper } from "@/components/shared/wrapper/layout-wrapper";
import { ScreenHeader } from "@/components/shared/Header";
import { IdentityCard } from "@/components/worker/profile/IdentityCard";

export default function ProfileScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];
  const router = useRouter();

  const { profile, loading, fetchProfile, refreshing } = useFetchProfile();

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
    <ScreenWrapper 
      scrollable={true} 
      onRefresh={fetchProfile}
      refreshing={refreshing}
      style={styles.container}
    >
      {/* HEADER */}
      <ScreenHeader 
        kpi="My Identity" 
        title="Profile" 
        theme={theme} 
      />

      {/* CARD IDENTITY*/}
      <IdentityCard 
        profile={profile} 
        theme={theme} 
      />

      {/* MENU ACTIONS */}
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
    </ScreenWrapper>
  );
}

// Componente atomico interno (o da spostare in file separato)
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
  container: { paddingHorizontal: 25, paddingTop: 50 },
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