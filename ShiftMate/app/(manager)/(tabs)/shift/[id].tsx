import { Colors } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

interface ShiftCardProps {
  item: any;
  onPress: () => void;
  variant?: "worker" | "manager" | "global";
  isApplied?: boolean;
  isPending?: boolean;
  isRejected?: boolean;
  isPaid?: boolean;
}

export const ShiftCard = ({
  item,
  onPress,
  variant = "worker",
  isApplied,
  isPending,
  isRejected,
  isPaid,
}: ShiftCardProps) => {
  const theme = Colors.light;
  const dbStatus = item.status?.toLowerCase() || "open";

  const shiftDate = item.shift_date
    ? new Date(item.shift_date).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
      })
    : "N/A";

  const startTime = item.start_time?.slice(0, 5) || "--:--";
  const endTime = item.end_time?.slice(0, 5) || "";

  /*
   * Location priority:
   * 1. location
   * 2. address
   * 3. workplace_address
   * 4. client_address
   */
  const location =
    item.location ||
    item.address ||
    item.workplace_address ||
    item.client_address ||
    null;

  /*
   * Debug
   */
  console.log("ShiftCard:", {
    id: item.id,
    status: item.status,
    client_name: item.client_name,
    location: item.location,
    address: item.address,
    workplace_address: item.workplace_address,
    client_address: item.client_address,
    shift_date: item.shift_date,
    start_time: item.start_time,
    end_time: item.end_time,
  });

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: theme.card,
          borderColor: theme.border || "#E5E7EB",
          opacity: pressed ? 0.94 : 1,
        },
      ]}
    >
      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View
            style={[
              styles.iconBox,
              {
                backgroundColor: theme.tint + "10",
              },
            ]}
          >
            <Ionicons name="briefcase-outline" size={18} color={theme.tint} />
          </View>

          <View style={styles.headerText}>
            <Text
              style={[styles.title, { color: theme.text }]}
              numberOfLines={1}
            >
              {item.title || "Shift"}
            </Text>
          </View>
        </View>

        {/* PAYMENT */}
        <View style={styles.payContainer}>
          <Text style={[styles.payValue, { color: theme.text }]}>
            {Math.round(item.total_pay || 0)}
          </Text>

          <Text style={[styles.payCurrency, { color: theme.secondaryText }]}>
            SEK
          </Text>
        </View>
      </View>

      {/* MAIN DETAILS */}
      <View style={styles.details}>
        <View style={styles.detailItem}>
          <Ionicons
            name="calendar-outline"
            size={15}
            color={theme.secondaryText}
          />

          <Text style={[styles.detailText, { color: theme.text }]}>
            {shiftDate}
          </Text>
        </View>

        <View style={styles.detailItem}>
          <Ionicons name="time-outline" size={15} color={theme.secondaryText} />

          <Text style={[styles.detailText, { color: theme.text }]}>
            {startTime}
            {endTime ? ` – ${endTime}` : ""}
          </Text>
        </View>

        <View style={styles.detailItem}>
          <Ionicons
            name="people-outline"
            size={15}
            color={theme.secondaryText}
          />

          <Text style={[styles.detailText, { color: theme.text }]}>
            {item.required_workers || 1}
          </Text>
        </View>
      </View>

      {/* LOCATION + STATUS */}
      <View style={styles.locationStatusRow}>
        {location ? (
          <View style={styles.locationRow}>
            <Ionicons
              name="location-outline"
              size={14}
              color={theme.secondaryText}
            />

            <Text
              style={[styles.locationText, { color: theme.secondaryText }]}
              numberOfLines={1}
            >
              {location}
            </Text>
          </View>
        ) : (
          <View style={styles.locationPlaceholder} />
        )}

        <StatusBadge
          status={dbStatus}
          variant={variant}
          isApplied={isApplied}
          isPending={isPending}
          isRejected={isRejected}
          isPaid={isPaid}
        />
      </View>
    </Pressable>
  );
};

/* -------------------------------------------------------------------------- */
/* STATUS                                                                     */
/* -------------------------------------------------------------------------- */

interface StatusBadgeProps {
  status: string;
  variant: "worker" | "manager" | "global";
  isApplied?: boolean;
  isPending?: boolean;
  isRejected?: boolean;
  isPaid?: boolean;
}

const StatusBadge = ({
  status,
  variant,
  isApplied,
  isPending,
  isRejected,
  isPaid,
}: StatusBadgeProps) => {
  /*
   * COMPLETED
   */
  if (status === "completed") {
    return (
      <Badge
        icon="checkmark-circle-outline"
        color="#059669"
        label="Completed"
      />
    );
  }

  /*
   * WORKER STATUS
   */
  if (variant === "worker") {
    if (isPending) {
      return <Badge icon="time-outline" color="#D97706" label="Pending" />;
    }

    if (isRejected) {
      return (
        <Badge icon="close-circle-outline" color="#DC2626" label="Rejected" />
      );
    }

    if (isPaid) {
      return <Badge icon="card-outline" color="#059669" label="Paid" />;
    }

    if (isApplied) {
      return (
        <Badge
          icon="checkmark-circle-outline"
          color="#2563EB"
          label="Applied"
        />
      );
    }

    return <Badge icon="ellipse" color="#059669" label="Open" />;
  }

  /*
   * MANAGER / GLOBAL STATUS
   */
  if (status === "filled" || status === "assigned") {
    return <Badge icon="people-outline" color="#2563EB" label="Assigned" />;
  }

  if (status === "canceled" || status === "cancelled") {
    return (
      <Badge icon="close-circle-outline" color="#DC2626" label="Canceled" />
    );
  }

  if (status === "paid") {
    return <Badge icon="card-outline" color="#059669" label="Paid" />;
  }

  return <Badge icon="ellipse" color="#059669" label="Open" />;
};

/* -------------------------------------------------------------------------- */
/* BADGE                                                                      */
/* -------------------------------------------------------------------------- */

const Badge = ({
  icon,
  color,
  label,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  label: string;
}) => (
  <View style={styles.statusBadge}>
    <Ionicons name={icon} size={12} color={color} />

    <Text style={[styles.statusText, { color }]}>{label}</Text>
  </View>
);

export default ShiftCard;

/* -------------------------------------------------------------------------- */
/* STYLES                                                                     */
/* -------------------------------------------------------------------------- */

const styles = StyleSheet.create({
  card: {
    width: "100%",
    borderRadius: 16,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
  },

  /* HEADER */

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 12,
  },

  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  headerText: {
    flex: 1,
  },

  title: {
    fontSize: 15,
    fontWeight: "700",
  },

  /* PAYMENT */

  payContainer: {
    alignItems: "flex-end",
    justifyContent: "center",
  },

  payValue: {
    fontSize: 16,
    fontWeight: "800",
  },

  payCurrency: {
    fontSize: 9,
    fontWeight: "700",
    marginTop: -1,
  },

  /* DETAILS */

  details: {
    flexDirection: "row",
    alignItems: "center",
    gap: 18,
    marginTop: 16,
  },

  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  detailText: {
    fontSize: 12,
    fontWeight: "600",
  },

  /* LOCATION + STATUS */

  locationStatusRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 12,
    gap: 10,
  },

  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    flex: 1,
    minWidth: 0,
  },

  locationPlaceholder: {
    flex: 1,
  },

  locationText: {
    flex: 1,
    fontSize: 11,
    fontWeight: "500",
  },

  /* STATUS */

  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    flexShrink: 0,
  },

  statusText: {
    fontSize: 10,
    fontWeight: "800",
    textTransform: "uppercase",
  },
});
