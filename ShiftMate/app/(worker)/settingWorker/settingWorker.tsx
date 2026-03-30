import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, Switch, Pressable, Platform } from "react-native";
import { Colors } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { Stack } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function WorkerSettingsScreen() {
  const theme = Colors.light;
  const insets = useSafeAreaInsets();

  // Stati per gli switch (da collegare poi a Supabase o Local Storage)
  const [notifications, setNotifications] = useState(true);
  const [preciseLocation, setPreciseLocation] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  return (
    <ScrollView 
      style={{ flex: 1, backgroundColor: theme.background }}
      contentContainerStyle={{ paddingTop: insets.top + 60, paddingHorizontal: 25, paddingBottom: 50 }}
    >
      {/* Configurazione Header per evitare il flicker */}
      <Stack.Screen options={{ 
        headerTransparent: true, 
        headerTitle: "",
        headerTintColor: theme.text 
      }} />

      <View style={styles.header}>
        <Text style={[styles.kpi, { color: theme.tint }]}>APP PREFERENCES</Text>
        <Text style={[styles.title, { color: theme.text }]}>Settings</Text>
      </View>

      {/* SEZIONE: NOTIFICHE */}
      <View style={styles.section}>
        <Text style={[styles.sectionLabel, { color: theme.secondaryText }]}>NOTIFICATIONS</Text>
        <SettingSwitch 
          icon="notifications-sharp" 
          label="Push Notifications" 
          value={notifications} 
          onValueChange={setNotifications} 
          theme={theme} 
        />
        <SettingSwitch 
          icon="flash-sharp" 
          label="New Shift Alerts" 
          value={true} 
          onValueChange={() => {}} 
          theme={theme} 
        />
      </View>

      {/* SEZIONE: PRIVACY & POSIZIONE */}
      <View style={styles.section}>
        <Text style={[styles.sectionLabel, { color: theme.secondaryText }]}>PRIVACY</Text>
        <SettingSwitch 
          icon="location-sharp" 
          label="Precise Location" 
          value={preciseLocation} 
          onValueChange={setPreciseLocation} 
          theme={theme} 
        />
        <SettingRow 
          icon="shield-checkmark-sharp" 
          label="Data Privacy Policy" 
          onPress={() => {}} 
          theme={theme} 
        />
      </View>

      {/* SEZIONE: ACCOUNT */}
      <View style={styles.section}>
        <Text style={[styles.sectionLabel, { color: theme.secondaryText }]}>SUPPORT</Text>
        <SettingRow 
          icon="help-circle-sharp" 
          label="Help Center" 
          onPress={() => {}} 
          theme={theme} 
        />
        <SettingRow 
          icon="mail-sharp" 
          label="Contact Support" 
          onPress={() => {}} 
          theme={theme} 
        />
      </View>

      <Text style={styles.version}>Version 1.0.4 (Build 22)</Text>
    </ScrollView>
  );
}

// --- SOTTOCOMPONENTE: RIGA CON SWITCH ---
const SettingSwitch = ({ icon, label, value, onValueChange, theme }: any) => (
  <View style={[styles.row, { borderBottomColor: theme.border }]}>
    <View style={styles.rowLeft}>
      <View style={[styles.iconBox, { backgroundColor: theme.card }]}>
        <Ionicons name={icon} size={20} color={theme.text} />
      </View>
      <Text style={[styles.rowLabel, { color: theme.text }]}>{label}</Text>
    </View>
    <Switch 
      value={value} 
      onValueChange={onValueChange}
      trackColor={{ false: "#E5E7EB", true: theme.text }}
      thumbColor="#FFF"
      ios_backgroundColor="#E5E7EB"
    />
  </View>
);

// --- SOTTOCOMPONENTE: RIGA CLICCABILE ---
const SettingRow = ({ icon, label, onPress, theme }: any) => (
  <Pressable 
    onPress={onPress}
    style={({ pressed }) => [
      styles.row, 
      { borderBottomColor: theme.border, opacity: pressed ? 0.6 : 1 }
    ]}
  >
    <View style={styles.rowLeft}>
      <View style={[styles.iconBox, { backgroundColor: theme.card }]}>
        <Ionicons name={icon} size={20} color={theme.text} />
      </View>
      <Text style={[styles.rowLabel, { color: theme.text }]}>{label}</Text>
    </View>
    <Ionicons name="chevron-forward" size={18} color={theme.border} />
  </Pressable>
);

const styles = StyleSheet.create({
  header: { marginBottom: 40 },
  kpi: { fontSize: 11, fontWeight: "900", letterSpacing: 2, marginBottom: 4 },
  title: { fontSize: 42, fontWeight: "900", letterSpacing: -2 },
  
  section: { marginBottom: 32 },
  sectionLabel: { fontSize: 10, fontWeight: "800", letterSpacing: 1.5, marginBottom: 12, marginLeft: 4 },
  
  row: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingVertical: 16, 
    borderBottomWidth: 1 
  },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  iconBox: { 
    width: 38, 
    height: 38, 
    borderRadius: 12, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  rowLabel: { fontSize: 16, fontWeight: "700" },
  version: { textAlign: 'center', marginTop: 20, fontSize: 12, opacity: 0.3, fontWeight: "600" }
});