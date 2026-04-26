import React from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";

interface Props {
  value: string;
  onChange: (text: string) => void;
  theme: any;
}

export const Description = ({ value, onChange, theme }: Props) => {
  return (
    <View style={styles.inputWrapper}>
      <Text style={[styles.label, { color: theme.text }]}>Description</Text>
      <TextInput
        style={[
          styles.input, 
          styles.textArea, 
          { backgroundColor: theme.card, color: theme.text, borderColor: theme.border }
        ]}
        placeholder="Specify uniform requirements, specific tasks, etc."
        placeholderTextColor={theme.secondaryText}
        value={value}
        onChangeText={onChange}
        multiline
        numberOfLines={4}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  inputWrapper: { marginBottom: 25 },
  label: { fontSize: 11, fontWeight: "800", marginBottom: 12, textTransform: 'uppercase', opacity: 0.6 },
  input: { height: 60, paddingHorizontal: 18, borderRadius: 20, fontSize: 16, borderWidth: 1, fontWeight: '600'},
  textArea: { height: 120, textAlignVertical: "top", paddingTop: 16 },
});