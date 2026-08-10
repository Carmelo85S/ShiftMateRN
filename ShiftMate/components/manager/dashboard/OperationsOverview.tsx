import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface Props {
  theme: any;
  openShifts: number;
  filledShifts: number;
  workersNeeded: number;
  pendingApplications: number;
}

interface StatCardProps {
  title: string;
  value: number;
  icon: keyof typeof Ionicons.glyphMap;
  theme: any;
}

const StatCard = ({ title, value, icon, theme }: StatCardProps) => (
  <View
    style={[
      styles.card,
      {
        backgroundColor: theme.card,
      },
    ]}
  >
    <View
      style={[
        styles.iconContainer,
        {
          backgroundColor: theme.tint + "15",
        },
      ]}
    >
      <Ionicons name={icon} size={16} color={theme.tint} />
    </View>

    <View style={styles.content}>
      <Text
        style={[
          styles.value,
          {
            color: theme.text,
          },
        ]}
      >
        {value}
      </Text>

      <Text
        style={[
          styles.label,
          {
            color: theme.secondaryText,
          },
        ]}
        numberOfLines={1}
      >
        {title}
      </Text>
    </View>
  </View>
);

export const OperationsOverview = ({
  theme,
  openShifts,
  filledShifts,
  workersNeeded,
  pendingApplications,
}: Props) => {
  const formattedDate = new Date()
    .toLocaleDateString("en-US", {
      weekday: "short",
      day: "numeric",
      month: "short",
    })
    .toUpperCase();

  return (
    <View style={styles.container}>
      <View style={styles.sectionHeader}>
        <Text
          style={[
            styles.sectionTitle,
            {
              color: theme.text,
            },
          ]}
        >
          Operations Overview
        </Text>

        <Text
          style={[
            styles.date,
            {
              color: theme.secondaryText,
            },
          ]}
        >
          {formattedDate}
        </Text>
      </View>

      <View style={styles.grid}>
        <StatCard
          title="Open Shifts"
          value={openShifts}
          icon="briefcase-outline"
          theme={theme}
        />

        <StatCard
          title="Filled Shifts"
          value={filledShifts}
          icon="checkmark-circle-outline"
          theme={theme}
        />

        <StatCard
          title="Workers Needed"
          value={workersNeeded}
          icon="people-outline"
          theme={theme}
        />

        <StatCard
          title="Applications"
          value={pendingApplications}
          icon="document-text-outline"
          theme={theme}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    marginBottom: 12,
  },

  sectionTitle: {
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0.5,
  },

  date: {
    fontSize: 10,
    fontWeight: "600",
    letterSpacing: 0.8,
    opacity: 0.7,
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 8,
  },

  card: {
    width: "48%",
    minHeight: 58,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
  },

  iconContainer: {
    width: 30,
    height: 30,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 9,
  },

  content: {
    flex: 1,
    justifyContent: "center",
  },

  value: {
    fontSize: 18,
    fontWeight: "900",
    lineHeight: 20,
  },

  label: {
    fontSize: 10,
    fontWeight: "600",
    marginTop: 2,
  },
});
