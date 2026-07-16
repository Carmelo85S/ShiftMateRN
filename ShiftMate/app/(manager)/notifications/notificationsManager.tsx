import { Colors } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useFocusEffect } from "expo-router";
import React, { useCallback } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { NotificationsHeader } from "@/components/shared/notification/NotificationsHeader";
import { NotificationsItem } from "@/components/shared/notification/NotificationsItem";
import { ScreenWrapper } from "@/components/shared/wrapper/layout-wrapper";
import { useHandleNotifications } from "@/hooks/manager/useHandleNotifications";

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
    onRefresh,
  } = useHandleNotifications();

  useFocusEffect(
    useCallback(() => {
      fetchNotifications();
    }, [fetchNotifications]),
  );

  // Loading iniziale
  if (loading && !refreshing) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="small" color={theme.tint} />
      </View>
    );
  }

  return (
    <ScreenWrapper scrollable={false}>
      <Stack.Screen
        options={{
          headerTitle: "Notifications",
          headerBackButtonDisplayMode: "minimal",
          headerShadowVisible: false,
          headerStyle: { backgroundColor: theme.background },
          headerTintColor: theme.text,
        }}
      />

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
            { paddingTop: insets.top + 20, paddingBottom: 120 },
          ]}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            notifications.length > 0 ? (
              <NotificationsHeader
                hasUnread={notifications.some((n) => !n.is_read)}
                theme={theme}
                onMarkAllRead={handleMarkAllRead}
              />
            ) : null
          }
          renderItem={({ item }) => (
            <NotificationsItem
              item={item}
              theme={theme}
              onPress={() => handleNotificationPress(item)}
              onDelete={() => handleDeleteNotification(item.id)}
            />
          )}
          ListEmptyComponent={
            !loading ? (
              <View style={styles.emptyContainer}>
                <Ionicons
                  name="notifications-outline"
                  size={64}
                  color={theme.secondaryText}
                  style={{ opacity: 0.3 }}
                />
                <Text style={[styles.emptyTitle, { color: theme.text }]}>
                  All caught up!
                </Text>
                <Text
                  style={[styles.emptyText, { color: theme.secondaryText }]}
                >
                  You have no new notifications right now.
                </Text>
              </View>
            ) : null
          }
        />
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listContent: {
    paddingHorizontal: 20,
  },
  emptyContainer: {
    marginTop: 100,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "800",
    marginTop: 20,
  },
  emptyText: {
    fontSize: 14,
    marginTop: 8,
    textAlign: "center",
    lineHeight: 20,
  },
});
