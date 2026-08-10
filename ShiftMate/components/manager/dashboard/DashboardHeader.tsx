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
    .toLocaleDateString("en-US", {
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
          Hi, {userName.split(" ")[0]} 👋
        </Text>
        <View style={styles.infoRow}>
          <Text style={[styles.businessName, { color: theme.text }]}>
            {businessName ?? "Your Business"}
          </Text>
          {planType && (
            <View style={styles.badge}>
              <Text style={[styles.badgeText, { color: theme.tint }]}>
                Your plan is: {planType}
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
  userName: { fontSize: 22, fontWeight: "500", letterSpacing: 1 },
  infoRow: {
    flexDirection: "column",
    marginTop: 8,
    gap: 8,
  },
  businessName: { fontSize: 15, fontWeight: "600", opacity: 0.7 },
  badge: { paddingVertical: 2, borderRadius: 6 },
  badgeText: { fontSize: 10, fontWeight: "800", textTransform: "uppercase" },
  profileButton: {
    width: 75,
    height: 75,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
  },
  avatar: { width: "100%", height: "100%", borderRadius: 50 },
});
