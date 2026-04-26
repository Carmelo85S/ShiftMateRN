import React from "react";
import { 
  View, 
  StyleSheet, 
  ScrollView, 
  ViewStyle, 
  Platform, 
  RefreshControl 
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColorScheme } from "react-native";
import { Colors } from "@/constants/theme";

interface ScreenWrapperProps {
  children: React.ReactNode;
  style?: ViewStyle;
  scrollable?: boolean;
  onRefresh?: () => void;
  refreshing?: boolean;
}

export const ScreenWrapper = ({ 
  children, 
  style, 
  scrollable = true, 
  onRefresh,
  refreshing = false
}: ScreenWrapperProps) => {
  const insets = useSafeAreaInsets();
  const theme = Colors[useColorScheme() ?? "light"];

  const TAB_BAR_HEIGHT = 74 + 10 + insets.bottom;

  const containerStyle = [
    styles.container,
    { backgroundColor: theme.background },
    style
  ];

  const contentStyle = {
    paddingBottom: TAB_BAR_HEIGHT + 20, 
    paddingTop: Platform.OS === 'android' ? insets.top + 10 : 0, 
  };

  if (scrollable) {
    return (
      <ScrollView
        style={containerStyle}
        contentContainerStyle={contentStyle}
        showsVerticalScrollIndicator={false}
        // Il RefreshControl è ora gestito internamente
        refreshControl={
          onRefresh ? (
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={onRefresh} 
              tintColor={theme.tint} // Colore rotellina iOS
              colors={[theme.tint]}  // Colore rotellina Android
            />
          ) : undefined
        }
      >
        {children}
      </ScrollView>
    );
  }

  return (
    <View style={[containerStyle, { flex: 1, paddingBottom: contentStyle.paddingBottom }]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
});