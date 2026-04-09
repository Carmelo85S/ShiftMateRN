import { Tabs } from "expo-router";
import React, { useEffect, useState } from "react";
import { Platform } from "react-native";
import { HapticTab } from "@/components/haptic-tab";
import { Colors } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "@/lib/supabase"; // Importa supabase

export default function TabLayout() {
  const theme = Colors.light;
  const [unreadCount, setUnreadCount] = useState<number | null>(null);

  // Funzione per contare le notifiche non lette
  const fetchUnreadCount = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('profile_id', user.id)
      .eq('is_read', false);

    if (!error) setUnreadCount(count && count > 0 ? count : null);
  };

  useEffect(() => {
    let channel: any;

    const listen = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      fetchUnreadCount();

      channel = supabase
        .channel('tab-badge-changes')
        .on(
          'postgres_changes',
          { 
            event: '*', 
            schema: 'public', 
            table: 'notifications',
            filter: `profile_id=eq.${user.id}` 
          },
          (payload) => {
            console.log("Change detected in tab layout!", payload);
            fetchUnreadCount(); // Ricalcola il badge
          }
        )
        .subscribe((status) => {
          console.log("Realtime status in Tabs:", status);
        });
    };

    listen();
    return () => { if (channel) supabase.removeChannel(channel); };
  }, []);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
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
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "800",
          textTransform: 'uppercase',
        },
      }}
    >
      <Tabs.Screen
        name="shifts"
        options={{
          title: "EXPLORE",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "briefcase-sharp" : "briefcase-outline"} size={24} color={color} />
          ),
        }}
      />
      
      <Tabs.Screen
        name="profile"
        options={{
          title: "ME",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "person-sharp" : "person-outline"} size={24} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="notifications"
        options={{
          title: "ALERTS",
          tabBarBadge: unreadCount ?? undefined,
          tabBarBadgeStyle: {
            backgroundColor: "#FF3B30",
            color: "white",
            fontSize: 10,
            fontWeight: "bold",
            lineHeight: 15,
          },
          tabBarIcon: ({ color, focused }) => (
            <Ionicons 
              name={focused ? "notifications-sharp" : "notifications-outline"} 
              size={24} 
              color={color} 
            />
          ),
        }}
      />
    </Tabs>
  );
}