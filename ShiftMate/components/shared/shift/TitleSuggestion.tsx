import React from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";

interface Props {
  department: string;
  titleValue: string;
  onTitleChange: (text: string) => void;
  theme: any;
}

export const TitleSuggestions = ({
  department,
  titleValue,
  onTitleChange,
  theme,
}: Props) => {
  if (!department) return null;

  return (
    <View>
      <View style={styles.inputWrapper}>
        <Text style={[styles.label, { color: theme.text }]}>
          Position Title *
        </Text>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: theme.card,
              color: theme.text,
              borderColor: theme.border,
            },
          ]}
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
  label: {
    fontSize: 11,
    fontWeight: "800",
    marginBottom: 12,
    textTransform: "uppercase",
    opacity: 0.6,
  },
  input: {
    height: 60,
    paddingHorizontal: 18,
    borderRadius: 20,
    fontSize: 16,
    borderWidth: 1,
    fontWeight: "600",
  },
});
