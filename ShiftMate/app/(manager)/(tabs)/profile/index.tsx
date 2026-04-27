import React, { useCallback } from "react";
import { 
  View, 
  ScrollView, 
  ActivityIndicator, 
  useColorScheme, 
  StyleSheet 
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Colors } from "@/constants/theme";

import { useHandleProfile } from "@/hooks/manager/useHandleProfile";

// Components (Shared)
import { ProfileHeader } from "@/components/shared/profile/ProfileHeader";
import { ProfileInfoCard } from "@/components/shared/profile/ProfileInfoCard";
import { BiographySection } from "@/components/shared/profile/BiographySection";
import { MenuRowProfile } from "@/components/manager/profile/MenuRowProfile";
import { ScreenWrapper } from "@/components/shared/wrapper/layout-wrapper";

export default function ProfileManager() {
  const theme = Colors[useColorScheme() ?? "light"];
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // Hook fetch data profile
  const { profile, loading, loadData } = useHandleProfile();

  // Refresh 
  useFocusEffect(
    useCallback(() => { 
      loadData(); 
    }, [loadData])
  );

  // 
  if (loading) return (
    <View style={[styles.center, { backgroundColor: theme.background }]}>
      <ActivityIndicator size="small" color={theme.tint} />
    </View>
  );

  return (
    <ScreenWrapper>
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent, 
          { paddingTop: insets.top + 20, paddingBottom: 40 }
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* AVATAR */}
        <ProfileHeader 
          profile={profile} 
          theme={theme} 
        />

        {/* INFO ROLE AND STATUS*/}
        <ProfileInfoCard 
          role={profile?.job_role || "Manager"} 
          theme={theme} 
        />

        {/* BIO */}
        <BiographySection 
          bio={profile?.bio} 
          theme={theme} 
        />

        {/* MENU LIST */}
        <View style={styles.menuContainer}>
          <MenuRowProfile
            label="Edit Details" 
            icon="person-outline" 
            onPress={() => router.push("/(manager)/(tabs)/profile/editProfile")}
            theme={theme}
          />
          <MenuRowProfile
            label="Security" 
            icon="shield-checkmark-outline" 
            onPress={() => {}}
            theme={theme}
          />
          <MenuRowProfile
            label="Notifications" 
            icon="notifications-outline" 
            onPress={() => {}}
            theme={theme}
          />
          <MenuRowProfile
            label="Logout" 
            icon="log-out-outline" 
            onPress={() => {}}
            theme={theme}
          />
        </View>
      </ScrollView>
    </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  scrollContent: { paddingHorizontal: 28 },
  menuContainer: { gap: 4, marginTop: 10 },
});