import { View, Text, StyleSheet, FlatList, ActivityIndicator, useColorScheme, RefreshControl } from "react-native";
import { useCallback } from "react";
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
        <View style={styles.headerArea}>
            <HistoryStatsCard spending={totalHistorySpending} count={history.length} theme={theme} />
        </View>
        <FlatList
          data={history}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.columnRow}
          contentContainerStyle={[
            styles.listContent, { paddingBottom: 120 }
          ]}
          showsVerticalScrollIndicator={false}
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
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  empty: { alignItems: 'center', marginTop: 50 },
  listContent: { paddingHorizontal: 20 },
  columnRow: { justifyContent: 'space-between', marginBottom: 4 },
  headerArea: { margin: 30, paddingHorizontal: 4 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  kpiLabel: { fontSize: 12, fontWeight: "700", letterSpacing: 0.5, marginBottom: 4, opacity: 0.5 },
  headerTitle: { fontSize: 28, fontWeight: "700", letterSpacing: -0.8 },
  countBadge: { paddingHorizontal: 12, height: 28, borderRadius: 12, justifyContent: 'center' },
  countText: { fontSize: 14, fontWeight: "600" },
  emptyContainer: { marginTop: 100, alignItems: "center" },
  emptyText: { fontSize: 16, opacity: 0.4, marginTop: 15 },
});