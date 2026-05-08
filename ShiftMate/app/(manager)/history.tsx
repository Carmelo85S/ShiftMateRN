import React, { useState, useMemo, useCallback } from "react";
import { View, StyleSheet, FlatList, ActivityIndicator, useColorScheme } from "react-native";
import { Colors } from "@/constants/theme";
import { useFocusEffect, Stack, router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLoadHistory } from "@/hooks/manager/useLoadHistory";
import { ScreenWrapper } from "@/components/shared/wrapper/layout-wrapper";
import { ShiftCard } from "@/components/shared/shiftCard/ShiftCard";
import { Ionicons } from "@expo/vector-icons";
import { HistoryStatsCard } from "@/components/manager/history/HistoryStatsCard";

export default function HistoryScreen() {
  const theme = Colors[useColorScheme() ?? "light"];
  const insets = useSafeAreaInsets();
  const { history, loading, totalHistorySpending, loadHistory } = useLoadHistory();

  // --- LOGICA FILTRI ---
  const [selectedDept, setSelectedDept] = useState("All");

  const departments = useMemo(() => 
    ["All", ...new Set(history.map(s => s.department).filter(Boolean))], 
    [history]
  );

  const filteredHistory = useMemo(() => 
    selectedDept === "All" ? history : history.filter(s => s.department === selectedDept),
    [history, selectedDept]
  );

  useFocusEffect(
    useCallback(() => {
      loadHistory();
    }, [loadHistory])
  );

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="small" color={theme.text} />
      </View>
    );
  }

  return (
    <ScreenWrapper scrollable={false}>
      <Stack.Screen options={{ title: "Shifts History", headerShadowVisible: false }} />
      
      <FlatList
        data={filteredHistory}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.columnRow}
        contentContainerStyle={[
          styles.listContent, 
          { 
            paddingTop: 10, 
            paddingBottom: 120 
          }
        ]}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.headerContainer}>
            <HistoryStatsCard 
              {...({
                spending: totalHistorySpending,
                count: filteredHistory.length,
                theme,
                departments,
                selectedDept,
                onSelectDept: setSelectedDept,
              } as any)}
            />
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.cardWrapper}>
            <ShiftCard 
              item={item} 
              variant="manager"
              onPress={() => router.push(`/(manager)/(tabs)/shift/${item.id}`)} 
            />
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="calendar-outline" size={48} color={theme.text} style={{ opacity: 0.1 }} />
          </View>
        }
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  listContent: { paddingHorizontal: 20 },
  columnRow: { justifyContent: 'space-between' },
  cardWrapper: { 
    width: '48%', 
    marginBottom: 12 // Spazio tra le righe di card ridotto
  },
  headerContainer: { 
    marginTop: 10,
    marginBottom: 20 
  },
  emptyContainer: { 
    alignItems: "center", 
    marginTop: 100 
  },
});