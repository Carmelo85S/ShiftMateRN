import { View, Text, StyleSheet } from "react-native";

export const FaqBlock = ({ question, answer, theme, children }: any) => (
  <View style={styles.faqBlock}>
    <Text style={[styles.faqQuestion, { color: theme.text }]}>{question}</Text>
    {children ? children : (
      <Text style={[styles.faqAnswer, { color: theme.secondaryText }]}>{answer}</Text>
    )}
  </View>
);

const styles = StyleSheet.create({
  faqBlock: { marginBottom: 24 },
  faqQuestion: { fontSize: 14, fontWeight: "800", marginBottom: 8 },
  faqAnswer: { fontSize: 13, lineHeight: 20, fontWeight: "500", opacity: 0.8 }
});