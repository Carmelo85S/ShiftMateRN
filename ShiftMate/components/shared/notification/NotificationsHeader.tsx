import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";

interface NotificationsHeaderProps {
  hasUnread: boolean;
  theme: any;
  onMarkAllRead: () => void;
  title?: string;
}

export const NotificationsHeader = ({ 
  hasUnread, 
  theme, 
  onMarkAllRead, 
  title = "Notifications" 
}: NotificationsHeaderProps) => {
  return (
    <View style={styles.headerArea}>
      <Text style={[styles.screenTitle, { color: theme.text }]}>
        {title}
      </Text>
      
      {hasUnread && (
        <Pressable 
          onPress={onMarkAllRead} 
          style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1, padding: 4 })}
        > 
          <Text style={[styles.markReadText, { color: theme.tint }]}>
            Mark all as read
          </Text>
        </Pressable>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  headerArea: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 25 
  },
  screenTitle: { 
    fontSize: 32, 
    fontWeight: "900", 
    letterSpacing: -1 
  },
  markReadText: { 
    fontSize: 14, 
    fontWeight: "700" 
  }
});