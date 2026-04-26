import React, { useCallback } from "react";
import { View, FlatList, ActivityIndicator, useColorScheme, StyleSheet, RefreshControl } from "react-native";
import { Colors } from "@/constants/theme";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect } from "expo-router";

import { useHandleNotifications } from "@/hooks/manager/useHandleNotifications";
import { NotificationsItem } from "@/components/shared/notification/NotificationsItem";
import { NotificationsHeader } from "@/components/shared/notification/NotificationsHeader";
import { ScreenWrapper } from "@/components/shared/wrapper/layout-wrapper";

export default function NotificationsScreen() {
  const theme = Colors[useColorScheme() ?? "light"];
  const insets = useSafeAreaInsets();
  
  const { 
    notifications, 
    loading, 
    refreshing, 
    fetchNotifications, 
    handleMarkAllRead, 
    handleNotificationPress, 
    handleDeleteNotification,
    onRefresh
  } = useHandleNotifications();

  useFocusEffect(
    useCallback(() => { 
      fetchNotifications(); 
    }, [fetchNotifications])
  );

  if (loading && !refreshing) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="small" color={theme.tint} />
      </View>
    );
  }

  return (
    <ScreenWrapper scrollable={false}>
      <View style={{ flex: 1, backgroundColor: theme.background }}>
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={theme.tint}
              colors={[theme.tint]}
            />
          }
          contentContainerStyle={[
            styles.listContent,
            { paddingTop: insets.top + 20, paddingBottom: 120 }
          ]}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <NotificationsHeader 
              hasUnread={notifications.some(n => !n.is_read)} 
              theme={theme} 
              onMarkAllRead={handleMarkAllRead} 
            />
          }
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
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  center: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  listContent: { 
    paddingHorizontal: 20 
  }
});