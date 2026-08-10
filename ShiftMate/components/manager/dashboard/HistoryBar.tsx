import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View
} from "react-native";

interface HistoryBarProps {
  theme: any;
  onPress?: () => void;
  shifts?: any[];
}

export const HistoryBar = ({
  theme,
  onPress,
  shifts = [],
}: HistoryBarProps) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredShifts = shifts.filter((shift) =>
    String(shift.title || "")
      .toLowerCase()
      .includes(searchQuery.toLowerCase()),
  );

  const openHistory = () => {
    setIsModalVisible(true);
    onPress?.();
  };

  return (
    <>
      {/* HISTORY BUTTON */}
      <Pressable
        onPress={openHistory}
        style={({ pressed }) => [
          styles.historyCard,
          {
            backgroundColor: theme.card,
            opacity: pressed ? 0.85 : 1,
          },
        ]}
      >
        <View style={styles.headerLeft}>
          <View
            style={[
              styles.iconBadge,
              {
                backgroundColor: theme.tint + "10",
              },
            ]}
          >
            <Ionicons name="time-outline" size={18} color={theme.tint} />
          </View>

          <Text
            style={[
              styles.historyText,
              {
                color: theme.text,
              },
            ]}
          >
            View Shift History
          </Text>
        </View>

        <Ionicons
          name="chevron-forward"
          size={20}
          color={theme.secondaryText}
        />
      </Pressable>
    </>
  );
};

const styles = StyleSheet.create({
  historyCard: {
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 11,
    paddingVertical: 8,
    borderRadius: 13,
    marginBottom: 6,
  },

  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  iconBadge: {
    width: 30,
    height: 30,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 9,
  },

  historyText: {
    fontSize: 12,
    fontWeight: "700",
  },

  // Modal

  modalContainer: {
    flex: 1,
    paddingHorizontal: 18,
    paddingTop: 40,
  },

  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },

  modalTitle: {
    fontSize: 21,
    fontWeight: "800",
  },

  modalSubtitle: {
    fontSize: 11,
    fontWeight: "500",
    marginTop: 2,
  },

  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },

  searchBar: {
    height: 42,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 11,
    borderRadius: 11,
    marginBottom: 12,
  },

  searchInput: {
    flex: 1,
    marginLeft: 7,
    fontSize: 13,
  },

  listContent: {
    paddingBottom: 30,
  },

  shiftRow: {
    minHeight: 64,
    borderRadius: 13,
    marginBottom: 6,
    paddingHorizontal: 11,
    paddingVertical: 9,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  shiftLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    minWidth: 0,
  },

  shiftIcon: {
    width: 30,
    height: 30,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 9,
  },

  shiftInfo: {
    flex: 1,
    minWidth: 0,
  },

  shiftTitle: {
    fontSize: 12,
    fontWeight: "700",
  },

  shiftMeta: {
    fontSize: 10,
    fontWeight: "500",
    marginTop: 3,
  },

  shiftRight: {
    alignItems: "flex-end",
    marginLeft: 10,
  },

  payValue: {
    fontSize: 13,
    fontWeight: "800",
  },

  currency: {
    fontSize: 8,
    fontWeight: "700",
    marginTop: -1,
  },

  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    marginTop: 4,
  },

  statusText: {
    fontSize: 7,
    fontWeight: "800",
    letterSpacing: 0.4,
  },

  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 100,
    paddingHorizontal: 30,
  },

  emptyTitle: {
    fontSize: 15,
    fontWeight: "700",
    marginTop: 12,
  },

  emptySubtitle: {
    fontSize: 11,
    fontWeight: "500",
    textAlign: "center",
    marginTop: 5,
  },
});
