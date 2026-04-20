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
import { ShiftCard } from "@/components/shiftCard/ShiftCard";
import { fetchGlobalShifts } from "@/queries/workerQueries";

const { width } = Dimensions.get("window");

// --- DEFINIZIONE TIPO AGGIORNATA ---
type Shift = {
  id: string;
  title: string;
  shift_date: string;
  start_time: string;
  end_time: string;
  image_url: string | null;
  business_id: string;
  total_pay: number;    // Necessario per la nuova Card
  hourly_rate: number;  // Necessario per la nuova Card
  department: string;   // Necessario per la nuova Card
};

export default function WorkerShifts() {
  const theme = Colors.light;
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isGuest, setIsGuest] = useState(true);

  const loadShiftsBoard = useCallback(async () => {
    try {
      // 1. Controllo Sessione
      const { data: { session } } = await supabase.auth.getSession();
      setIsGuest(!session);

      // 2. Fetch dei turni globali dal marketplace
      const shiftsData = await fetchGlobalShifts();

      // 3. Normalizzazione dei dati con i nuovi campi economici
      const normalized: Shift[] = (shiftsData || []).map((s: any) => ({
        id: String(s.id),
        title: s.title,
        shift_date: s.shift_date,
        start_time: s.start_time,
        end_time: s.end_time,
        image_url: s.image_url ?? null,
        business_id: s.business_id ?? (s.businesses?.id) ?? '',
        // Mappatura nuovi campi dal database
        total_pay: Number(s.total_pay) || 0,
        hourly_rate: Number(s.hourly_rate) || 0,
        department: s.department || 'hospitality'
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

  const onRefresh = () => {
    setRefreshing(true);
    loadShiftsBoard();
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Elemento decorativo di sfondo */}
      <View style={[styles.bgCircle, { top: -width * 0.1, right: -width * 0.1 }]} />
      
      <FlatList
        data={shifts}
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
                  {isGuest ? "OPEN MARKETPLACE" : "DASHBOARD"}
                </Text>
                <Text style={styles.mainTitle} numberOfLines={1}>
                  {isGuest ? "Opportunities" : "Job Board"}
                </Text>
              </View>
              <Pressable 
                style={styles.profileBtn} 
                onPress={() => isGuest ? router.push("/") : router.push("/profile")}
              >
                <Ionicons 
                  name={isGuest ? "log-in-outline" : "person-circle-outline"} 
                  size={36} 
                  color={theme.text} 
                />
              </Pressable>
            </View>
            
            {/* Box informativo con conteggio dinamico */}
            <View style={[styles.infoBox, { backgroundColor: theme.tint + "08" }]}>
               <Ionicons 
                 name="flash" 
                 size={18} 
                 color={theme.tint} 
               />
               <Text style={[styles.infoText, { color: theme.text }]}>
                 {shifts.length} {shifts.length === 1 ? 'shift available' : 'shifts available'} for you
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
                {isGuest 
                  ? "The marketplace is empty at the moment. Check back later!" 
                  : "No shifts currently available for your business."}
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