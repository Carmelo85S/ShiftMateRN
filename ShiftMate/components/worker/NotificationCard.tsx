import React, { memo } from "react";
import { View, Text, Pressable, StyleSheet, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getTimeAgo } from "@/utils/date-formatter";

interface NotificationCardProps {
  item: any;
  theme: any;
  onPress: (item: any) => void;
  onDelete: (id: string) => void;
}

// 1. Configurazione centralizzata (Fonte di verità unica)
const NOTIFICATION_CONFIG: Record<string, { icon: string; color?: string; bg?: string }> = {
  confirmation: {
    icon: "checkmark-circle-outline",
    color: "#4CAF50",
    bg: "#4CAF5020",
  },
  rejection: {
    icon: "close-circle-outline",
    color: "#FF3B30",
    bg: "#FF3B3020",
  },
  invitation: {
    icon: "mail-outline",
  },
  default: {
    icon: "notifications-outline",
  }
};

export const NotificationCard = memo(({ item, theme, onPress, onDelete }: NotificationCardProps) => {
  
  // 2. Utilizzo del nuovo helper di stile
  const config = NOTIFICATION_CONFIG[item.type] || NOTIFICATION_CONFIG.default;
  const iconColor = config.color || theme.tint;
  const iconBg = config.bg || theme.tint + "15";

  const confirmDelete = () => {
    Alert.alert(
      "Delete Notification",
      "Are you sure you want to remove this notification?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: () => onDelete(item.id) }
      ]
    );
  };

  return (
    <View style={styles.cardWrapper}>
      <Pressable 
        onPress={() => onPress(item)}
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
        {/* Icona dinamica basata sulla config */}
        <View style={[styles.iconContainer, { backgroundColor: iconBg }]}>
          <Ionicons 
            name={config.icon as any} 
            size={22} 
            color={iconColor} 
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

      <Pressable onPress={confirmDelete} style={styles.deleteButton}>
        <Ionicons name="close-outline" size={20} color={theme.text + "40"} />
      </Pressable>
    </View>
  );
});

const styles = StyleSheet.create({
  cardWrapper: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 8 },
  notificationCard: { flexDirection: 'row', padding: 16, borderRadius: 24, alignItems: 'center', shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 12, elevation: 3, borderWidth: 1 },
  iconContainer: { width: 48, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  textContainer: { flex: 1, marginLeft: 14, gap: 2 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 },
  notifTitle: { fontSize: 15, flex: 1, marginRight: 8 },
  timeText: { fontSize: 10, fontWeight: "600", textTransform: 'uppercase' },
  message: { fontSize: 14, lineHeight: 20 },
  unreadDot: { width: 10, height: 10, borderRadius: 5, marginLeft: 12 },
  deleteButton: { padding: 8, justifyContent: 'center', alignItems: 'center' },
});