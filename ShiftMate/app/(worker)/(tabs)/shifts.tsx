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
import { LinearGradient } from "expo-linear-gradient";

const { width } = Dimensions.get("window");

type Shift = {
  id: string;
  title: string;
  shift_date: string;
  start_time: string;
  end_time: string;
  image_url: string | null;
  hotel_id: string;
};

export default function WorkerShifts() {
  const theme = Colors.light;
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [hotelName, setHotelName] = useState("Il Tuo Hotel");

  const fetchShifts = useCallback(async () => {
    try {
      const { data: authData } = await supabase.auth.getUser();
      const user = authData.user;
      if (!user) return;

      // 1. Recupero hotel_id e solo il NAME dalla tabella hotels (visto che city non esiste)
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select(`
          hotel_id, 
          hotels (
            name
          )
        `)
        .eq("id", user.id)
        .single();

      if (profileError) throw profileError;

      if (profile) {
        // TypeScript fix per l'oggetto hotels
        const hotelData = profile.hotels as any;
        setHotelName(hotelData?.name || "Il Tuo Hotel");
        
        // 2. Recupero turni filtrati per hotel
        const { data: shiftsData, error: shiftsError } = await supabase
          .from("shifts")
          .select("*")
          .eq("status", "open")
          .eq("hotel_id", profile.hotel_id)
          .gte("shift_date", new Date().toISOString().split("T")[0])
          .order("shift_date", { ascending: true });

        if (shiftsError) throw shiftsError;
        setShifts(shiftsData as Shift[]);
      }
    } catch (err: any) {
      console.error("WorkerShifts Error:", err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchShifts();
  }, [fetchShifts]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchShifts();
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Background soft decoration */}
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
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.tint} />
        }
        ListHeaderComponent={() => (
          <View style={styles.header}>
            <View style={styles.headerTop}>
              <View style={{ flex: 1 }}>
                <Text style={styles.hotelBadge}>{hotelName.toUpperCase()}</Text>
                <Text style={styles.mainTitle} numberOfLines={1}>Shifts board</Text>
              </View>
              <Pressable 
                style={styles.profileBtn} 
                onPress={() => router.push("/profile")}
              >
                <Ionicons name="person-circle-outline" size={40} color={theme.text} />
              </Pressable>
            </View>
            
            {/* Pannello info rapida */}
            <View style={styles.infoBox}>
               <Ionicons name="information-circle-outline" size={20} color={theme.tint} />
               <Text style={styles.infoText}>
                 You have {shifts.length} {shifts.length === 1 ? 'shift available' : 'shifts available'} today
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
              <Text style={styles.emptyTitle}>No shift available</Text>
              <Text style={styles.emptySubtitle}>
                Currently, there are no shifts loaded by the manager of {hotelName}.
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
  container: { flex: 1, backgroundColor: '#FFFFFF', paddingTop: 30 },
  bgCircle: {
    position: 'absolute',
    width: width * 0.7,
    height: width * 0.7,
    borderRadius: width * 0.35,
    backgroundColor: '#F8FAFC',
    zIndex: -1,
  },
  listContent: { paddingHorizontal: 24 },
  header: { marginBottom: 28 },
  headerTop: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    marginBottom: 20 
  },
  hotelBadge: { 
    fontSize: 11, 
    fontWeight: "800", 
    color: '#94A3B8', 
    letterSpacing: 1.5,
    marginBottom: 4 
  },
  mainTitle: { 
    fontSize: 36, 
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
    backgroundColor: '#F1F5F9',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    gap: 10
  },
  infoText: {
    fontSize: 14,
    color: '#334155',
    fontWeight: '600'
  },
  cardContainer: { marginBottom: 16 },
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
  emptyTitle: { fontSize: 18, fontWeight: '800', color: '#1E293B' },
  emptySubtitle: { 
    fontSize: 14, 
    color: '#64748B', 
    textAlign: 'center', 
    marginTop: 8,
    lineHeight: 20 
  },
  bottomGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
    pointerEvents: 'none',
  }
});