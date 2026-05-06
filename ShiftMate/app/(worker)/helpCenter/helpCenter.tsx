import React from "react";
import { View, Text, StyleSheet, Pressable, useColorScheme } from "react-native";
import { Colors } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";

// Tuoi standard
import { ScreenWrapper } from "@/components/shared/wrapper/layout-wrapper";
import { ScreenHeader } from "@/components/shared/Header";
import { CategoryCard } from "@/components/worker/help-center/Categorycard";
import { FaqBlock } from "@/components/worker/help-center/Faq";

const CATEGORIES = [
  { id: '1', title: 'Payroll', icon: 'cash-sharp', desc: 'Salary & Extra Hours' },
  { id: '2', title: 'Emergency', icon: 'flash-sharp', desc: 'Last Minute Shifts' },
  { id: '3', title: 'Policies', icon: 'document-text-sharp', desc: 'Rules & Cancellations' },
  { id: '4', title: 'Insurance', icon: 'shield-checkmark-sharp', desc: 'Work Coverage' },
] as const;

export default function HelpCenter() {
  const theme = Colors[useColorScheme() ?? "light"];

  return (
    <ScreenWrapper scrollable={true}>
      <View style={styles.container}>
        <ScreenHeader 
          kpi="INTERNAL RESOURCES" 
          title="Help Center" 
          theme={theme} 
        />

        <Text style={[styles.intro, { color: theme.secondaryText }]}>
          Find information about internal policies, extra shift payments, and insurance coverage.
        </Text>

        {/* GRID OF CATEGORIES */}
        <View style={styles.grid}>
          {CATEGORIES.map((cat) => (
            <CategoryCard key={cat.id} {...cat} theme={theme} />
          ))}
        </View>

        {/* FAQ SECTIONS */}
        <View style={styles.faqSection}>
          <Text style={[styles.sectionLabel, { color: theme.tint }]}>
            FREQUENTLY ASKED QUESTIONS
          </Text>

          <FaqBlock 
            theme={theme}
            question="How are extra shifts paid?"
            answer="All extra shifts managed through the app are automatically added to your monthly payroll."
          />

          <FaqBlock 
            theme={theme}
            question="What is the cancellation policy?"
          >
            <Text style={[styles.faqAnswer, { color: theme.secondaryText }]}>
              Since these shifts address urgent needs, you can cancel up to 
              <Text style={{ fontWeight: '800', color: theme.text }}> 3 hours before </Text> 
              the start time.
            </Text>
          </FaqBlock>

{/* EMERGENCY & LAST MINUTE */}
          <FaqBlock 
            theme={theme}
            question="What are 'Last Minute' shifts?"
          >
            <Text style={[styles.faqAnswer, { color: theme.secondaryText }]}>
              These are urgent positions opened to cover sudden absences or workload peaks. 
              {"\n\n"}
              <Text style={{ fontWeight: '800', color: theme.tint }}>Pro-tip:</Text> Enable push notifications to catch these, as they are often filled within minutes.
            </Text>
          </FaqBlock>

          <FaqBlock 
            theme={theme}
            question="Is accepting a shift mandatory?"
            answer="No. Picking up extra shifts is always voluntary. You are only expected to work if you explicitly apply and your application is confirmed by a Manager."
          />

          {/* INSURANCE */}
          <FaqBlock 
            theme={theme}
            question="Am I insured during extra shifts?"
            answer="Yes. As a contracted employee, your standard workplace insurance covers all extra shifts performed through this platform, as they are part of your official work activity."
          />

          {/* RATING & SYSTEM */}
          <FaqBlock 
            theme={theme}
            question="How does the Internal Rating work?"
            answer="Your rating is based on your reliability and feedback from Managers. High ratings give you priority access to the most requested shifts in the marketplace."
          />

          <FaqBlock 
            theme={theme}
            question="Why can't I see any available shifts?"
          >
             <Text style={[styles.faqAnswer, { color: theme.secondaryText }]}>
              This could be due to:
              {"\n"}• No open positions in your specific department.
              {"\n"}• Your profile is still pending verification.
              {"\n"}• You have a pending penalty for a late cancellation.
            </Text>
          </FaqBlock>
        </View>

        {/* DIRECT SUPPORT */}
        <View style={[styles.supportBox, { backgroundColor: theme.text }]}>
          <View style={styles.supportInfo}>
            <Text style={[styles.supportTitle, { color: theme.background }]}>
              Contact Manager
            </Text>
            <Text style={[styles.supportDesc, { color: theme.background, opacity: 0.7 }]}>
              For contract or payroll issues.
            </Text>
          </View>
          <Pressable style={[styles.supportBtn, { backgroundColor: theme.tint }]}>
            <Text style={styles.supportBtnText}>Email</Text>
          </Pressable>
        </View>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 25, paddingTop: 120 },
  intro: { fontSize: 16, fontWeight: "600", lineHeight: 24, marginBottom: 35, marginTop: 10 },
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
  supportBox: { marginTop: 20, padding: 25, borderRadius: 28, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 40 },
  supportInfo: { flex: 1, gap: 4 },
  supportTitle: { fontSize: 20, fontWeight: "900" },
  supportDesc: { fontSize: 13, fontWeight: "600" },
  supportBtn: { paddingVertical: 12, paddingHorizontal: 20, borderRadius: 14 },
  supportBtnText: { color: '#FFF', fontWeight: "900", fontSize: 14 },
});