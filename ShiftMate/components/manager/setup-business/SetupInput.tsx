import React from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";

interface InputProps {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  theme: any;
}

export const SetupInput = ({ label, placeholder, value, onChangeText, theme }: InputProps) => (
  <View style={styles.inputWrapper}>
    <Text style={[styles.inputLabel, { color: theme.text, opacity: 0.7 }]}>{label}</Text>
    <TextInput
      placeholder={placeholder}
      placeholderTextColor="#999"
      value={value}
      onChangeText={onChangeText}
      style={[styles.input, { color: theme.text, borderColor: theme.text }]}
    />
  </View>
);

const styles = StyleSheet.create({
  inputWrapper: { gap: 10 },
  inputLabel: { fontSize: 14, fontWeight: "600", marginLeft: 4 },
  input: { 
    width: "100%", 
    backgroundColor: "#F1F3F5", 
    borderRadius: 20, 
    padding: 18, 
    fontSize: 16, 
    borderWidth: 1 
  },
});