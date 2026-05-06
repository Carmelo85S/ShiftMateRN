import React from "react"; // Buona pratica includerlo
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface CategoryCardProps {
  title: string;
  icon: keyof typeof Ionicons.glyphMap; 
  desc: string;
  theme: any;
}

export const CategoryCard = ({ title, icon, desc, theme }: CategoryCardProps) => {
  return (
    <View style={[styles.catCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
      <View style={[styles.iconWrapper, { backgroundColor: theme.background }]}>
        <Ionicons name={icon} size={24} color={theme.text} />
      </View>
      <View>
        <Text style={[styles.catTitle, { color: theme.text }]}>{title}</Text>
        <Text style={[styles.catDesc, { color: theme.secondaryText }]}>{desc}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  catCard: { width: '48%',padding: 20,borderRadius: 24,borderWidth: 1,justifyContent: 'space-between',minHeight: 150},
  iconWrapper: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  catTitle: { fontSize: 16, fontWeight: "800",marginBottom: 5 },
  catDesc: { fontSize: 12, fontWeight: "600",lineHeight: 16,opacity: 0.8 }
});