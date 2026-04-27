import React from "react";
import { Text, Pressable, StyleSheet, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface ButtonProps {
  title: string;
  onPress: () => void;
  loading: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  theme: any;
}

export const SetupButton = ({ title, onPress, loading, icon, theme }: ButtonProps) => (
  <Pressable 
    style={({ pressed }) => [
      styles.button, 
      { backgroundColor: theme.text, opacity: pressed || loading ? 0.8 : 1 }
    ]} 
    onPress={onPress}
    disabled={loading}
  >
    {loading ? (
      <ActivityIndicator color={theme.background} />
    ) : (
      <>
        <Text style={[styles.buttonText, { color: theme.background }]}>{title}</Text>
        {icon && <Ionicons name={icon} size={20} color={theme.background} />}
      </>
    )}
  </Pressable>
);

const styles = StyleSheet.create({
  button: { 
    width: "100%", 
    padding: 18, 
    borderRadius: 22, 
    flexDirection: "row", 
    alignItems: "center", 
    justifyContent: "center", 
    gap: 12, 
    marginTop: 10,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
  },
  buttonText: { fontWeight: "700", fontSize: 16, letterSpacing: 0.2 },
});