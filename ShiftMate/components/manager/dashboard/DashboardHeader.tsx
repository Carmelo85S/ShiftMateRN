import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

interface Props {
  userName: string;
  businessName?: string;
  profileImage?: string | null;
  planType?: string | null;
  theme: any;
  onProfilePress: () => void;
}

export const DashboardHeader = ({
  userName,
  businessName,
  profileImage,
  planType,
  theme,
  onProfilePress,
}: Props) => {
  const formattedDate = new Date()
    .toLocaleDateString("it-IT", {
      weekday: "short",
      day: "numeric",
      month: "short",
    })
    .toUpperCase();

  return (
    <View style={styles.topBar}>
      <View style={styles.leftContainer}>
        <Text style={[styles.dateText, { color: theme.secondaryText }]}>
          {formattedDate}
        </Text>
        <Text style={[styles.userName, { color: theme.text }]}>
          Hi, {userName.split(" ")[0]}
        </Text>
        <View style={styles.infoRow}>
          <Text style={[styles.businessName, { color: theme.text }]}>
            {businessName ?? "Your Business"}
          </Text>
          {planType && (
            <View
              style={[styles.badge, { backgroundColor: theme.tint + "20" }]}
            >
              <Text style={[styles.badgeText, { color: theme.tint }]}>
                {planType}
              </Text>
            </View>
          )}
        </View>
      </View>

      <Pressable
        onPress={onProfilePress}
        style={[
          styles.profileButton,
          { backgroundColor: theme.card, borderColor: theme.border },
        ]}
      >
        {profileImage ? (
          <Image source={{ uri: profileImage }} style={styles.avatar} />
        ) : (
          <Ionicons name="person" size={28} color={theme.text} />
        )}
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 24,
  },
  leftContainer: { flex: 1, marginRight: 16 },
  dateText: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1,
    marginBottom: 4,
  },
  userName: { fontSize: 32, fontWeight: "900", letterSpacing: -0.5 },
  infoRow: { flexDirection: "row", alignItems: "center", marginTop: 8, gap: 8 },
  businessName: { fontSize: 15, fontWeight: "600", opacity: 0.7 },
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  badgeText: { fontSize: 10, fontWeight: "800", textTransform: "uppercase" },
  profileButton: {
    width: 75,
    height: 75,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
  },
  avatar: { width: "100%", height: "100%", borderRadius: 28 },
});
