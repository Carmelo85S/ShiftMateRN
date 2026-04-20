import React, { useState, useEffect, useCallback } from "react";
import { 
  View, 
  FlatList, 
  Text, 
  StyleSheet, 
  Pressable, 
  useColorScheme,
  ActivityIndicator,
  RefreshControl,
  Alert
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/theme";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { supabase } from "@/lib/supabase";
import { router, useFocusEffect } from "expo-router";

import { 
  archiveNotification, 
  fetchUserNotifications, 
  markAllNotificationsAsRead,
  markNotificationAsRead 
} from "@/queries/managerQueries";

export default function NotificationsScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];
  const insets = useSafeAreaInsets();

  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Load data
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

  // Real time updates with Supabase Realtime
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

  // 4. Render UI
  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.cardWrapper}>
      <Pressable 
        onPress={() => handleNotificationPress(item)}
        style={[
          styles.notificationCard, 
          { 
            backgroundColor: theme.card, 
            borderColor: theme.border,
            opacity: item.is_read ? 0.7 : 1,
          }
        ]}
      >
        <View style={[styles.iconContainer, { backgroundColor: getIconBg(item.type) }]}>
          <Ionicons name={getIconName(item.type)} size={22} color={getIconColor(item.type)} />
        </View>

        <View style={styles.textContainer}>
          <View style={styles.headerRow}>
            <Text style={[styles.notifTitle, { color: theme.text, fontWeight: item.is_read ? "600" : "800" }]} numberOfLines={1}>
              {item.title}
            </Text>
            <Text style={[styles.timeText, { color: theme.text + "60" }]}>
              {getTimeAgo(item.created_at)}
            </Text>
          </View>
          <Text style={[styles.message, { color: theme.text + "80" }]} numberOfLines={2}>
            {item.message}
          </Text>
        </View>

        {!item.is_read && <View style={[styles.unreadDot, { backgroundColor: theme.tint }]} />}
      </Pressable>

      <Pressable onPress={() => handleDeleteNotification(item.id)} style={styles.deleteButton}>
        <Ionicons name="close-outline" size={20} color={theme.text + "40"} />
      </Pressable>
    </View>
  );

  if (loading && !refreshing) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.tint} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[styles.list, { paddingTop: insets.top + 20 }]}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={() => { setRefreshing(true); fetchNotifications(); }} 
            tintColor={theme.tint}
          />
        }
        ListHeaderComponent={() => (
          <View style={styles.headerArea}>
            <Text style={[styles.screenTitle, { color: theme.text }]}>Notifications</Text>
            {notifications.some(n => !n.is_read) && (
              <Pressable onPress={handleMarkAllRead}> 
                <Text style={{ color: theme.tint, fontWeight: "700" }}>Mark all as read</Text>
              </Pressable>
            )}
          </View>
        )}
        renderItem={renderItem}
        ListEmptyComponent={() => (
          <View style={styles.emptyState}>
            <Ionicons name="notifications-off-outline" size={48} color={theme.text + "20"} />
            <Text style={{ color: theme.text + "40", marginTop: 10 }}>All caught up!</Text>
          </View>
        )}
      />
    </View>
  );
}

// --- HELPERS ---
const getIconName = (type: string) => {
  switch (type) {
    case "confirmation": return "checkmark-circle";
    case "rejection": return "close-circle";
    case "new_application": return "people";
    default: return "notifications";
  }
};

const getIconBg = (type: string) => {
  if (type === "confirmation") return "#4CAF5020";
  if (type === "rejection") return "#FF3B3020";
  if (type === "new_application") return "#007AFF20";
  return "#007AFF15";
};

const getIconColor = (type: string) => {
  if (type === "confirmation") return "#4CAF50";
  if (type === "rejection") return "#FF3B30";
  if (type === "new_application") return "#007AFF";
  return "#007AFF";
};

const getTimeAgo = (date: string) => {
  const diff = new Date().getTime() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return new Date(date).toLocaleDateString();
};

// --- STYLES ---
const styles = StyleSheet.create({
  list: { paddingHorizontal: 20, paddingBottom: 100 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerArea: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 },
  screenTitle: { fontSize: 32, fontWeight: "900", letterSpacing: -1 },
  cardWrapper: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  notificationCard: { flex: 1, flexDirection: 'row', padding: 16, borderRadius: 24, alignItems: 'center', borderWidth: 1 },
  deleteButton: { padding: 10, marginLeft: 5 },
  textContainer: { flex: 1, marginLeft: 12 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between' },
  notifTitle: { fontSize: 16 },
  timeText: { fontSize: 11 },
  message: { fontSize: 14, marginTop: 2 },
  iconContainer: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  unreadDot: { width: 10, height: 10, borderRadius: 5, marginLeft: 10 },
  emptyState: { alignItems: 'center', marginTop: 100, opacity: 0.8 }
});