import { StyleSheet, Text, View, FlatList, ActivityIndicator, useColorScheme, RefreshControl } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { ScreenWrapper } from "@/components/shared/wrapper/layout-wrapper";
import { ShiftCard } from "@/components/shared/shiftCard/ShiftCard";
import { useManagerShift } from "@/hooks/manager/useManagerShift";

export default function ShiftsManager() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = Colors[useColorScheme() ?? "light"];
  const { shifts, loading, refreshing, onRefresh } = useManagerShift();

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
          { paddingTop: insets.top + 25, paddingBottom: 120 }
        ]}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.headerArea}>
            <View style={styles.titleRow}>
              <View>
                <Text style={[styles.kpiLabel, { color: theme.tint }]}>CENTER</Text>
                <Text style={[styles.headerTitle, { color: theme.text }]}>Shift Hub</Text>
              </View>
              <View style={[styles.countBadge, { backgroundColor: theme.text + "10" }]}>
                <Text style={[styles.countText, { color: theme.text }]}>{shifts.length}</Text>
              </View>
            </View>
          </View>
        }
        renderItem={({ item }) => (
          <ShiftCard 
            item={item} 
            variant="manager"
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
  listContent: { paddingHorizontal: 24 },
  headerArea: { marginBottom: 30 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  kpiLabel: { fontSize: 12, fontWeight: "700", letterSpacing: 0.5, marginBottom: 4, opacity: 0.5 },
  headerTitle: { fontSize: 28, fontWeight: "700", letterSpacing: -0.8 },
  countBadge: { paddingHorizontal: 12, height: 28, borderRadius: 12, justifyContent: 'center' },
  countText: { fontSize: 14, fontWeight: "600" },
  emptyContainer: { marginTop: 100, alignItems: "center" },
  emptyText: { fontSize: 16, opacity: 0.4, marginTop: 15 },
});