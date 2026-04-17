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

// --- IMPORT QUERIES ---
import { 
  fetchWorkerNotifications, 
  markNotificationAsRead, 
  markAllNotificationsAsRead, 
  archiveNotification 
} from "@/queries/workerQueries";

export default function NotificationsScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];
  const insets = useSafeAreaInsets();

  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // 1. Caricamento dati iniziale tramite query esterna
  const loadNotifications = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const data = await fetchWorkerNotifications(user.id);
      setNotifications(data);
    } catch (error) {
      console.error("Error loading notifications:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadNotifications();
    }, [])
  );

  // 2. Realtime (Resta qui perché gestisce lo stato locale reattivo)
  useEffect(() => {
    let channel: any;

    const setupRealtime = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      channel = supabase
        .channel('db-notifications')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `profile_id=eq.${user.id}`,
          },
          (payload) => {
            setNotifications((current) => [payload.new, ...current]);
          }
        )
        .subscribe();
    };

    setupRealtime();
    return () => { if (channel) supabase.removeChannel(channel); };
  }, []);

  // 3. Handlers rifattorizzati
  const handleMarkAsRead = async (id: string) => {
    try {
      await markNotificationAsRead(id);
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, is_read: true } : n)
      );
    } catch (error) {
      console.error("Errore aggiornamento badge:", error);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await markAllNotificationsAsRead(user.id);
      loadNotifications();
    } catch (error) {
      console.error("Errore mark all as read:", error);
    }
  };

  const handleDeleteNotification = async (id: string) => {
    try {
      await archiveNotification(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Could not remove notification.");
    }
  };

  const handleNotificationPress = async (item: any) => {
    if (!item) return;
    
    await handleMarkAsRead(item.id);

    // Navigazione logica basata sul tipo
    if (item.shift_id && ["confirmation", "reminder", "invitation"].includes(item.type)) {
      router.push({ 
        pathname: "/(worker)/shift/[id]", 
        params: { id: item.shift_id } 
      });
    } else if (item.type === "rejection") {
      router.push("/(worker)/(tabs)/shifts");
    }
  };

  // Helper per il tempo
  const getTimeAgo = (date: string) => {
    const diffInMs = new Date().getTime() - new Date(date).getTime();
    const diffInMins = Math.floor(diffInMs / 60000);
    const diffInHours = Math.floor(diffInMins / 60);

    if (diffInMins < 1) return 'Now';
    if (diffInMins < 60) return `${diffInMins}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

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
            flex: 1, 
          }
        ]}
      >
        <View style={[styles.iconContainer, { backgroundColor: getIconBg(item.type, theme) }]}>
          <Ionicons 
            name={getIconName(item.type)} 
            size={22} 
            color={getIconColor(item.type, theme)} 
          />
        </View>

        <View style={styles.textContainer}>
          <View style={styles.headerRow}>
            <Text 
              style={[
                styles.notifTitle, 
                { color: theme.text, fontWeight: item.is_read ? "600" : "800" }
              ]}
              numberOfLines={1}
            >
              {item.title}
            </Text>
            <Text style={[styles.timeText, { color: theme.text + "60" }]}>
              {getTimeAgo(item.created_at)}
            </Text>
          </View>
          <Text 
            style={[styles.message, { color: theme.text + "80" }]} 
            numberOfLines={2}
          >
            {item.message}
          </Text>
        </View>

        {!item.is_read && (
          <View style={[styles.unreadDot, { backgroundColor: theme.tint }]} />
        )}
      </Pressable>

      <Pressable 
        onPress={() => {
          Alert.alert(
            "Delete Notification",
            "Are you sure you want to remove this notification?",
            [
              { text: "Cancel", style: "cancel" },
              { text: "Delete", style: "destructive", onPress: () => handleDeleteNotification(item.id) }
            ]
          );
        }}
        style={styles.deleteButton}
      >
        <Ionicons name="close-outline" size={20} color={theme.text + "40"} />
      </Pressable>
    </View>
  );

  if (loading) return (
    <View style={[styles.center, { backgroundColor: theme.background }]}>
      <ActivityIndicator color={theme.tint} />
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[styles.list, { paddingTop: insets.top + 20 }]}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={() => { setRefreshing(true); loadNotifications(); }} 
            tintColor={theme.tint}
          />
        }
        ListHeaderComponent={() => (
          <View style={styles.headerArea}>
            <Text style={[styles.screenTitle, { color: theme.text }]}>Notifications</Text>
            {notifications.some(n => !n.is_read) && (
              <Pressable onPress={handleMarkAllRead} style={{ padding: 8 }}> 
                <Text style={{ color: theme.tint, fontWeight: "600" }}>Mark all as read</Text>
              </Pressable>
            )}
          </View>
        )}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Ionicons name="notifications-off-outline" size={48} color={theme.text + "20"} />
            <Text style={{ color: theme.text, opacity: 0.4, marginTop: 12 }}>No notifications yet</Text>
          </View>
        )}
        renderItem={renderItem}
      />
    </View>
  );
}

// Helpers grafici
const getIconName = (type: string) => {
  switch (type) {
    case "confirmation": return "checkmark-circle-outline";
    case "rejection": return "close-circle-outline";
    case "invitation": return "mail-outline";
    default: return "notifications-outline";
  }
};

const getIconBg = (type: string, theme: any) => {
  switch (type) {
    case "confirmation": return "#4CAF5020";
    case "rejection": return "#FF3B3020";
    default: return theme.tint + "15";
  }
};

const getIconColor = (type: string, theme: any) => {
  switch (type) {
    case "confirmation": return "#4CAF50";
    case "rejection": return "#FF3B30";
    default: return theme.tint;
  }
};

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  list: { paddingHorizontal: 20, paddingBottom: 100 },
  headerArea: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 25 },
  screenTitle: { fontSize: 28, fontWeight: "800", letterSpacing: -0.5 },
  cardWrapper: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 8 },
  notificationCard: { flexDirection: 'row', padding: 16, borderRadius: 24, alignItems: 'center', shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 12, elevation: 3, borderWidth: 1 },
  deleteButton: { padding: 8, justifyContent: 'center', alignItems: 'center' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 },
  notifTitle: { fontSize: 15, flex: 1, marginRight: 8 },
  timeText: { fontSize: 10, fontWeight: "600", textTransform: 'uppercase' },
  unreadDot: { width: 10, height: 10, borderRadius: 5, marginLeft: 12 },
  iconContainer: { width: 48, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  textContainer: { flex: 1, marginLeft: 14, gap: 2 },
  message: { fontSize: 14, lineHeight: 20 },
  emptyContainer: { alignItems: 'center', marginTop: 100 }
});