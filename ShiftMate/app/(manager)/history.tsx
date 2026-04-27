import { View, Text, StyleSheet, FlatList, ActivityIndicator, useColorScheme } from "react-native";
import { useCallback } from "react";
import { Colors } from "@/constants/theme";
import { useFocusEffect, Stack } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLoadHistory } from "@/hooks/manager/useLoadHistory";
import { ScreenWrapper } from "@/components/shared/wrapper/layout-wrapper";
import { HistoryStatsCard } from "@/components/manager/HistoryStatsCard";
import { HistoryItem } from "@/components/manager/HistoryItem";
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
      
      <FlatList
        data={history}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 24, paddingBottom: insets.bottom + 20 }}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <HistoryStatsCard 
            spending={totalHistorySpending} 
            count={history.length} 
            theme={theme} 
          />
        }
        renderItem={({ item }) => <HistoryItem item={item} theme={theme} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={{ color: theme.secondaryText }}>No shifts in the past.</Text>
          </View>
        }
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  empty: { alignItems: 'center', marginTop: 50 }
});