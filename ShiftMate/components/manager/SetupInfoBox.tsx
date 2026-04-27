import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface InfoBoxProps {
  icon: keyof typeof Ionicons.glyphMap;
  text: string;
  theme: any;
}

export const SetupInfoBox = ({ icon, text, theme }: InfoBoxProps) => (
  <View style={[styles.infoBox, { backgroundColor: theme.card || '#F8F9FA' }]}>
    <Ionicons name={icon} size={20} color={theme.text} style={{ opacity: 0.6 }} />
    <Text style={[styles.subtitle, { color: theme.text + "99" }]}>{text}</Text>
  </View>
);

const styles = StyleSheet.create({
  infoBox: { 
    flexDirection: 'row', 
    gap: 10, 
    padding: 16, 
    borderRadius: 15, 
    borderWidth: 1, 
    borderColor: 'rgba(0,0,0,0.05)' 
  },
  subtitle: { flex: 1, fontSize: 15, lineHeight: 20, fontWeight: "500" },
});