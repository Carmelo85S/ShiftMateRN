import { supabase } from "@/lib/supabase";
import { 
  archiveNotification, 
  fetchUserNotifications, 
  markAllNotificationsAsRead, 
  markNotificationAsRead 
} from "@/queries/managerQueries";
import { useRouter, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Alert } from "react-native";

export const useHandleNotifications = () => {
  const router = useRouter();
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

  // --- LOGICA REFRESH PER SCREENWRAPPER / FLATLIST ---
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchNotifications();
  }, [fetchNotifications]);

  useEffect(() => {
    let channel: any;

    const setupRealtime = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

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

  useFocusEffect(
    useCallback(() => {
      fetchNotifications();
    }, [fetchNotifications])
  );

  const handleDeleteNotification = async (id: string) => {
    try {
      // Ottimismo: rimuoviamo subito dalla UI
      const previousNotifications = [...notifications];
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      
      await archiveNotification(id);
    } catch (err) {
      Alert.alert("Error", "Could not remove notification.");
      fetchNotifications(); // Rollback in caso di errore
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      await markAllNotificationsAsRead(user.id);
      // Aggiorniamo localmente per istantaneità
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
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

    // Navigazione specifica basata sul tipo di notifica
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
    onRefresh, // Esposto per il pull-to-refresh
    fetchNotifications,
    handleDeleteNotification,
    handleMarkAllRead,
    handleNotificationPress,
    unreadCount: notifications.filter(n => !n.is_read).length
  };
};