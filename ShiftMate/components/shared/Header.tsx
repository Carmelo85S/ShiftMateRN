import React from "react";
import { StyleSheet, Text, View, ViewStyle } from "react-native";

interface HeaderProps {
  kpi: string;
  title: string;
  theme: {
    tint?: string;
    text?: string;
  };
  containerStyle?: ViewStyle;
}

export const ScreenHeader = ({
  kpi,
  title,
  theme,
  containerStyle,
}: HeaderProps) => {
  return (
    <View style={[styles.headerArea, containerStyle]}>
      <Text style={[styles.kpi, { color: theme.tint }]}>
        {kpi.toUpperCase()}
      </Text>

      <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  headerArea: {
    marginTop: -8,
    marginBottom: 20,
  },

  kpi: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.8,
    marginBottom: 3,
  },

  title: {
    fontSize: 34,
    fontWeight: "900",
    letterSpacing: -1.5,
    lineHeight: 39,
  },
});
