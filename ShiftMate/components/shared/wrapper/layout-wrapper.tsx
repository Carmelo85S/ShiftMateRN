import { Colors } from "@/constants/theme";
import React from "react";
import {
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  useColorScheme,
  View,
  ViewStyle,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface ScreenWrapperProps {
  children: React.ReactNode;
  style?: ViewStyle;
  scrollable?: boolean;
  onRefresh?: () => void;
  refreshing?: boolean;
  extraPaddingBottom?: number; // 🌟 Nuova prop opzionale per gestire spazi extra (es. bottoni floating)
}

export const ScreenWrapper = ({
  children,
  style,
  scrollable = true,
  onRefresh,
  refreshing = false,
  extraPaddingBottom = 0,
}: ScreenWrapperProps) => {
  const insets = useSafeAreaInsets();
  const theme = Colors[useColorScheme() ?? "light"];

  const TAB_BAR_HEIGHT = 74 + 10 + insets.bottom;

  const containerStyle = [
    styles.container,
    { backgroundColor: theme.background },
    style,
  ];

  const contentStyle = {
    paddingBottom: TAB_BAR_HEIGHT + 20 + extraPaddingBottom,
    paddingTop: Platform.OS === "android" ? insets.top + 10 : 0,
  };

  if (scrollable) {
    return (
      <ScrollView
        style={containerStyle}
        contentContainerStyle={contentStyle}
        showsVerticalScrollIndicator={false}
        refreshControl={
          onRefresh ? (
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={theme.tint}
              colors={[theme.tint]}
            />
          ) : undefined
        }
      >
        {children}
      </ScrollView>
    );
  }

  return (
    <View
      style={[
        containerStyle,
        { flex: 1, paddingBottom: contentStyle.paddingBottom },
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
});
