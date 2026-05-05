import React, { memo } from "react";
import { Pressable, Image, View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const getStatusColor = (status: string) => {
  switch (status) {
    case 'accepted': return '#4CAF50';
    case 'rejected': return '#FF3B30';
    default: return '#FFCC00';
  }
};

export const ApplicantCard = memo(({ item, theme, onPress }: any) => (
  <Pressable 
    onPress={onPress}
    style={[styles.appCard, { backgroundColor: theme.card }]}
  >
    <Image 
      source={item.profiles?.avatar_url ? { uri: item.profiles.avatar_url } : require("@/assets/images/icon.png")} 
      style={styles.avatar} 
    />
    <View style={styles.info}>
      <Text style={[styles.name, { color: theme.text }]}>
        {item.profiles?.name} {item.profiles?.surname}
      </Text>
      <View style={styles.badgeRow}>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + "20" }]}>
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>{item.status}</Text>
        </View>
        <Text style={[styles.metaText, { color: theme.secondaryText }]}>
          • {item.profiles?.job_role || 'Worker'}
        </Text>
      </View>
    </View>
    <Ionicons name="chevron-forward" size={20} color={theme.text + "20"} />
  </Pressable>
));

const styles = StyleSheet.create({
  appCard: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 20, marginBottom: 12, borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)' },
  avatar: { width: 50, height: 50, borderRadius: 15, backgroundColor: '#EEE' },
  info: { flex: 1, marginLeft: 16, gap: 4 },
  name: { fontSize: 16, fontWeight: "700" },
  badgeRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  statusText: { fontSize: 10, fontWeight: "800", textTransform: 'uppercase' },
  metaText: { fontSize: 12, opacity: 0.6, fontWeight: "600" },
});