import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Colors } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { useColorScheme } from "react-native";

import { ScreenWrapper } from "@/components/shared/wrapper/layout-wrapper";
import { ScreenHeader } from "@/components/shared/Header";
import { PolicySection } from "@/components/worker/setting-section/PolicySection";

export default function DataPrivacyPolicy() {
  const theme = Colors[useColorScheme() ?? "light"];

  return (
    <ScreenWrapper scrollable={true} style={styles.container}>
      <ScreenHeader 
        kpi="LEGAL & SAFETY" 
        title="Data Privacy" 
        theme={theme} 
      />

      <Text style={[styles.intro, { color: theme.secondaryText }]}>
        Your privacy is our priority. We only process the data strictly necessary to connect you with high-quality job opportunities.
      </Text>

      <View style={[styles.divider, { backgroundColor: theme.border }]} />

      {/* 2. Sezioni Modulari */}
      <PolicySection
        icon="finger-print-sharp"
        title="WHAT WE COLLECT"
        body="We collect your name, job role, and professional bio so Managers can evaluate your profile. Your GPS location is used exclusively to show you shifts available in your immediate area."
        theme={theme}
      />

      <PolicySection
        icon="eye-sharp"
        title="WHO SEES YOUR DATA"
        body="Only verified Managers of the companies you apply to can view your full profile. Your personal information will never be sold to third parties for marketing purposes."
        theme={theme}
      />

      <PolicySection
        icon="trash-sharp"
        title="YOUR RIGHT TO DELETE"
        body="You can delete your account at any time from the Edit Profile section. All personal data will be permanently purged from our servers within 30 days."
        theme={theme}
        isAlert
      />

      {/* 3. Footer */}
      <View style={[styles.footer, { borderTopColor: theme.border }]}>
        <Text style={[styles.lastUpdate, { color: theme.secondaryText }]}>
          Last updated: March 2026
        </Text>
        <Text style={[styles.compliance, { color: theme.secondaryText }]}>
          Fully compliant with GDPR and international data protection standards.
        </Text>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {paddingHorizontal: 25, paddingTop: 120},
  intro: { fontSize: 16, fontWeight: "600", lineHeight: 24, marginBottom: 30 },
  divider: { height: 1, marginBottom: 15 },
  section: { marginBottom: 40 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 15, marginBottom: 15 },
  iconBox: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  sectionTitle: { fontSize: 13, fontWeight: "900", letterSpacing: 1 },
  bodyText: { fontSize: 15, lineHeight: 24, fontWeight: "500", opacity: 0.7 },
  footer: { marginTop: 20, paddingTop: 30, borderTopWidth: 1, alignItems: 'center', gap: 8},
  lastUpdate: { fontSize: 12, fontWeight: "700" },
  compliance: { fontSize: 11, fontWeight: "500", textAlign: 'center', opacity: 0.6}
});