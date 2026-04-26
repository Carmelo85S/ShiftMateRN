import { supabase } from "@/lib/supabase";
import { archiveNotification, fetchUserNotifications, markAllNotificationsAsRead, markNotificationAsRead } from "@/queries/managerQueries";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Alert } from "react-native";

export const useHandleNotifications = () => {
    const [notifications, setNotifications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
      
    const fetchNotifications = useCallback(async () => {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) return;

          const data = await fetchUserNotifications(user.id);
          setNotifications(data || []);
        } catch (error) {
          console.error("Fetch error:", error);
        } finally {
          setLoading(false);
          setRefreshing(false);
        }
    }, []);

useEffect(() => {
    let channel: any;

    const setupRealtime = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Listen for changes on the 'notifications' table only for this user
      channel = supabase
        .channel(`user-notifications-${user.id}`)
        .on(
          'postgres_changes', 
          { 
            event: '*', 
            schema: 'public', 
            table: 'notifications', 
            filter: `profile_id=eq.${user.id}` 
          }, 
          () => {
            // When something happens in the DB, refresh the list
            fetchNotifications();
          }
        )
        .subscribe();
    };

    setupRealtime();

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [fetchNotifications]);

  // Reload when the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchNotifications();
    }, [fetchNotifications])
  );

  // Handle delete and mark as read
  const handleDeleteNotification = async (id: string) => {
    try {
      await archiveNotification(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch (err) {
      Alert.alert("Error", "Could not remove notification.");
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      await markAllNotificationsAsRead(user.id);
      fetchNotifications();
    } catch (error) {
      Alert.alert("Error", "Failed to mark all as read");
    }
  };

  const handleNotificationPress = async (item: any) => {
    if (!item.is_read) {
      try {
        await markNotificationAsRead(item.id);
        setNotifications(prev => 
          prev.map(n => n.id === item.id ? { ...n, is_read: true } : n)
        );
      } catch (err) {
        console.error(err);
      }
    }

    if (item.shift_id) {
      router.push({ 
        pathname: "/(manager)/(tabs)/shift/[id]", 
        params: { id: item.shift_id } 
      });
    }
  };
  return {
    notifications,
    loading,
    refreshing,
    setRefreshing,
    fetchNotifications,
    handleDeleteNotification,
    handleMarkAllRead,
    handleNotificationPress,
    unreadCount: notifications.filter(n => !n.is_read).length // Extra molto utile!
  };
}

