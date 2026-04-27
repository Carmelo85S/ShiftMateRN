import React from "react";
import { View, Text, StyleSheet, ViewStyle, TextStyle } from "react-native";

interface HeaderProps {
  kpi: string;
  title: string;
  theme: {
    tint: string;
    text: string;
  };
  containerStyle?: ViewStyle;
}

export const ScreenHeader = ({ kpi, title, theme, containerStyle }: HeaderProps) => {
  return (
    <View style={[styles.headerArea, containerStyle]}>
      <Text style={[styles.kpi, { color: theme.tint }]}>
        {kpi.toUpperCase()}
      </Text>
      <Text style={[styles.title, { color: theme.text }]}>
        {title}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  headerArea: { marginBottom: 30 },
  kpi: { fontSize: 11, fontWeight: "900", letterSpacing: 2, marginBottom: 4 },
  title: { fontSize: 42, fontWeight: "900", letterSpacing: -2,lineHeight: 48}
});