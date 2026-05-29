import React from "react";
import { View, Pressable, StyleSheet, Text, Dimensions } from "react-native";
import { Tabs, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "react-native";
import { CommonActions } from '@react-navigation/native';
import { useDashboardData } from "@/hooks/manager/useFetchDataDashboard"; 

const { width } = Dimensions.get("window");

function OrbitTabBar({ state, descriptors, navigation, theme }: any) {
  const insets = useSafeAreaInsets();
  const router = useRouter(); 
  const BAR_ZONE_HEIGHT = insets.bottom + 85;
  
  // Recuperiamo il tipo di business corrente dall'hook globale
  const { businessType } = useDashboardData();

  return (
    <View style={styles.masterWrapper}>
      {/* Sfondo solido della Tab Bar */}
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
            const isCenter = route.name === "create";

            const onPress = () => {
              const event = navigation.emit({ 
                type: "tabPress", 
                target: route.key, 
                canPreventDefault: true 
              });

              if (!event.defaultPrevented) {
                // GESTIONE BIVIO TASTO "+" CENTRALE
                if (isCenter) {
                  if (businessType === "staffing") {
                    router.push("/(manager)/(tabs)/create/createShift");
                  } else {
                    navigation.dispatch(
                      CommonActions.reset({
                        index: 0,
                        routes: [{ name: route.name }],
                      })
                    );
                  }
                  return; 
                }

                // Navigazione nativa resettata per mantenere la cronologia pulita
                navigation.dispatch(
                  CommonActions.reset({
                    index: 0,
                    routes: [{ name: route.name }],
                  })
                );
              }
            };

            // 🌟 MAPPATURA ICONE CORRETTA E AGGIORNATA
            const getIcon = (name: string): any => {
              const map: any = {
                dashboard: "grid-sharp",
                shift: "receipt-sharp",
                create: "add",
                profile: "person-sharp",
                "reports/analytics": "bar-chart-sharp", 
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

  return (
    <Tabs 
      tabBar={(props) => <OrbitTabBar {...props} theme={theme} />} 
      screenOptions={{ 
        headerShown: false,
      }}
    >
      <Tabs.Screen name="dashboard" />
      <Tabs.Screen name="shift" />
      <Tabs.Screen name="create" />
      <Tabs.Screen name="profile" />
      <Tabs.Screen name="reports/analytics" />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  masterWrapper: { position: "absolute", bottom: 0, left: 0, right: 0, width: width },
  solidBase: { position: "absolute", bottom: 0, left: 0, right: 0 },
  contentWrapper: { alignItems: "center", justifyContent: "center" },
  island: { flexDirection: "row", width: width * 0.9, height: 74, borderRadius: 37, alignItems: "center", justifyContent: "space-around", paddingHorizontal: 15, borderWidth: 1, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 5 },
  tabItem: { flex: 1, alignItems: "center", justifyContent: "center", height: "100%" },
  centerOuter: { marginTop: -45, padding: 7, borderRadius: 45, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 8 },
  centerButton: { width: 64, height: 64, borderRadius: 32, justifyContent: "center", alignItems: "center" },
  activeIndicator: { position: "absolute", bottom: 12, width: 5, height: 5, borderRadius: 2.5 },
});