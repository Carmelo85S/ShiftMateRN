import React, { useState, useEffect } from "react";
import { View, Pressable, StyleSheet, Text, Dimensions, Platform } from "react-native";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { supabase } from "@/lib/supabase";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "react-native";

const { width } = Dimensions.get("window");

// --- 1. COMPONENTE ORBIT TAB BAR (VERSIONE SOLID) ---
function OrbitTabBar({ state, descriptors, navigation, badgeCount, theme }: any) {
  const insets = useSafeAreaInsets();
  
  // Altezza totale della zona bar (padding + altezza isola)
  const BAR_ZONE_HEIGHT = insets.bottom + 85;

  return (
    <View style={styles.masterWrapper}>
      {/* BASE SOLIDA: Questo blocco ha lo stesso colore dello sfondo 
          e impedisce di vedere il contenuto della pagina sotto la barra.
      */}
      <View style={[
        styles.solidBase, 
        { 
          backgroundColor: theme.background, 
          height: BAR_ZONE_HEIGHT 
        }
      ]} />

      <View style={[styles.contentWrapper, { bottom: insets.bottom + 10 }]}>
        <View style={[styles.island, { backgroundColor: theme.card, borderColor: theme.border }]}>
          {state.routes.map((route: any, index: number) => {
            const isFocused = state.index === index;
            const isCenter = route.name === "createShift";

            const onPress = () => {
              const event = navigation.emit({ type: "tabPress", target: route.key, canPreventDefault: true });
              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            };

            const getIcon = (name: string): any => {
              const map: any = {
                dashboard: "grid-sharp",
                shift: "receipt-sharp",
                createShift: "add",
                profile: "person-sharp",
                'notifications/notificationsManager': "notifications-sharp",
              };
              return map[name] || "ellipse";
            };

            if (isCenter) {
              return (
                <View key={index} style={[styles.centerOuter, { backgroundColor: theme.background }]}>
                  <Pressable 
                    onPress={onPress} 
                    style={[styles.centerButton, { backgroundColor: theme.tint }]}
                  >
                    <Ionicons name="add" size={34} color="#FFF" />
                  </Pressable>
                </View>
              );
            }

            return (
              <Pressable key={index} onPress={onPress} style={styles.tabItem}>
                <Ionicons
                  name={getIcon(route.name)}
                  size={24}
                  color={isFocused ? theme.text : theme.secondaryText + "80"}
                />
                {isFocused && <View style={[styles.activeIndicator, { backgroundColor: theme.tint }]} />}
                
                {route.name.includes("notifications") && badgeCount > 0 && (
                  <View style={[styles.orbitBadge, { backgroundColor: theme.delete }]}>
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

// --- 2. LAYOUT PRINCIPALE ---
export default function TabLayout() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchCount = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { count } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .match({ profile_id: user.id, is_read: false, is_archived: false });
      setUnreadCount(count || 0);
    };
    fetchCount();
    const channel = supabase.channel('orbit-v3').on('postgres_changes', { event: '*', schema: 'public', table: 'notifications' }, fetchCount).subscribe();
    return () => { if (channel) supabase.removeChannel(channel); };
  }, []);

  return (
    <Tabs 
      tabBar={(props) => <OrbitTabBar {...props} badgeCount={unreadCount} theme={theme} />} 
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="dashboard" />
      <Tabs.Screen name="shift" />
      <Tabs.Screen name="createShift" />
      <Tabs.Screen name="profile" />
      <Tabs.Screen name="notifications/notificationsManager" />
    </Tabs>
  );
}

// --- 3. STILI ---
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
    // Senza ombre per un taglio netto col contenuto
  },
  contentWrapper: {
    alignItems: "center",
    justifyContent: "center",
  },
  island: {
    flexDirection: "row",
    width: width * 0.9,
    height: 74,
    borderRadius: 37,
    alignItems: "center",
    justifyContent: "space-around",
    paddingHorizontal: 15,
    borderWidth: 1,
    // Ombra per dare l'effetto fluttuante sopra la base solida
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
  centerOuter: {
    marginTop: -45, 
    padding: 7,
    borderRadius: 45,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  centerButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  activeIndicator: {
    position: "absolute",
    bottom: 12,
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  orbitBadge: {
    position: "absolute",
    top: 18,
    right: 12,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FFF",
    paddingHorizontal: 2,
  },
  orbitBadgeText: {
    color: "#FFF",
    fontSize: 9,
    fontWeight: "900",
  }
});