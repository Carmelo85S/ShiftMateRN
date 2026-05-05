import React, { useMemo, useCallback } from "react";
import { View, Text, StyleSheet, FlatList, TextInput, ActivityIndicator, useColorScheme, Pressable } from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { Colors } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { useLoadShiftApplication } from "@/hooks/manager/useLoadShiftApplication";
import { ApplicantCard } from "@/components/manager/shift-application/ApplicantCard";

const FILTER_OPTIONS = ['all', 'applied', 'accepted'] as const;

export default function ShiftApplicationsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const theme = Colors[useColorScheme() ?? "light"];

  const { data, loading, search, setSearch, filter, setFilter } = useLoadShiftApplication();

  //Filter Logic
  const filteredApps = useMemo(() => {
    if (!data?.applications) return [];
    return data.applications.filter((app: any) => {
      const name = `${app.profiles?.name} ${app.profiles?.surname}`.toLowerCase();
      const matchesSearch = name.includes(search.toLowerCase());
      const matchesFilter = filter === 'all' || app.status === filter;
      return matchesSearch && matchesFilter;
    });
  }, [data, search, filter]);

  // Navigation to candidate detail
  const navigateToCandidate = useCallback((profileId: string) => {
    router.push({ 
      pathname: "/(manager)/candidate/[id]", 
      params: { id: profileId, shiftId: id } 
    });
  }, [id]);

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <ActivityIndicator color={theme.tint} size="small" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <Stack.Screen options={{ 
        headerTitle: "Applicants",
        headerBackButtonDisplayMode: "minimal",
        headerShadowVisible: false,
        headerStyle: { backgroundColor: theme.background },
        headerTintColor: theme.text
      }} />

      {/* SEARCH & FILTER SECTION */}
      <View style={styles.headerControl}>
        <View style={[styles.searchBar, { backgroundColor: theme.card }]}>
          <Ionicons name="search" size={18} color={theme.secondaryText} />
          <TextInput
            placeholder="Search candidates..."
            placeholderTextColor={theme.secondaryText + "80"}
            style={[styles.searchInput, { color: theme.text }]}
            value={search}
            onChangeText={setSearch}
            autoCorrect={false}
          />
        </View>

        <View style={styles.filterContainer}>
          {FILTER_OPTIONS.map((f) => (
            <Pressable 
              key={f}
              onPress={() => setFilter(f)}
              style={[
                styles.filterChip, 
                { backgroundColor: filter === f ? theme.text : theme.card },
                filter === f && styles.activeChip
              ]}
            >
              <Text style={[
                styles.filterText, 
                { color: filter === f ? theme.background : theme.secondaryText }
              ]}>
                {f.toUpperCase()}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <FlatList
        data={filteredApps}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        initialNumToRender={10}
        removeClippedSubviews={true}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="people-outline" size={48} color={theme.text + "10"} />
            <Text style={{ color: theme.secondaryText, marginTop: 12 }}>
              No candidates found
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <ApplicantCard 
            item={item} 
            theme={theme} 
            onPress={() => navigateToCandidate(item.profile_id)} 
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  headerControl: { paddingHorizontal: 20, paddingBottom: 16, gap: 16, paddingTop: 10 },
  searchBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, height: 48, borderRadius: 16, gap: 12 },
  searchInput: { flex: 1, fontSize: 15, fontWeight: "600" },
  filterContainer: { flexDirection: 'row', gap: 8 },
  filterChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)' },
  activeChip: { borderColor: 'transparent' },
  filterText: { fontSize: 10, fontWeight: "800" },
  listContent: { paddingHorizontal: 20, paddingBottom: 100 },
  empty: { alignItems: 'center', marginTop: 100 }
});