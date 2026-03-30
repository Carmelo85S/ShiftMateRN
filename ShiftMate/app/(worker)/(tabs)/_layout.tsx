import { Tabs } from "expo-router";
import React from "react";
import { Platform, StyleSheet } from "react-native";
import { HapticTab } from "@/components/haptic-tab";
import { Colors } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons"; // Passiamo a Ionicons per coerenza con il resto del Worker

export default function TabLayout() {
  const theme = Colors.light;

  return (
    <Tabs
      screenOptions={{
        headerShown: false, 
        headerTitle: "",
        tabBarButton: HapticTab,
        tabBarActiveTintColor: theme.text,
        tabBarInactiveTintColor: "#999999",
        tabBarStyle: {
          backgroundColor: theme.background,
          borderTopWidth: 1,
          borderTopColor: theme.border,
          height: Platform.OS === 'ios' ? 88 : 68,
          paddingBottom: Platform.OS === 'ios' ? 30 : 12,
          paddingTop: 12,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "800",
          letterSpacing: 0.5,
          textTransform: 'uppercase', 
        },
      }}
    >
      <Tabs.Screen
        name="shifts"
        options={{
          title: "EXPLORE",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons 
              name={focused ? "briefcase-sharp" : "briefcase-outline"} 
              size={24} 
              color={color} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "ME",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons 
              name={focused ? "person-sharp" : "person-outline"} 
              size={24} 
              color={color} 
            />
          ),
        }}
      />
    </Tabs>
  );
}