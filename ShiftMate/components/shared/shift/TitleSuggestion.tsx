import React from "react";
import { View, Text, Pressable, StyleSheet, TextInput } from "react-native";
import { TITLES_BY_DEPT } from "@/constants/departments-titles";

interface Props {
  department: string;
  titleValue: string;
  onTitleChange: (text: string) => void;
  theme: any;
}

export const TitleSuggestions = ({ department, titleValue, onTitleChange, theme }: Props) => {
  if (!department) return null;

  return (
    <View>
      {/* CHIP SUGGERITI */}
      <View style={styles.inputWrapper}>
        <Text style={[styles.label, { color: theme.text }]}>Suggested Roles</Text>
        <View style={styles.titleContainer}>
          {TITLES_BY_DEPT[department]?.map((title) => {
            const isSelected = titleValue === title;
            return (
              <Pressable
                key={title}
                onPress={() => onTitleChange(title)}
                style={[
                  styles.titleChip,
                  { 
                    backgroundColor: isSelected ? theme.tint : theme.card, 
                    borderColor: theme.border 
                  }
                ]}
              >
                <Text style={[styles.titleChipText, { color: isSelected ? "#FFF" : theme.text }]}>
                  {title}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* INPUT TESTUALE */}
      <View style={styles.inputWrapper}>
        <Text style={[styles.label, { color: theme.text }]}>Position Title *</Text>
        <TextInput
          style={[styles.input, { backgroundColor: theme.card, color: theme.text, borderColor: theme.border }]}
          placeholder="e.g. Head Waiter"
          placeholderTextColor={theme.secondaryText}
          value={titleValue}
          onChangeText={onTitleChange}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  inputWrapper: { marginBottom: 25 },
  label: { fontSize: 11, fontWeight: "800", marginBottom: 12, textTransform: 'uppercase', opacity: 0.6 },
  titleContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  titleChip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 14, borderWidth: 1 },
  titleChipText: { fontSize: 13, fontWeight: "600" },
  input: { height: 60, paddingHorizontal: 18, borderRadius: 20, fontSize: 16, borderWidth: 1, fontWeight: '600' },
});