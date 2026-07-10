import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

interface NotificationsItemProps {
  item: any;
  theme: any;
  onPress: () => void;
  onDelete: () => void;
}

export const NotificationsItem = ({
  item,
  theme,
  onPress,
  onDelete,
}: NotificationsItemProps) => {
  const config = {
    confirmation: {
      name: "checkmark-circle",
      color: "#4CAF50",
      bg: "#4CAF5020",
    },
    rejection: { name: "close-circle", color: "#FF3B30", bg: "#FF3B3020" },
    new_application: { name: "people", color: "#007AFF", bg: "#007AFF20" },
    default: {
      name: "notifications",
      color: theme.tint,
      bg: theme.tint + "15",
    },
  };

  // Gestione robusta del tipo
  const type = config[item.type as keyof typeof config] ? item.type : "default";
  const { name, color, bg } = config[type as keyof typeof config];

  return (
    <View style={styles.cardWrapper}>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.card,
          {
            backgroundColor: theme.card,
            borderColor: theme.border,
            opacity: pressed ? 0.9 : item.is_read ? 0.7 : 1,
          },
        ]}
      >
        <View style={[styles.iconBox, { backgroundColor: bg }]}>
          <Ionicons name={name as any} size={22} color={color} />
        </View>

        <View style={styles.textContainer}>
          <Text
            style={[
              styles.title,
              { color: theme.text, fontWeight: item.is_read ? "500" : "800" },
            ]}
            numberOfLines={1}
          >
            {item.title}
          </Text>
          <Text
            style={[styles.message, { color: theme.secondaryText }]}
            numberOfLines={2}
          >
            {item.message}
          </Text>
        </View>

        {!item.is_read && (
          <View style={[styles.unreadDot, { backgroundColor: theme.tint }]} />
        )}
      </Pressable>

      <Pressable onPress={onDelete} style={styles.deleteBtn} hitSlop={15}>
        <Ionicons name="close-outline" size={20} color={theme.secondaryText} />
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  cardWrapper: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  card: {
    flex: 1,
    flexDirection: "row",
    padding: 16,
    borderRadius: 24,
    alignItems: "center",
    borderWidth: 1,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  textContainer: { flex: 1, marginLeft: 12, marginRight: 8 },
  title: { fontSize: 15 },
  message: { fontSize: 13, marginTop: 2, lineHeight: 18 },
  unreadDot: { width: 8, height: 8, borderRadius: 4 },
  deleteBtn: { padding: 4 },
});
