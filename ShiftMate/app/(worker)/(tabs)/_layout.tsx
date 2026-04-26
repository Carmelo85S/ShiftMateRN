import React, { useEffect, useState, useCallback } from "react";
import { View, Pressable, StyleSheet, Text, Dimensions, Platform, Alert, useColorScheme } from "react-native";
import { Tabs, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";

import { supabase } from "@/lib/supabase";
import { Colors } from "@/constants/theme";
import { fetchUnreadNotificationCount, subscribeToNotifications } from "@/queries/workerLayoutQueries";

const { width } = Dimensions.get("window");

// --- 1. CUSTOM TAB BAR COMPONENT ---
function OrbitTabBar({ state, descriptors, navigation, badgeCount, theme, isGuest, router }: any) {
  const insets = useSafeAreaInsets();
  const BAR_ZONE_HEIGHT = insets.bottom + 85;

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
              // Haptic Feedback
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

              if (isGuest && isProtected) {
                Alert.alert(
                  "Join our community",
                  "Create an account to track your applications and manage your profile.",
                  [
                    { text: "Later", style: "cancel" },
                    { text: "Sign Up", onPress: () => router.push("/") }
                  ]
                );
                return;
              }

              const event = navigation.emit({ type: "tabPress", target: route.key, canPreventDefault: true });
              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            };

            const getIcon = (name: string, focused: boolean): any => {
              const map: any = {
                shifts: focused ? "briefcase-sharp" : "briefcase-outline",
                profile: focused ? "person-sharp" : "person-outline",
                notifications: focused ? "notifications-sharp" : "notifications-outline",
              };
              return map[name] || "ellipse";
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
}

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];
  const router = useRouter();
  
  const [unreadCount, setUnreadCount] = useState<number | null>(null);
  const [isGuest, setIsGuest] = useState(true);

  const loadBadge = useCallback(async (userId: string) => {
    const count = await fetchUnreadNotificationCount(userId);
    setUnreadCount(count > 0 ? count : null);
  }, []);

  useEffect(() => {
    let channel: any;

    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      const handleAuthState = (currentSession: any) => {
        const user = currentSession?.user;
        setIsGuest(!currentSession);

        if (user) {
          loadBadge(user.id);
          channel = subscribeToNotifications(user.id, () => loadBadge(user.id));
        } else {
          setUnreadCount(null);
          if (channel) supabase.removeChannel(channel);
        }
      };

      handleAuthState(session);

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
        handleAuthState(newSession);
      });

      return subscription;
    };

    const authSub = init();

    return () => {
      if (channel) supabase.removeChannel(channel);
      authSub.then(sub => sub?.unsubscribe());
    };
  }, [loadBadge]);

  return (
    <Tabs
      tabBar={(props) => (
        <OrbitTabBar 
          {...props} 
          badgeCount={unreadCount} 
          theme={theme} 
          isGuest={isGuest} 
          router={router} 
        />
      )}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="shifts" options={{ title: "Explore" }} />
      <Tabs.Screen name="profile" options={{ title: "Me" }} />
      <Tabs.Screen name="notifications" options={{ title: "Alerts" }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  masterWrapper: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    width: width,
  },
  solidBase: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  contentWrapper: {
    alignItems: "center",
    justifyContent: "center",
  },
  island: {
    flexDirection: "row",
    width: width * 0.8, // Leggermente più stretta perché sono solo 3 icone
    height: 70,
    borderRadius: 35,
    alignItems: "center",
    justifyContent: "space-around",
    paddingHorizontal: 20,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
  },
  activeIndicator: {
    position: "absolute",
    bottom: 12,
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  orbitBadge: {
    position: "absolute",
    top: 15,
    right: 15,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FFF",
  },
  orbitBadgeText: {
    color: "#FFF",
    fontSize: 9,
    fontWeight: "900",
  }
});