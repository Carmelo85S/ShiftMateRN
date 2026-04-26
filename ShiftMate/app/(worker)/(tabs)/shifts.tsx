import { Colors } from "@/constants/theme";
import { supabase } from "@/lib/supabase";
import { useRouter } from "expo-router";
import { useEffect, useState, useCallback } from "react";
import { 
  FlatList, 
  StyleSheet, 
  Text, 
  View, 
  ActivityIndicator, 
  RefreshControl,
  Pressable,
  StatusBar,
  Dimensions
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ShiftCard } from "@/components/shared/shiftCard/ShiftCard";
import { fetchGlobalShifts } from "@/queries/workerQueries";

const { width } = Dimensions.get("window");

type Shift = {
  id: string;
  business_id: string;
  title: string;
  shift_date: string;
  start_time: string;
  end_time: string;
  image_url: string | null;
  total_pay: number;   
  hourly_rate: number;
  department: string; 
  businesses?: {
    name: string;
  };
};

export default function WorkerShifts() {
  const theme = Colors.light;
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // Data States
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Identity & Filter States
  const [isGuest, setIsGuest] = useState(true);
  const [myBusinessId, setMyBusinessId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'mine'>('all');

  const loadShiftsBoard = useCallback(async () => {
    try {
      // Session Check & Business ID Retrieval
      const { data: { session } } = await supabase.auth.getSession();
      const guestStatus = !session;
      setIsGuest(guestStatus);

      if (!guestStatus && session.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("business_id")
          .eq("id", session.user.id)
          .single();
        setMyBusinessId(profile?.business_id || null);
      }

      // Fetch Global Marketplace Shifts
      const shiftsData = await fetchGlobalShifts();

      // Data Normalization
      const normalized: Shift[] = (shiftsData || []).map((s: any) => ({
        id: String(s.id),
        business_id: s.business_id, 
        title: s.title,
        shift_date: s.shift_date,
        start_time: s.start_time,
        end_time: s.end_time,
        image_url: s.image_url ?? null,
        total_pay: Number(s.total_pay) || 0,
        hourly_rate: Number(s.hourly_rate) || 0,
        department: s.department || 'hospitality',
        businesses: s.businesses
      }));
      
      setShifts(normalized);
    } catch (err: any) {
      console.error("WorkerShifts Load Error:", err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadShiftsBoard();
  }, [loadShiftsBoard]);

  // --- CLIENT-SIDE FILTERING ---
  const displayedShifts = shifts.filter(shift => {
    if (activeTab === 'mine') {
      return shift.business_id === myBusinessId;
    }
    return true;
  });

  const onRefresh = () => {
    setRefreshing(true);
    loadShiftsBoard();
  };

  // Dynamic counts for tabs
  const myShiftsCount = shifts.filter(s => s.business_id === myBusinessId).length;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <View style={[styles.bgCircle, { top: -width * 0.1, right: -width * 0.1 }]} />
      
      <FlatList
        data={displayedShifts}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.listContent, 
          { paddingTop: insets.top + 20, paddingBottom: 120 }
        ]}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh} 
            tintColor={theme.tint} 
          />
        }
        ListHeaderComponent={() => (
          <View style={styles.header}>
            <View style={styles.headerTop}>
              <View style={{ flex: 1 }}>
                <Text style={styles.businessBadge}>
                  {isGuest ? "OPEN MARKETPLACE" : "WORKER DASHBOARD"}
                </Text>
                <Text style={styles.mainTitle} numberOfLines={1}>
                  {isGuest ? "Opportunities" : "Job Board"}
                </Text>
              </View>
              <Pressable 
                style={styles.profileBtn} 
                onPress={() => isGuest ? router.push("/") : router.push("/(worker)/(tabs)/profile")}
              >
                <Ionicons 
                  name={isGuest ? "log-in-outline" : "person-circle-outline"} 
                  size={36} 
                  color={theme.text} 
                />
              </Pressable>
            </View>

            {/* --- TAB SELECTOR (Hidden for Guests) --- */}
            {!isGuest && myBusinessId && (
              <View style={styles.tabsContainer}>
                <Pressable 
                  style={[styles.tabButton, activeTab === 'all' && styles.activeTab]}
                  onPress={() => setActiveTab('all')}
                >
                  <Text style={[styles.tabText, activeTab === 'all' && styles.activeTabText]}>
                    Global ({shifts.length})
                  </Text>
                </Pressable>
                <Pressable 
                  style={[styles.tabButton, activeTab === 'mine' && styles.activeTab]}
                  onPress={() => setActiveTab('mine')}
                >
                  <Text style={[styles.tabText, activeTab === 'mine' && styles.activeTabText]}>
                    My Workplace ({myShiftsCount})
                  </Text>
                </Pressable>
              </View>
            )}
            
            <View style={[styles.infoBox, { backgroundColor: theme.tint + "08" }]}>
               <Ionicons name="flash" size={18} color={theme.tint} />
               <Text style={[styles.infoText, { color: theme.text }]}>
                 {displayedShifts.length} {displayedShifts.length === 1 ? 'shift available' : 'shifts available'}
               </Text>
            </View>
          </View>
        )}
        renderItem={({ item }) => (
          <View style={styles.cardContainer}>
            <ShiftCard 
              item={item} 
              variant="worker" 
              onPress={() => router.push(`/(worker)/shift/${item.id}`)} 
            />
          </View>
        )}
        ListEmptyComponent={() => (
          !loading ? (
            <View style={styles.emptyBox}>
              <View style={styles.emptyIconCircle}>
                <Ionicons name="calendar-clear-outline" size={32} color="#94A3B8" />
              </View>
              <Text style={styles.emptyTitle}>No shifts found</Text>
              <Text style={styles.emptySubtitle}>
                {activeTab === 'mine' 
                  ? "There are no extra shifts currently posted for your specific hotel." 
                  : "The global marketplace is currently empty. Check back later!"}
              </Text>
            </View>
          ) : (
            <ActivityIndicator size="large" color={theme.tint} style={{ marginTop: 50 }} />
          )
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#FFFFFF' 
  },
  bgCircle: {
    position: 'absolute',
    width: width * 0.7,
    height: width * 0.7,
    borderRadius: width * 0.35,
    backgroundColor: '#F8FAFC',
    zIndex: -1,
  },
  listContent: { 
    paddingHorizontal: 24 
  },
  header: { 
    marginBottom: 28 
  },
  headerTop: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    marginBottom: 20 
  },
  businessBadge: { 
    fontSize: 11, 
    fontWeight: "800", 
    color: '#94A3B8', 
    letterSpacing: 1.5,
    marginBottom: 4 
  },
  mainTitle: { 
    fontSize: 34, 
    fontWeight: "900", 
    color: '#0F172A', 
    letterSpacing: -1.5 
  },
  profileBtn: { 
    backgroundColor: '#FFF',
    borderRadius: 50,
  },
  tabsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  tabButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  activeTab: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748B',
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  infoBox: {
    flexDirection: 'row',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    gap: 10
  },
  infoText: {
    fontSize: 14,
    fontWeight: '700'
  },
  cardContainer: { 
    marginBottom: 16 
  },
  emptyBox: { 
    marginTop: 60, 
    alignItems: 'center', 
    paddingHorizontal: 40 
  },
  emptyIconCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },
  emptyTitle: { 
    fontSize: 18, 
    fontWeight: '800', 
    color: '#1E293B' 
  },
  emptySubtitle: { 
    fontSize: 14, 
    color: '#64748B', 
    textAlign: 'center', 
    marginTop: 8,
    lineHeight: 20 
  }
});