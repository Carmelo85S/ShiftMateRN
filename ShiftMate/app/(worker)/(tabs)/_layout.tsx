import { Tabs, useRouter } from "expo-router";
import React, { useEffect, useState, useCallback } from "react";
import { Platform, Alert } from "react-native";
import { HapticTab } from "@/components/haptic-tab";
import { Colors } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "@/lib/supabase";
import { fetchUnreadNotificationCount, subscribeToNotifications } from "@/queries/workerLayoutQueries";


export default function TabLayout() {
  const theme = Colors.light;
  const router = useRouter();
  const [unreadCount, setUnreadCount] = useState<number | null>(null);
  const [isGuest, setIsGuest] = useState(true);

  // fetch badge count function
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

      // Initial auth state check
      handleAuthState(session);

      // Listen for auth changes
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

  // ProtectedTab Component
  const ProtectedTab = (props: any, isProtected: boolean) => (
    <HapticTab
      {...props}
      onPress={(e) => {
        if (isGuest && isProtected) {
          Alert.alert(
            "Join our community",
            "Create an account to track your applications and manage your profile.",
            [
              { text: "Later", style: "cancel" },
              { text: "Sign Up", onPress: () => router.push("/") }
            ]
          );
        } else {
          props.onPress?.(e);
        }
      }}
    />
  );

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
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
        tabBarLabelStyle: { fontSize: 10, fontWeight: "800", textTransform: 'uppercase' },
      }}
    >
      <Tabs.Screen
        name="shifts"
        options={{
          title: "EXPLORE",
          tabBarButton: (props) => ProtectedTab(props, false),
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "briefcase-sharp" : "briefcase-outline"} size={24} color={color} />
          ),
        }}
      />
      
      <Tabs.Screen
        name="profile"
        options={{
          title: "ME",
          tabBarButton: (props) => ProtectedTab(props, true),
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
          tabBarButton: (props) => ProtectedTab(props, true),
          tabBarBadgeStyle: { backgroundColor: "#FF3B30", color: "white", fontSize: 10, fontWeight: "bold" },
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "notifications-sharp" : "notifications-outline"} size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}