import React from "react";
import { StyleSheet, Text, View, ScrollView } from "react-native";
import { Colors } from "@/constants/theme";
import { Stack, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useWorkerSettings } from "@/hooks/worker/worker-settings/useWorkerSettings";
import { SettingItem } from "@/components/shared/SettingsItem";
import { SettingSection } from "@/components/worker/setting-section/SettingSection";

export default function WorkerSettingsScreen() {
  const theme = Colors.light;
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const settings = useWorkerSettings();

  return (
    <ScrollView 
      style={{ flex: 1, backgroundColor: theme.background }}
      contentContainerStyle={[styles.container, { paddingTop: insets.top + 60 }]}
    >
      <Stack.Screen options={{ headerTransparent: true, headerTitle: "" }} />

      <View style={styles.header}>
        <Text style={[styles.kpi, { color: theme.tint }]}>APP PREFERENCES</Text>
        <Text style={[styles.title, { color: theme.text }]}>Settings</Text>
      </View>

      {/* NOTIFICATIONS */}
      <SettingSection label="NOTIFICATIONS" theme={theme}>
        <SettingItem 
          type="switch"
          icon="notifications-sharp" 
          label="Push Notifications" 
          value={settings.notifications} 
          onValueChange={settings.toggleNotifications} 
          theme={theme} 
        />
        <SettingItem 
          type="switch"
          icon="flash-sharp" 
          label="New Shift Alerts" 
          value={settings.newShiftAlerts} 
          onValueChange={settings.toggleShiftAlerts} 
          theme={theme} 
        />
      </SettingSection>

      {/* PRIVACY */}
      <SettingSection label="PRIVACY" theme={theme}>
        <SettingItem 
          icon="shield-checkmark-sharp" 
          label="Data Privacy Policy" 
          onPress={() => router.push("/(worker)/dataPrivacyPolicy/dataPrivacyPolicy")} 
          theme={theme} 
        />
      </SettingSection>

      {/* SUPPORT */}
      <SettingSection label="SUPPORT" theme={theme}>
        <SettingItem 
          icon="help-circle-sharp" 
          label="Help Center" 
          onPress={() => router.push("/(worker)/helpCenter/helpCenter")}
          theme={theme} 
        />
        <SettingItem 
          icon="mail-sharp" 
          label="Contact Support" 
          onPress={settings.contactSupport} 
          theme={theme} 
        />
      </SettingSection>

      <Text style={styles.version}>Version 1.0.4 (Build 22)</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 25, paddingBottom: 50 },
  header: { marginBottom: 40 },
  kpi: { fontSize: 11, fontWeight: "900", letterSpacing: 2, marginBottom: 4 },
  title: { fontSize: 42, fontWeight: "900", letterSpacing: -2 },
  version: { textAlign: 'center', marginTop: 20, fontSize: 12, opacity: 0.3, fontWeight: "600" }
});