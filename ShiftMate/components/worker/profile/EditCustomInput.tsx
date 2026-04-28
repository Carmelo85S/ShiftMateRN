import { Text, View, TextInput, StyleSheet, KeyboardTypeOptions } from "react-native";

// Definiamo un'interfaccia veloce per mantenere la Type Safety di cui parlavamo
interface CustomInputProps {
  label: string;
  value: string;
  onChange: (text: string) => void;
  placeholder?: string;
  theme: any; 
  keyboardType?: KeyboardTypeOptions;
}

export const EditCustomInput = ({ label, value, onChange, placeholder, theme, keyboardType }: CustomInputProps) => (
  <View style={styles.inputWrapper}>
    <Text style={[styles.label, { color: theme.secondaryText }]}>{label}</Text>
    <TextInput
      value={value ?? ""}
      onChangeText={onChange}
      placeholder={placeholder}
      placeholderTextColor="#BBB"
      keyboardType={keyboardType || "default"}
      style={[
        styles.input, 
        { backgroundColor: theme.card, color: theme.text, borderColor: theme.border }
      ]}
    />
  </View>
);

const styles = StyleSheet.create({
  inputWrapper: { 
    gap: 8 
  },
  label: { 
    fontSize: 10, 
    fontWeight: "800", 
    letterSpacing: 1.5,
    textTransform: "uppercase" // Spesso i label con questo spacing stanno bene in uppercase
  },
  input: {
    height: 56,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 16,
    fontSize: 16,
    fontWeight: "600",
  },
});