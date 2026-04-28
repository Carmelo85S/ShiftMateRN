import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface DepartmentPickerProps {
  value: string | null;
  onSelect: (callback: (dept: string) => void) => void;
  setFormValue: (dept: string) => void;
  theme: any;
}

export const DepartmentPicker = ({ value, onSelect, setFormValue, theme }: DepartmentPickerProps) => {
  return (
    <View style={styles.inputWrapper}>
      <Text style={[styles.label, { color: theme.secondaryText }]}>DEPARTMENT</Text>
      <Pressable 
        onPress={() => onSelect(setFormValue)}
        style={[
          styles.input, 
          { backgroundColor: theme.card, borderColor: theme.border }
        ]}
      >
        <View style={styles.rowBetween}>
          <Text style={{ 
            color: value ? theme.text : "#BBB", 
            fontWeight: "600",
            fontSize: 16 
          }}>
            {value ? value.toUpperCase() : "Select Department"}
          </Text>
          <Ionicons name="chevron-down" size={18} color={theme.secondaryText} />
        </View>
      </Pressable>
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
  input: {
    height: 56,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
});