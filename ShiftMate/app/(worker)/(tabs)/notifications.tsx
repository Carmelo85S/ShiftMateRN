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

import { useLoadNotifications } from "@/hooks/worker/notifications/useLoadNotifications";
import { useRealTimeNotifications } from "@/hooks/worker/notifications/useRealTimeNotifications";
import { useNotificationsActions } from "@/hooks/worker/notifications/useNotificationsActions";
import { useHandleNotificationsPress } from "@/hooks/worker/notifications/useHandleNotificationsPress";
import { NotificationCard } from "@/components/worker/NotificationCard";
import { ScreenWrapper } from "@/components/shared/wrapper/layout-wrapper";

export default function NotificationsScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];
  const insets = useSafeAreaInsets();

  const {notifications, setNotifications, loading, setLoading, refreshing, setRefreshing, loadNotifications} = useLoadNotifications();

  // Realtime
  useRealTimeNotifications(setNotifications);

  // Handlers
  const { 
    handleMarkAsRead, 
    handleMarkAllRead, 
    handleDeleteNotification 
  } = useNotificationsActions(notifications, setNotifications, loadNotifications);

  const {handleNotificationPress} = useHandleNotificationsPress({handleMarkAsRead});

  if (loading) return (
    <View style={[styles.center, { backgroundColor: theme.background }]}>
      <ActivityIndicator color={theme.tint} />
    </View>
  );

  return (
    <ScreenWrapper scrollable={false}>
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
          renderItem={({ item }) => (
            <NotificationCard 
              item={item} 
              theme={theme} 
              onPress={handleNotificationPress} 
              onDelete={handleDeleteNotification} 
            />
          )}
        />
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  list: { paddingHorizontal: 20, paddingBottom: 100 },
  headerArea: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 25 },
  screenTitle: { fontSize: 28, fontWeight: "800", letterSpacing: -0.5 },
  emptyContainer: { alignItems: 'center', marginTop: 100 }
});