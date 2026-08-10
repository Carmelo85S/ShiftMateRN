import { ScreenHeader } from "@/components/shared/Header";
import { ShiftCard } from "@/components/shared/shiftCard/ShiftCard";
import { ScreenWrapper } from "@/components/shared/wrapper/layout-wrapper";
import { Colors } from "@/constants/theme";
import { useManagerShift } from "@/hooks/manager/useManagerShift";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ShiftsManager() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const theme = Colors[useColorScheme() ?? "light"];

  const { shifts, loading, refreshing, onRefresh } = useManagerShift();

  if (loading && !refreshing) {
    return (
      <View
        style={[
          styles.center,
          {
            backgroundColor: theme.background,
          },
        ]}
      >
        <ActivityIndicator size="small" color={theme.tint} />
      </View>
    );
  }

  return (
    <ScreenWrapper scrollable={false}>
      <FlatList
        data={shifts}
        keyExtractor={(item) => item.id}
        numColumns={1}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.tint}
            colors={[theme.tint]}
          />
        }
        contentContainerStyle={[
          styles.listContent,
          {
            paddingTop: insets.top,
          },
        ]}
        ListHeaderComponent={
          <View style={styles.headerArea}>
            <View style={styles.titleRow}>
              <View style={styles.titleContainer}>
                <ScreenHeader
                  kpi="MANAGEMENT"
                  title="Shifts"
                  theme={theme}
                  containerStyle={styles.screenHeader}
                />

                <Text
                  style={[
                    styles.subtitle,
                    {
                      color: theme.secondaryText,
                    },
                  ]}
                >
                  Manage your scheduled shifts
                </Text>
              </View>

              <View style={styles.headerActions}>
                <Pressable
                  onPress={() => router.push("/(manager)/(tabs)/shift/history")}
                  style={({ pressed }) => [
                    styles.iconBtn,
                    {
                      backgroundColor: theme.text + "10",
                    },
                    pressed && {
                      opacity: 0.7,
                    },
                  ]}
                >
                  <Ionicons name="time-outline" size={19} color={theme.text} />
                </Pressable>

                <View
                  style={[
                    styles.countBadge,
                    {
                      backgroundColor: theme.tint + "12",
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.countText,
                      {
                        color: theme.tint,
                      },
                    ]}
                  >
                    {shifts.length}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        }
        renderItem={({ item }) => (
          <ShiftCard
            item={item}
            variant="manager"
            isPaid={item.status?.toLowerCase() === "paid"}
            onPress={() => router.push(`/(manager)/(tabs)/shift/${item.id}`)}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons
              name="calendar-outline"
              size={46}
              color={theme.text}
              style={{
                opacity: 0.15,
              }}
            />

            <Text
              style={[
                styles.emptyText,
                {
                  color: theme.text,
                },
              ]}
            >
              No shifts posted
            </Text>

            <Text
              style={[
                styles.emptySubtext,
                {
                  color: theme.secondaryText,
                },
              ]}
            >
              Your scheduled shifts will appear here.
            </Text>
          </View>
        }
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  listContent: {
    paddingBottom: 30,
  },

  headerArea: {
    marginBottom: 18,
  },

  titleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },

  titleContainer: {
    flex: 1,
  },

  screenHeader: {
    marginBottom: 0,
  },

  subtitle: {
    fontSize: 12,
    fontWeight: "500",
    marginTop: -1,
  },

  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginLeft: 12,
    marginTop: 8,
  },

  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: "center",
    alignItems: "center",
  },

  countBadge: {
    minWidth: 38,
    height: 38,
    paddingHorizontal: 10,
    borderRadius: 19,
    justifyContent: "center",
    alignItems: "center",
  },

  countText: {
    fontSize: 14,
    fontWeight: "800",
  },

  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 100,
    paddingHorizontal: 30,
  },

  emptyText: {
    fontSize: 16,
    fontWeight: "700",
    marginTop: 14,
  },

  emptySubtext: {
    fontSize: 12,
    fontWeight: "500",
    marginTop: 5,
    textAlign: "center",
  },
});
