import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

export const ShiftHero = ({ shift, theme }: any) => {
  const router = useRouter();
  const currentStatus = shift?.status?.toLowerCase();

  const getBadgeStyle = () => {
    switch (currentStatus) {
      case "completed":
        return { bg: "#4CAF50", text: "COMPLETED" };
      case "open":
        return { bg: theme.tint, text: "OPEN" };
      case "assigned":
      case "filled":
        return { bg: "#FF9500", text: "ASSIGNED" };
      case "canceled":
        return { bg: "#FF3B30", text: "CANCELED" };
      default:
        return {
          bg: "#8E8E93",
          text: shift?.status?.toUpperCase() || "UNKNOWN",
        };
    }
  };

  const isCompleted = shift.status === "completed";

  const badge = getBadgeStyle();

  console.log("Shift details: ", shift);

  return (
    <View style={styles.heroContainer}>
      {shift?.image_url ? (
        <Image source={{ uri: shift.image_url }} style={styles.heroImage} />
      ) : (
        <View
          style={[styles.heroImage, { backgroundColor: theme.tint + "20" }]}
        />
      )}
      <View style={styles.heroGradientOverlay} />

      <View style={styles.heroContent}>
        <View style={[styles.statusBadge, { backgroundColor: badge.bg }]}>
          <Text style={styles.statusBadgeText}>{badge.text}</Text>
        </View>

        <Text style={styles.heroTitle}>{shift?.title}</Text>
        <View style={styles.locationRow}>
          <Ionicons name="location" size={14} color="rgba(255,255,255,0.8)" />
          <Text style={styles.locationText}>
            {shift?.client_name || "Main Structure"}
          </Text>
        </View>
      </View>

      <View style={styles.fabWrapper}>
        <View style={styles.fabWrapper}>
          <Pressable
            onPress={() => {
              if (isCompleted) return;
              router.push({
                pathname: "/(manager)/(tabs)/shift/editShift",
                params: { id: shift?.id },
              });
            }}
            disabled={isCompleted}
            style={[
              styles.editFab,
              {
                backgroundColor: isCompleted ? "#8E8E93" : theme.text,
                borderColor: theme.border,
                opacity: isCompleted ? 0.5 : 1,
              },
            ]}
          >
            <Ionicons
              name={isCompleted ? "lock-closed" : "options-outline"}
              size={24}
              color={theme.background}
            />
          </Pressable>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  heroContainer: { height: 400, width: "100%" },
  heroImage: { width: "100%", height: "100%" },
  heroGradientOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  heroContent: { position: "absolute", left: 24, bottom: 60, right: 24 },
  heroTitle: {
    color: "#FFF",
    fontSize: 32,
    fontWeight: "800",
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  statusBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 12,
  },
  statusBadgeText: {
    color: "#FFF",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1,
  },
  locationRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  locationText: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 13,
    fontWeight: "500",
  },
  fabWrapper: { position: "absolute", right: 24, bottom: 40 }, // Posiziona l'ancora in modo pulito rispetto al container
  editFab: {
    width: 60,
    height: 60,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
});
