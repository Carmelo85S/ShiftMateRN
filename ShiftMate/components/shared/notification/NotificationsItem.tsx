import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export const NotificationsItem = ({ item, theme, onPress, onDelete }: any) => {
  const config = {
    confirmation: { name: "checkmark-circle", color: "#4CAF50", bg: "#4CAF5020" },
    rejection: { name: "close-circle", color: "#FF3B30", bg: "#FF3B3020" },
    new_application: { name: "people", color: "#007AFF", bg: "#007AFF20" },
    default: { name: "notifications", color: "#007AFF", bg: "#007AFF15" }
  };
  
  const type = (item.type as keyof typeof config) || 'default';
  const { name, color, bg } = config[type];

  return (
    <View style={styles.cardWrapper}>
      <Pressable 
        onPress={onPress}
        style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border, opacity: item.is_read ? 0.7 : 1 }]}
      >
        <View style={[styles.iconBox, { backgroundColor: bg }]}>
          <Ionicons name={name as any} size={22} color={color} />
        </View>
        <View style={styles.textContainer}>
          <Text style={[styles.title, { color: theme.text, fontWeight: item.is_read ? "600" : "800" }]} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={[styles.message, { color: theme.text + "80" }]} numberOfLines={2}>
            {item.message}
          </Text>
        </View>
        {!item.is_read && <View style={[styles.unreadDot, { backgroundColor: theme.tint }]} />}
      </Pressable>
      <Pressable onPress={onDelete} style={styles.deleteBtn}>
        <Ionicons name="close-outline" size={20} color={theme.text + "40"} />
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  cardWrapper: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  card: { flex: 1, flexDirection: 'row', padding: 16, borderRadius: 24, alignItems: 'center', borderWidth: 1 },
  iconBox: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  textContainer: { flex: 1, marginLeft: 12 },
  title: { fontSize: 16 },
  message: { fontSize: 14, marginTop: 2 },
  unreadDot: { width: 10, height: 10, borderRadius: 5, marginLeft: 10 },
  deleteBtn: { padding: 10, marginLeft: 5 }
});