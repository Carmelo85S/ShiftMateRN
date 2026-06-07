import React, { useState } from "react";
import { StyleSheet, Text, View, FlatList, ActivityIndicator, useColorScheme, RefreshControl } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { ScreenWrapper } from "@/components/shared/wrapper/layout-wrapper";
import { ShiftCard } from "@/components/shared/shiftCard/ShiftCard"; // Assicurati sia la versione quadrata
import { useManagerShift } from "@/hooks/manager/useManagerShift";
import { ScreenHeader } from "@/components/shared/Header";

export default function ShiftsManager() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = Colors[useColorScheme() ?? "light"];
  const { shifts, loading, refreshing, onRefresh } = useManagerShift();
  const [selectedDept, setSelectedDept] = useState("All");

  const departments = ["All", ...new Set(shifts.map(s => s.department))];
  if (loading && !refreshing) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="small" color={theme.text} />
      </View>
    );
  }

  return (
    <ScreenWrapper scrollable={false}>
      <FlatList
        data={shifts}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.columnRow}
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
              { paddingTop: insets.top }
        ]}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.headerArea}>
            <View style={styles.titleRow}>
              <ScreenHeader
                kpi="CENTER"
                title="Shift Hub"
                theme={theme}
              />
              <View style={[styles.countBadge, { backgroundColor: theme.text + "10" }]}>
                <Text style={[styles.countText, { color: theme.text }]}>{shifts.length}</Text>
              </View>
            </View>
          </View>
        }
        renderItem={({ item }) => (
          <ShiftCard 
            item={item} 
            onPress={() => router.push(`/(manager)/(tabs)/shift/${item.id}`)} 
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="calendar-outline" size={48} color={theme.text} style={{ opacity: 0.1 }} />
            <Text style={[styles.emptyText, { color: theme.text }]}>No shifts posted.</Text>
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
    paddingBottom: 10,
  },

  columnRow: {
    justifyContent: "space-between",
    marginBottom: 12,
  },

  headerArea: {
    marginBottom: 28,
  },

  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },

  countBadge: {
    minWidth: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
  },

  countText: {
    fontSize: 15,
    fontWeight: "700",
  },

  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 100,
  },

  emptyText: {
    fontSize: 16,
    fontWeight: "600",
    opacity: 0.45,
    marginTop: 16,
  },
});