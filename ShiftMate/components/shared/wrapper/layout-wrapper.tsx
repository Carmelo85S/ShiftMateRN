import React from "react";
import { View, StyleSheet, ScrollView, ViewStyle, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColorScheme } from "react-native";
import { Colors } from "@/constants/theme";

interface ScreenWrapperProps {
  children: React.ReactNode;
  style?: ViewStyle;
  scrollable?: boolean;
}

export const ScreenWrapper = ({ children, style, scrollable = true }: ScreenWrapperProps) => {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];

  const TAB_BAR_HEIGHT = 74 + 10 + insets.bottom;

  const containerStyle = [
    styles.container,
    { backgroundColor: theme.background },
    style
  ];

  const contentStyle = {
    paddingBottom: TAB_BAR_HEIGHT + 20, 
    paddingTop: Platform.OS === 'ios' ? 0 : 20,
  };

  if (scrollable) {
    return (
      <ScrollView
        style={containerStyle}
        contentContainerStyle={contentStyle}
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
    );
  }

  return (
    <View style={[containerStyle, contentStyle, { flex: 1 }]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});