import { Colors } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

interface ShiftCardProps {
  item: any;
  onPress: () => void;
  variant?: "worker" | "manager" | "global";
  isApplied?: boolean;
  isPending?: boolean;
  isRejected?: boolean;
}

export const ShiftCard = ({
  item,
  onPress,
  variant = "worker",
  isApplied,
  isPending,
  isRejected,
}: ShiftCardProps) => {
  const theme = Colors.light;
  const dbStatus = item.status?.toLowerCase() || "open";

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: theme.card,
          opacity: pressed ? 0.9 : 1,
          transform: [{ scale: pressed ? 0.97 : 1 }],
        },
      ]}
    >
      {/* IMMAGINE E PREZZO */}
      <View
        style={[styles.imageWrapper, { backgroundColor: theme.background }]}
      >
        {item.image_url ? (
          <Image source={{ uri: item.image_url }} style={styles.image} />
        ) : (
          <Ionicons name="apps-outline" size={30} color={theme.tint + "40"} />
        )}
        <View style={styles.priceTag}>
          <Text style={styles.priceText}>
            €{Math.round(item.total_pay || 0)}
          </Text>
        </View>
      </View>

      {/* INFO CONTENUTO */}
      <View style={styles.infoContent}>
        <View>
          <Text style={[styles.title, { color: theme.text }]} numberOfLines={1}>
            {item.title}
          </Text>
          <View style={styles.row}>
            <Ionicons name="time-sharp" size={12} color={theme.tint} />
            <Text style={[styles.detailText, { color: theme.secondaryText }]}>
              {item.start_time?.slice(0, 5)}
            </Text>
            <View style={styles.dot} />
            <Text style={[styles.detailText, { color: theme.secondaryText }]}>
              {item.shift_date
                ? new Date(item.shift_date).toLocaleDateString("it-IT", {
                    day: "2-digit",
                    month: "short",
                  })
                : "N/A"}
            </Text>
          </View>
        </View>

        {/* CARD FOOTER */}
        <View style={styles.footer}>
          <View
            style={[
              styles.deptBadge,
              {
                backgroundColor: item.client_name
                  ? "rgba(16, 185, 129, 0.1)"
                  : theme.tint + "10",
              },
            ]}
          >
            <Ionicons
              name={item.client_name ? "business" : "layers"}
              size={10}
              color={item.client_name ? "#10B981" : theme.tint}
              style={{ marginRight: 4 }}
            />
            <Text
              style={[
                styles.deptText,
                { color: item.client_name ? "#10B981" : theme.tint },
              ]}
              numberOfLines={1}
            >
              {item.client_name || item.departments?.name || "General"}
            </Text>
          </View>

          <View style={styles.statusContainer}>
            <StatusBadge
              status={dbStatus}
              variant={variant}
              isApplied={isApplied}
              isPending={isPending}
              isRejected={isRejected}
            />
          </View>
        </View>
      </View>
    </Pressable>
  );
};

// Sotto-componente helper per lo stato
const StatusBadge = ({
  status,
  variant,
  isApplied,
  isPending,
  isRejected,
}: any) => {
  if (status === "completed")
    return <Badge icon="checkmark-circle" color="#10B981" label="Completed" />;

  if (variant === "worker") {
    if (isApplied)
      return (
        <Badge icon="checkmark-done-circle" color="#10B981" label="Confirmed" />
      );
    if (isPending)
      return <Badge icon="hourglass-outline" color="#D97706" label="Pending" />;
    if (isRejected)
      return (
        <Badge icon="close-circle-outline" color="#DC2626" label="Rejected" />
      );
    return <Badge icon="radio-button-on" color="#2647dcff" label="Open" />;
  }

  if (status === "filled" || status === "assigned")
    return <Badge icon="people-outline" color="#10B981" label="Filled" />;
  if (status === "canceled")
    return <Badge icon="ban" color="#EF4444" label="Canceled" />;
  return <Badge icon="radio-button-on" color="#3B82F6" label="Open" />;
};

const Badge = ({ icon, color, label }: any) => (
  <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
    <Ionicons name={icon} size={12} color={color} />
    <Text style={[styles.statusText, { color }]}>{label}</Text>
  </View>
);

export default ShiftCard;

const styles = StyleSheet.create({
  card: {
    width: "47%",
    aspectRatio: 0.82,
    borderRadius: 28,
    marginBottom: 15,
    padding: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.03)",
  },
  imageWrapper: {
    width: "100%",
    height: "52%",
    borderRadius: 22,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  image: { width: "100%", height: "100%", resizeMode: "cover" },
  priceTag: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(0,0,0,0.7)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  priceText: { color: "#FFF", fontSize: 12, fontWeight: "900" },
  infoContent: {
    flex: 1,
    paddingHorizontal: 6,
    paddingTop: 8,
    justifyContent: "space-between",
  },
  title: {
    fontSize: 14,
    fontWeight: "800",
    letterSpacing: -0.5,
    marginBottom: 2,
  },
  row: { flexDirection: "row", alignItems: "center", gap: 4 },
  detailText: { fontSize: 10, fontWeight: "600" },
  dot: { width: 3, height: 3, borderRadius: 2, backgroundColor: "#D1D1D6" },
  footer: {
    flexDirection: "column",
    alignItems: "flex-start",
    gap: 6,
    marginTop: "auto",
    paddingBottom: 4,
  },
  deptBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    flexShrink: 1,
  },
  deptText: {
    fontSize: 8,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  statusContainer: { marginTop: 4 },
  statusText: { fontSize: 10, fontWeight: "800", textTransform: "uppercase" },
});
