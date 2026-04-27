import React from "react";
import { View, Pressable, Text, StyleSheet, Dimensions, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";

const { width } = Dimensions.get("window");

export const OrbitTabBar = ({ state, descriptors, navigation, badgeCount, theme, isGuest, router }: any) => {
  const insets = useSafeAreaInsets();
  const BAR_ZONE_HEIGHT = insets.bottom + 85;

  const getIcon = (name: string, focused: boolean): keyof typeof Ionicons.glyphMap => {
    const map: Record<string, any> = {
      shifts: focused ? "briefcase-sharp" : "briefcase-outline",
      profile: focused ? "person-sharp" : "person-outline",
      notifications: focused ? "notifications-sharp" : "notifications-outline",
    };
    return map[name] || "circle";
  };

  return (
    <View style={styles.masterWrapper}>
      <View style={[styles.solidBase, { backgroundColor: theme.background, height: BAR_ZONE_HEIGHT }]} />

      <View style={[styles.contentWrapper, { bottom: insets.bottom + 10 }]}>
        <View style={[styles.island, { backgroundColor: theme.card, borderColor: theme.border }]}>
          {state.routes.map((route: any, index: number) => {
            const { options } = descriptors[route.key];
            const isFocused = state.index === index;
            const isProtected = route.name === "profile" || route.name === "notifications";

            const onPress = () => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

              if (isGuest && isProtected) {
                Alert.alert("Join our community", "Create an account to track applications.", [
                  { text: "Later", style: "cancel" },
                  { text: "Sign Up", onPress: () => router.push("/") }
                ]);
                return;
              }

              const event = navigation.emit({ type: "tabPress", target: route.key, canPreventDefault: true });
              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            };

            return (
              <Pressable key={index} onPress={onPress} style={styles.tabItem}>
                <Ionicons
                  name={getIcon(route.name, isFocused)}
                  size={24}
                  color={isFocused ? theme.text : theme.secondaryText + "80"}
                />
                {isFocused && <View style={[styles.activeIndicator, { backgroundColor: theme.tint }]} />}
                {route.name === "notifications" && badgeCount > 0 && (
                  <View style={[styles.orbitBadge, { backgroundColor: "#FF3B30" }]}>
                    <Text style={styles.orbitBadgeText}>{badgeCount}</Text>
                  </View>
                )}
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  masterWrapper: { position: "absolute", bottom: 0, left: 0, right: 0, width },
  solidBase: { position: "absolute", bottom: 0, left: 0, right: 0 },
  contentWrapper: { alignItems: "center", justifyContent: "center" },
  island: { flexDirection: "row", width: width * 0.8, height: 70, borderRadius: 35, alignItems: "center", justifyContent: "space-around", paddingHorizontal: 20, borderWidth: 1, elevation: 5, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10 },
  tabItem: { flex: 1, alignItems: "center", justifyContent: "center", height: "100%" },
  activeIndicator: { position: "absolute", bottom: 12, width: 4, height: 4, borderRadius: 2 },
  orbitBadge: { position: "absolute", top: 15, right: 15, minWidth: 18, height: 18, borderRadius: 9, justifyContent: "center", alignItems: "center", borderWidth: 2, borderColor: "#FFF" },
  orbitBadgeText: { color: "#FFF", fontSize: 9, fontWeight: "900" }
});