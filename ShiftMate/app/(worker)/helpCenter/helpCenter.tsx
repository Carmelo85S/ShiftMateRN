import React from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, Linking } from "react-native";
import { Colors } from "@/constants/theme";
import { Stack, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function HelpCenter() {
  const theme = Colors.light;
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const categories = [
    { id: '1', title: 'Payroll', icon: 'cash-sharp', desc: 'Salary & Extra Hours' },
    { id: '2', title: 'Emergency', icon: 'flash-sharp', desc: 'Last Minute Shifts' },
    { id: '3', title: 'Policies', icon: 'document-text-sharp', desc: 'Rules & Cancellations' },
    { id: '4', title: 'Insurance', icon: 'shield-checkmark-sharp', desc: 'Work Coverage' },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <Stack.Screen options={{ 
        headerTransparent: true, 
        headerTitle: "",
        headerTintColor: theme.text 
      }} />

      <ScrollView 
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 80 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={[styles.kpi, { color: theme.tint }]}>INTERNAL RESOURCES</Text>
          <Text style={[styles.title, { color: theme.text }]}>Help Center</Text>
        </View>

        <Text style={[styles.intro, { color: theme.secondaryText }]}>
          Find information about internal policies, extra shift payments, and insurance coverage.
        </Text>

        {/* GRID OF CATEGORIES */}
        <View style={styles.grid}>
          {categories.map((cat) => (
            <View 
              key={cat.id} 
              style={[styles.catCard, { backgroundColor: theme.card, borderColor: theme.border }]}
            >
              <View style={[styles.iconWrapper, { backgroundColor: theme.background }]}>
                <Ionicons name={cat.icon as any} size={24} color={theme.text} />
              </View>
              <Text style={[styles.catTitle, { color: theme.text }]}>{cat.title}</Text>
              <Text style={[styles.catDesc, { color: theme.secondaryText }]}>{cat.desc}</Text>
            </View>
          ))}
        </View>

        {/* DETAILED FAQ SECTIONS - Based on your specific rules */}
        <View style={styles.faqSection}>
          <Text style={[styles.sectionLabel, { color: theme.tint }]}>FREQUENTLY ASKED QUESTIONS</Text>

          {/* PAYMENTS */}
          <View style={styles.faqBlock}>
            <Text style={[styles.faqQuestion, { color: theme.text }]}>How are extra shifts paid?</Text>
            <Text style={[styles.faqAnswer, { color: theme.secondaryText }]}>
              All extra shifts managed through the app are automatically added to your monthly payroll. You will find them detailed in your payslip at the end of the month.
            </Text>
          </View>

          {/* SHIFTS & CANCELLATIONS */}
          <View style={styles.faqBlock}>
            <Text style={[styles.faqQuestion, { color: theme.text }]}>What is the cancellation policy?</Text>
            <Text style={[styles.faqAnswer, { color: theme.secondaryText }]}>
              Since these shifts address urgent needs, you can cancel your availability up to <Text style={{ fontWeight: '800', color: theme.text }}>3 hours before</Text> the start time. Late cancellations may affect your internal rating.
            </Text>
          </View>

          {/* EMERGENCY & LAST MINUTE SHIFTS */}
            <View style={styles.faqBlock}>
              <Text style={[styles.faqQuestion, { color: theme.text }]}>
                What are "Last Minute" shifts?
              </Text>
              <Text style={[styles.faqAnswer, { color: theme.secondaryText }]}>
                These are urgent positions opened to cover sudden absences, sickness, or unexpected peaks in workload. They are designed to ensure the team is never understaffed. 
                {"\n\n"}
                <Text style={{ fontWeight: '800', color: theme.tint }}>Pro-tip:</Text> Enabling push notifications is the best way to see these shifts as they are often filled within minutes.
              </Text>
            </View>

            <View style={styles.faqBlock}>
              <Text style={[styles.faqQuestion, { color: theme.text }]}>
                Is accepting an emergency shift mandatory?
              </Text>
              <Text style={[styles.faqAnswer, { color: theme.secondaryText }]}>
                No. Picking up extra shifts is always voluntary. We value your flexibility, but you are only expected to work if you explicitly apply and are confirmed through the app.
              </Text>
            </View>

          {/* INSURANCE */}
          <View style={styles.faqBlock}>
            <Text style={[styles.faqQuestion, { color: theme.text }]}>Am I insured during extra shifts?</Text>
            <Text style={[styles.faqAnswer, { color: theme.secondaryText }]}>
              Yes. As a contracted employee, your standard workplace insurance covers all extra shifts performed through this platform, as they are part of your official work activity.
            </Text>
          </View>
        </View>

        {/* DIRECT SUPPORT */}
        <View style={[styles.supportBox, { backgroundColor: theme.text }]}>
          <View style={styles.supportInfo}>
            <Text style={[styles.supportTitle, { color: theme.background }]}>Contact your Manager</Text>
            <Text style={[styles.supportDesc, { color: theme.background, opacity: 0.7 }]}>
              For contract or payroll discrepancies.
            </Text>
          </View>
          <Pressable style={[styles.supportBtn, { backgroundColor: theme.tint }]}>
            <Text style={styles.supportBtnText}>Email Support</Text>
          </Pressable>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 25, paddingBottom: 60 },
  backBtn: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginLeft: 10 },
  header: { marginBottom: 20 },
  kpi: { fontSize: 11, fontWeight: "900", letterSpacing: 2, marginBottom: 4 },
  title: { fontSize: 42, fontWeight: "900", letterSpacing: -2 },
  intro: { fontSize: 16, fontWeight: "600", lineHeight: 24, marginBottom: 35 },

  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'space-between' },
  catCard: { width: '48%', padding: 20, borderRadius: 24, borderWidth: 1, gap: 10 },
  iconWrapper: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  catTitle: { fontSize: 16, fontWeight: "800" },
  catDesc: { fontSize: 12, fontWeight: "600", opacity: 0.6 },

  faqSection: { marginTop: 40 },
  sectionLabel: { fontSize: 11, fontWeight: "900", letterSpacing: 1.5, marginBottom: 20 },
  faqBlock: { marginBottom: 25, gap: 8 },
  faqQuestion: { fontSize: 17, fontWeight: "800" },
  faqAnswer: { fontSize: 14, lineHeight: 20, fontWeight: "500" },

  supportBox: { marginTop: 20, padding: 25, borderRadius: 28, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  supportInfo: { flex: 1, gap: 4 },
  supportTitle: { fontSize: 20, fontWeight: "900" },
  supportDesc: { fontSize: 13, fontWeight: "600" },
  supportBtn: { paddingVertical: 12, paddingHorizontal: 20, borderRadius: 14 },
  supportBtnText: { color: '#FFF', fontWeight: "900", fontSize: 14 },
});