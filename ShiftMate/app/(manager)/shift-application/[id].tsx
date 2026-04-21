import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  Image, 
  Pressable, 
  TextInput, 
  ActivityIndicator,
  useColorScheme 
} from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { useState, useCallback, useMemo } from "react";
import { Colors } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { fetchShiftFullDetails } from "@/queries/managerQueries";
import { useFocusEffect } from "expo-router";

export default function ShiftApplicationsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<'all' | 'applied' | 'accepted'>('all');

  const loadData = useCallback(async () => {
    try {
      const result = await fetchShiftFullDetails(id as string);
      setData(result);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

  // Logica di filtraggio per gestire 100+ persone senza lag
  const filteredApps = useMemo(() => {
    if (!data?.applications) return [];
    return data.applications.filter((app: any) => {
      const matchesSearch = app.profiles?.name?.toLowerCase().includes(search.toLowerCase());
      const matchesFilter = filter === 'all' ? true : app.status === filter;
      return matchesSearch && matchesFilter;
    });
  }, [data, search, filter]);

  if (loading) return (
    <View style={[styles.center, { backgroundColor: theme.background }]}>
      <ActivityIndicator color={theme.tint} />
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <Stack.Screen options={{ 
        headerTitle: "Applicants",
        headerShadowVisible: false,
        headerStyle: { backgroundColor: theme.background },
        headerTintColor: theme.text
      }} />

      {/* SEARCH & FILTER SECTION */}
      <View style={styles.headerControl}>
        <View style={[styles.searchBar, { backgroundColor: theme.card }]}>
          <Ionicons name="search" size={18} color={theme.secondaryText} />
          <TextInput
            placeholder="Search by name..."
            placeholderTextColor={theme.secondaryText + "80"}
            style={[styles.searchInput, { color: theme.text }]}
            value={search}
            onChangeText={setSearch}
          />
        </View>

        <View style={styles.filterContainer}>
          {['all', 'applied', 'accepted'].map((f) => (
            <Pressable 
              key={f}
              onPress={() => setFilter(f as any)}
              style={[
                styles.filterChip, 
                filter === f && { backgroundColor: theme.text }
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

      {/* PERFORMANCE LIST */}
      <FlatList
        data={filteredApps}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={() => (
          <View style={styles.empty}>
            <Ionicons name="people-outline" size={48} color={theme.text + "10"} />
            <Text style={{ color: theme.secondaryText, marginTop: 12 }}>No candidates found</Text>
          </View>
        )}
        renderItem={({ item }) => (
          <Pressable 
            onPress={() => router.push({ 
              pathname: "/(manager)/candidate/[id]", 
              params: { id: item.profile_id, shiftId: id } 
            })}
            style={[styles.appCard, { backgroundColor: theme.card }]}
          >
            <Image 
              source={item.profiles?.avatar_url ? { uri: item.profiles.avatar_url } : require("@/assets/images/icon.png")} 
              style={styles.avatar} 
            />
            <View style={styles.info}>
              <Text style={[styles.name, { color: theme.text }]}>{item.profiles?.name} {item.profiles?.surname}</Text>
              <View style={styles.badgeRow}>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + "20" }]}>
                  <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>{item.status}</Text>
                </View>
                {/* Esempio di info extra per il manager */}
                <Text style={styles.metaText}>• {item.profiles?.job_role || 'Worker'}</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.text + "20"} />
          </Pressable>
        )}
      />
    </View>
  );
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'accepted': return '#4CAF50';
    case 'rejected': return '#FF3B30';
    default: return '#FFCC00';
  }
};

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  headerControl: { paddingHorizontal: 20, paddingBottom: 16, gap: 16 },
  searchBar: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 16, 
    height: 48, 
    borderRadius: 16, 
    gap: 12 
  },
  searchInput: { flex: 1, fontSize: 15, fontWeight: "600" },
  filterContainer: { flexDirection: 'row', gap: 8 },
  filterChip: { 
    paddingHorizontal: 16, 
    paddingVertical: 8, 
    borderRadius: 20, 
    borderWidth: 1, 
    borderColor: 'rgba(0,0,0,0.05)' 
  },
  filterText: { fontSize: 10, fontWeight: "800" },
  listContent: { padding: 20, paddingBottom: 100 },
  appCard: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 12, 
    borderRadius: 20, 
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)'
  },
  avatar: { width: 50, height: 50, borderRadius: 15, backgroundColor: '#EEE' },
  info: { flex: 1, marginLeft: 16, gap: 4 },
  name: { fontSize: 16, fontWeight: "700" },
  badgeRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  statusText: { fontSize: 10, fontWeight: "800", textTransform: 'uppercase' },
  metaText: { fontSize: 12, opacity: 0.4, fontWeight: "600" },
  empty: { alignItems: 'center', marginTop: 100 }
});