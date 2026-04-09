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

export default function NotificationsScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];
  const insets = useSafeAreaInsets();

  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // 1. Carica le notifiche vere dalla tabella 'notifications'
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.error("DEBUG: No user logged in");
        return;
      }

      console.log("DEBUG: Fetching for user ID:", user.id);

      const { data, error, status } = await supabase
        .from('notifications')
        .select('*')
        .eq('profile_id', user.id)
        .eq("is_archived", false);

      if (error) {
        console.error("DEBUG: Supabase Error:", error.message);
        console.error("DEBUG: Status Code:", status);
      } else {
        console.log("DEBUG: Data received from DB:", data);
        setNotifications(data || []);
      }
    } catch (error) {
      console.error("DEBUG: Catch Error:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // 2. Archiviazione (Sempre su notifications)
  const handleDeleteNotification = async (id: string) => {
    try {
      const { error } = await supabase
        .from("notifications")
        .update({ is_archived: true })
        .eq("id", id);

      if (error) throw error;
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch (err) {
      Alert.alert("Error", "Could not remove notification.");
    }
  };

  // 3. Segna come letto
  const markAsRead = async (id: string) => {
    try {
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id);
      
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, is_read: true } : n)
      );
    } catch (error) {
      console.error("Mark read error:", error);
    }
  };

  // Real-time listener: aggiorna la lista se arriva un nuovo messaggio
  useEffect(() => {
    let channel: any;
    const setupRealtime = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      channel = supabase
        .channel('notif-updates')
        .on('postgres_changes', { 
          event: '*', 
          schema: 'public', 
          table: 'notifications', 
          filter: `profile_id=eq.${user.id}` 
        }, () => fetchNotifications())
        .subscribe();
    };
    setupRealtime();
    return () => { if (channel) supabase.removeChannel(channel); };
  }, []);

  useFocusEffect(useCallback(() => { fetchNotifications(); }, []));

  const handleNotificationPress = async (item: any) => {
    if (!item.is_read) await markAsRead(item.id);

    if (item.shift_id) {
      // Naviga alla gestione dello shift lato MANAGER
      // Assicurati che il path esista, ad esempio: app/(manager)/(tabs)/shift/[id].tsx
      router.push({ 
        pathname: "/(manager)/(tabs)/shift/[id]", 
        params: { id: item.shift_id } 
      });
    }
  };

  // ... (Resto del codice renderItem, helpers e styles rimane uguale a quello che avevi)
  
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

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[styles.list, { paddingTop: insets.top + 20 }]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchNotifications(); }} />}
        ListHeaderComponent={() => (
          <View style={styles.headerArea}>
            <Text style={[styles.screenTitle, { color: theme.text }]}>Notifications</Text>
            {notifications.some(n => !n.is_read) && (
              <Pressable onPress={() => {
                const markAll = async () => {
                    const { data: { user } } = await supabase.auth.getUser();
                    await supabase.from('notifications').update({ is_read: true }).eq('profile_id', user?.id);
                    fetchNotifications();
                };
                markAll();
              }}> 
                <Text style={{ color: theme.tint, fontWeight: "700" }}>Mark all as read</Text>
              </Pressable>
            )}
          </View>
        )}
        renderItem={renderItem}
      />
    </View>
  );
}

// Helpers (getIconName, getIconBg, etc. rimangono invariati)
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
  
  const styles = StyleSheet.create({
    list: { paddingHorizontal: 20, paddingBottom: 100 },
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
    unreadDot: { width: 10, height: 10, borderRadius: 5, marginLeft: 10 }
  });