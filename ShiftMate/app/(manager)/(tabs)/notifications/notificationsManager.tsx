import { View, FlatList, ActivityIndicator, useColorScheme, RefreshControl } from "react-native";
import { Colors } from "@/constants/theme";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect } from "expo-router";
import { useCallback } from "react";

import { useHandleNotifications } from "@/hooks/manager/useHandleNotifications";
import { NotificationsItem } from "@/components/shared/notification/NotificationsItem";
import { NotificationsHeader } from "@/components/shared/notification/NotificationsHeader";

export default function NotificationsScreen() {
  const theme = Colors[useColorScheme() ?? "light"];
  const insets = useSafeAreaInsets();
  
  const { 
    notifications, loading, refreshing, setRefreshing, 
    fetchNotifications, handleMarkAllRead, handleNotificationPress, handleDeleteNotification 
  } = useHandleNotifications();

  useFocusEffect(useCallback(() => { fetchNotifications(); }, [fetchNotifications]));

  if (loading && !refreshing) return (
    <View style={{ flex: 1, justifyContent: 'center', backgroundColor: theme.background }}>
      <ActivityIndicator size="large" color={theme.tint} />
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: insets.top + 20, paddingBottom: 100 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchNotifications(); }} tintColor={theme.tint} />
        }
        ListHeaderComponent={() => (
          <NotificationsHeader 
            hasUnread={notifications.some(n => !n.is_read)} 
            theme={theme} 
            onMarkAllRead={handleMarkAllRead} 
          />
        )}
        renderItem={({ item }) => (
          <NotificationsItem 
            item={item} 
            theme={theme} 
            onPress={() => handleNotificationPress(item)} 
            onDelete={() => handleDeleteNotification(item.id)}
          />
        )}
      />
    </View>
  );
}