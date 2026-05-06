import React from "react"; 
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface PolicySectionProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  body: string;
  theme: any;
  isAlert?: boolean;
}

export const PolicySection = ({ icon, title, body, theme, isAlert }: PolicySectionProps) => {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View style={[
          styles.iconBox, 
          { backgroundColor: isAlert ? '#FFEBEE' : theme.card }
        ]}>
          <Ionicons 
            name={icon} 
            size={20} 
            color={isAlert ? "#D32F2F" : theme.text} 
          />
        </View>
        <Text style={[
          styles.sectionTitle, 
          { color: isAlert ? "#D32F2F" : theme.text }
        ]}>
          {title}
        </Text>
      </View>
      <Text style={[styles.bodyText, { color: theme.text }]}>
        {body}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  section: { marginBottom: 40 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 15, marginBottom: 15 },
  iconBox: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  sectionTitle: { fontSize: 13, fontWeight: "900", letterSpacing: 1 },
  bodyText: { fontSize: 15, lineHeight: 24, fontWeight: "500", opacity: 0.7 },
});