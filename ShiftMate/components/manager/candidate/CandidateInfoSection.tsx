import { View, Text, StyleSheet, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface SectionProps {
  label: string;
  value?: string | null;
  icon?: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
  isHighlight?: boolean;
  theme: any;
}

export const CandidateInfoSection = ({ 
  label, 
  value, 
  icon, 
  onPress, 
  isHighlight, 
  theme 
}: SectionProps) => {
  const content = value || `No ${label.toLowerCase()} provided.`;
  
  const Container = onPress ? Pressable : View;

  return (
    <Container 
      onPress={onPress}
      style={[
        styles.sectionCard, 
        { backgroundColor: theme.card },
        isHighlight && { borderLeftWidth: 4, borderLeftColor: theme.tint },
        onPress && styles.contactCard
      ]}
    >
      <View style={{ flex: 1 }}>
        <Text style={[styles.sectionLabel, { color: theme.text }]}>{label}</Text>
        
        <View style={styles.contentRow}>
          {icon && <Ionicons name={icon} size={20} color={theme.tint} style={styles.icon} />}
          <Text style={[
            styles.sectionText, 
            { color: theme.text },
            isHighlight && styles.experienceText,
            onPress && styles.contactText
          ]}>
            {content}
          </Text>
        </View>
      </View>

      {onPress && (
        <Ionicons name="chevron-forward" size={18} color={theme.text} style={{ opacity: 0.3 }} />
      )}
    </Container>
  );
};

const styles = StyleSheet.create({
    sectionCard: { padding: 20, borderRadius: 20 },
    sectionLabel: { fontSize: 10, fontWeight: "800", marginBottom: 8, opacity: 0.4,letterSpacing: 0.5},
    contentRow: { flexDirection: 'row', alignItems: 'center' },
    icon: { marginRight: 12 },
    sectionText: { fontSize: 15, lineHeight: 22, opacity: 0.8 },
    experienceText: { fontSize: 16, fontWeight: "700"},
    contactCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    contactText: { fontSize: 17, fontWeight: "700" },
});