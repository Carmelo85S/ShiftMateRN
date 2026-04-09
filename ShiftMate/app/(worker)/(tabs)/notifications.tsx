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

  // Fetch data
  const fetchNotifications = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('profile_id', user.id)
        .eq("is_archived", false)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotifications(data || []);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  //Delete old notifications (optional, for cleanup)
  const handleDeleteNotification = async (id: string) => {
  try {
    // 1. Aggiornamento sul Database
    const { error } = await supabase
      .from("notifications")
      .update({ is_archived: true })
      .eq("id", id);

    if (error) throw error;

    // 2. Aggiornamento UI ottimistico (rimuovi subito dalla lista locale)
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    
  } catch (err) {
    console.error(err);
    Alert.alert("Error", "Could not remove notification.");
  }
};
  // Load data when screen is focused
  useFocusEffect(
    useCallback(() => {
      fetchNotifications();
    }, [])
  );

  // Real time updates with Supabase Realtime
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

  // Mark as read
  const markAsRead = async (id: string) => {
    try {
      // 1. Aggiorna Supabase (questo scatena il Realtime nel TabLayout)
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id);
      
      if (error) throw error;

      // 2. Aggiorna lo stato locale per il feedback visivo immediato
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, is_read: true } : n)
      );
    } catch (error) {
      console.error("Errore aggiornamento badge:", error);
    }
  };

  const markAllAsRead = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('profile_id', user.id)
      .eq('is_read', false);
    
    fetchNotifications();
  };

  const handleNotificationPress = async (item: any) => {
  if (!item) return;
  
  console.log("🔔 Notifica premuta:", item.type);
  
  // 1. Segna come letta
  await markAsRead(item.id);

  // 2. Navigazione logica
  switch (item.type) {
    case "confirmation":
    case "reminder":
    case "invitation":
      if (item.shift_id) {
        console.log("➡️ Navigo al dettaglio dello shift:", item.shift_id);
        // Se il file è in app/(worker)/shift/[id].tsx, usa questo path:
        router.push({ 
          pathname: "/(worker)/shift/[id]", 
          params: { id: item.shift_id } 
        });
      }
      break;

      case "rejection":
        console.log("➡️ Rifiutato: Navigo alla lista turni");
        router.push("/(worker)/(tabs)/shifts");
        break;
      
      default:
        console.log("ℹ️ Nessuna azione per questo tipo");
        break;
    }
  };

  // Helper time formatting function
  const getTimeAgo = (date: string) => {
    const now = new Date();
    const past = new Date(date);
    const diffInMs = now.getTime() - past.getTime();
    const diffInMins = Math.floor(diffInMs / 60000);
    const diffInHours = Math.floor(diffInMins / 60);

    if (diffInMins < 1) return 'Now';
    if (diffInMins < 60) return `${diffInMins}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return past.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
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
            // Se è letta la rendiamo leggermente più opaca, ma non troppo
            opacity: item.is_read ? 0.8 : 1,
            flex: 1, // Prende tutto lo spazio tranne il tasto elimina
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

        {/* Pallino blu se non letta */}
        {!item.is_read && (
          <View style={[styles.unreadDot, { backgroundColor: theme.tint }]} />
        )}
      </Pressable>

      {/* TASTO ELIMINA ESTERNO O LATERALE */}
      <Pressable 
        onPress={() => {
          Alert.alert(
            "Delete Notification",
            "Are you sure you want to remove this notification?",
            [
              { text: "Cancel", style: "cancel" },
              { 
                text: "Delete", 
                style: "destructive", 
                onPress: () => handleDeleteNotification(item.id) 
              }
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
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchNotifications(); }} />}
        ListHeaderComponent={() => (
          <View style={styles.headerArea}>
            <Text style={[styles.screenTitle, { color: theme.text }]}>Notifications</Text>
            {notifications.some(n => !n.is_read) && (
              <Pressable onPress={markAllAsRead} style={{ padding: 8 }}> 
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

// Helper Styles & Logic
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
  cardWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8, // Spazio tra card e tasto X
  },
  notificationCard: { 
    flexDirection: 'row', 
    padding: 16, 
    borderRadius: 24, // Più arrotondato per un look moderno
    alignItems: 'center', 
    shadowColor: "#000", 
    shadowOpacity: 0.04, 
    shadowRadius: 12, 
    elevation: 3,
    borderWidth: 1,
  },
  deleteButton: {
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Aggiorna questo per evitare che il titolo vada sopra il tempo
  headerRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    marginBottom: 2
  },
  notifTitle: { 
    fontSize: 15, 
    flex: 1, 
    marginRight: 8 
  },
  timeText: { 
    fontSize: 10, 
    fontWeight: "600",
    textTransform: 'uppercase'
  },
  unreadDot: { 
    width: 10, 
    height: 10, 
    borderRadius: 5, 
    marginLeft: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4
  },
  iconContainer: { width: 48, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  textContainer: { flex: 1, marginLeft: 14, gap: 2 },
  message: { fontSize: 14, lineHeight: 20 },
  emptyContainer: { alignItems: 'center', marginTop: 100 }
});