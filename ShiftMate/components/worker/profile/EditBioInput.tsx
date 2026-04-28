import React from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";

interface BioInputProps {
  value: string | null;
  onChange: (text: string) => void;
  theme: any;
  maxLength?: number;
}

export const BioInput = ({ value, onChange, theme, maxLength = 200 }: BioInputProps) => {
  return (
    <View style={styles.inputWrapper}>
      <Text style={[styles.label, { color: theme.secondaryText }]}>
        BIO (MAX {maxLength} CHARS)
      </Text>
      <TextInput
        value={value ?? ""}
        onChangeText={onChange}
        placeholder="Tell the team about yourself..."
        placeholderTextColor="#999"
        multiline
        maxLength={maxLength}
        style={[
          styles.textArea, 
          { 
            backgroundColor: theme.card, 
            color: theme.text, 
            borderColor: theme.border 
          }
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  inputWrapper: { 
    gap: 8 
  },
  label: { 
    fontSize: 10, 
    fontWeight: "800", 
    letterSpacing: 1.5 
  },
  textArea: {
    height: 120, // Leggermente più alto per dare respiro alla bio
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    fontWeight: "600",
    textAlignVertical: 'top', // Fondamentale per far partire il testo dall'alto su Android
  },
});