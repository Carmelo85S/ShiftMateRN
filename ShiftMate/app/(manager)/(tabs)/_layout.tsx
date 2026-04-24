import { router, Tabs } from "expo-router";
import { IconSymbol } from "@/components/ui/icon-symbol"; 
import { Colors } from "@/constants/theme";
import { useState, useEffect } from "react"; // Aggiunto useEffect
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "@/lib/supabase";

export default function TabLayout() {
  const theme = Colors.light;
  const [unreadCount, setUnreadCount] = useState<number>(0);
  
  useEffect(() => {
    let channel: any;

    const fetchUnreadCount = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Conta le notifiche non lette e non archiviate
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('profile_id', user.id)
        .eq('is_read', false)
        .eq('is_archived', false);

      if (!error && count !== null) {
        setUnreadCount(count);
      }
    };

    // 1. Carica il count iniziale
    fetchUnreadCount();

    // 2. Setup Real-time per aggiornare il badge live
    const setupSubscription = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      channel = supabase
        .channel('tab-bar-notifications')
        .on(
          'postgres_changes',
          {
            event: '*', // Ascolta INSERT, UPDATE e DELETE
            schema: 'public',
            table: 'notifications',
            filter: `profile_id=eq.${user.id}`,
          },
          () => {
            fetchUnreadCount(); // Ricalcola il count ad ogni modifica
          }
        )
        .subscribe();
    };

    setupSubscription();

    // Cleanup alla chiusura
    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, []);

  return (
    <Tabs screenOptions={{ 
      headerShown: false,
      tabBarActiveTintColor: '#000' 
    }}>
      <Tabs.Screen 
        name="dashboard"
        options={{ 
          title: "Home", 
          tabBarIcon: ({color}) => <IconSymbol name="speedometer" color={color} /> 
        }} 
      />
      <Tabs.Screen
        name="shift"
        listeners={{
          tabPress: (e) => {
            e.preventDefault();
            router.replace("/shift");
          },
        }}
        options={{
          tabBarIcon: ({ color }) => (
            <IconSymbol name="calendar" color={color} />
          ),
        }}
      />
      
      <Tabs.Screen 
        name="createShift"
        options={{ 
          title: "Post", 
          tabBarIcon: ({color}) => <IconSymbol name="plus.circle" color={color} /> 
        }} 
      />
      <Tabs.Screen 
        name="profile"
        listeners={{
          tabPress: (e) => {
            e.preventDefault();
            router.replace("/profile")
          }
        }}
        options={{ 
          title: "Account",
          tabBarIcon: ({color}) => <IconSymbol name="person.fill" color={color} /> 
        }} 
      />
      <Tabs.Screen
        name="notifications/notificationsManager"
        options={{
          title: "ALERTS",
          // Mostra il badge solo se il count è > 0
          tabBarBadge: unreadCount > 0 ? unreadCount : undefined,
          tabBarBadgeStyle: {
            backgroundColor: "#FF3B30",
            color: "white",
            fontSize: 10,
            fontWeight: "bold",
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