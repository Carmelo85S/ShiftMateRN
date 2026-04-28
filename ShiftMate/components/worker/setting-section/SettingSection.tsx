import { View, Text, StyleSheet } from "react-native";

interface SettingSectionProps {
  label: string;
  children: React.ReactNode;
  theme: {
    secondaryText: string;
  };
}

export const SettingSection = ({ label, children, theme }: SettingSectionProps) => (
  <View style={styles.section}>
    <Text style={[styles.sectionLabel, { color: theme.secondaryText }]}>
      {label}
    </Text>
    {children}
  </View>
);

const styles = StyleSheet.create({
  section: { marginBottom: 32 },
  sectionLabel: { fontSize: 10, fontWeight: "800", letterSpacing: 1.5, marginBottom: 12, marginLeft: 4 },
});