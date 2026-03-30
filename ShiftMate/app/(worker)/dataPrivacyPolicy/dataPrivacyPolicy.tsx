import React from "react";
import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { Colors } from "@/constants/theme";
import { Stack, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function DataPrivacyPolicy() {
  const theme = Colors.light;
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      {/* Header Config to prevent flicker */}
      <Stack.Screen options={{ 
          headerTransparent: true, 
          headerTitle: "",
          headerTintColor: theme.text 
        }}
      />

      <ScrollView 
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 80 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={[styles.kpi, { color: theme.tint }]}>LEGAL & SAFETY</Text>
          <Text style={[styles.title, { color: theme.text }]}>Data Privacy</Text>
        </View>

        <Text style={[styles.intro, { color: theme.secondaryText }]}>
          Your privacy is our priority. We only process the data strictly necessary to connect you with high-quality job opportunities.
        </Text>

        <View style={styles.divider} />

        {/* SECTION 1: DATA COLLECTION */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={[styles.iconBox, { backgroundColor: theme.card }]}>
              <Ionicons name="finger-print-sharp" size={20} color={theme.text} />
            </View>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>WHAT WE COLLECT</Text>
          </View>
          <Text style={[styles.bodyText, { color: theme.text }]}>
            We collect your name, job role, and professional bio so Managers can evaluate your profile. Your GPS location is used exclusively to show you shifts available in your immediate area.
          </Text>
        </View>

        {/* SECTION 2: DATA VISIBILITY */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={[styles.iconBox, { backgroundColor: theme.card }]}>
              <Ionicons name="eye-sharp" size={20} color={theme.text} />
            </View>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>WHO SEES YOUR DATA</Text>
          </View>
          <Text style={[styles.bodyText, { color: theme.text }]}>
            Only verified Managers of the companies you apply to can view your full profile. Your personal information will never be sold to third parties for marketing purposes.
          </Text>
        </View>

        {/* SECTION 3: DATA DELETION */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={[styles.iconBox, { backgroundColor: '#FFEBEE' }]}>
              <Ionicons name="trash-sharp" size={20} color="#D32F2F" />
            </View>
            <Text style={[styles.sectionTitle, { color: "#D32F2F" }]}>YOUR RIGHT TO DELETE</Text>
          </View>
          <Text style={[styles.bodyText, { color: theme.text }]}>
            You can delete your account at any time from the "Edit Profile" section. All personal data will be permanently purged from our servers within 30 days of your request.
          </Text>
        </View>

        {/* FOOTER */}
        <View style={[styles.footer, { borderTopColor: theme.border }]}>
          <Text style={[styles.lastUpdate, { color: theme.secondaryText }]}>
            Last updated: March 2026
          </Text>
          <Text style={[styles.compliance, { color: theme.secondaryText }]}>
            Fully compliant with GDPR and international data protection standards.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 25, paddingBottom: 60 },
  backBtn: { 
    width: 40, 
    height: 40, 
    borderRadius: 12, 
    justifyContent: 'center', 
    alignItems: 'center',
    marginLeft: 10 
  },
  header: { marginBottom: 20 },
  kpi: { fontSize: 11, fontWeight: "900", letterSpacing: 2, marginBottom: 4 },
  title: { fontSize: 42, fontWeight: "900", letterSpacing: -2 },
  intro: { fontSize: 16, fontWeight: "600", lineHeight: 24, marginBottom: 30 },
  
  divider: { height: 1, backgroundColor: '#EEE', marginBottom: 35 },

  section: { marginBottom: 40 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 15, marginBottom: 15 },
  iconBox: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  sectionTitle: { fontSize: 13, fontWeight: "900", letterSpacing: 1 },
  bodyText: { fontSize: 15, lineHeight: 24, fontWeight: "500", opacity: 0.7 },
  
  footer: { marginTop: 20, paddingTop: 30, borderTopWidth: 1, alignItems: 'center', gap: 8 },
  lastUpdate: { fontSize: 12, fontWeight: "700" },
  compliance: { fontSize: 11, fontWeight: "500", textAlign: 'center', opacity: 0.6 }
});