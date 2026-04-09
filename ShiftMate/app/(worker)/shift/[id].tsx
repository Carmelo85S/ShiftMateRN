import { Colors } from "@/constants/theme";
import { supabase } from "@/lib/supabase";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons"; 
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ShiftDetail() {
  const { id } = useLocalSearchParams();
  const theme = Colors.light;
  const insets = useSafeAreaInsets();

  const [shift, setShift] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [applied, setApplied] = useState<boolean | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: userData } = await supabase.auth.getUser();
        const user = userData.user;

        // 1. Fetch shift
        const { data: shiftData, error } = await supabase
          .from("shifts")
          .select("*")
          .eq("id", id)
          .single();

        if (error || !shiftData) {
          console.error(error);
          setLoading(false);
          return;
        }

        setShift(shiftData);

        // 2. Check application
        if (user) {
          const { data: application } = await supabase
            .from("applications")
            .select("id")
            .eq("shift_id", shiftData.id)
            .eq("profile_id", user.id)
            .maybeSingle();

          setApplied(!!application);
        } else {
          setApplied(false);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatDate = (date: string) => {
    const d = new Date(date);
    return d.toLocaleDateString("en-GB", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
  };

  const handleApply = async () => {
    if (!shift) return;

    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;

    if (!user) return;

    const { error } = await supabase.from("applications").insert({
      shift_id: shift.id,
      profile_id: user.id,
    });

    if (error) {
      console.error(error);
      return;
    }

    // 👇 update immediato UI (optimistic)
    setApplied(true);
    console.log("Application sent!");
    router.push(`/(worker)/(tabs)/shifts`);
  };

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.tint} />
      </View>
    );
  }

  if (!shift) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <Text style={{ color: theme.text }}>Shift not found</Text>
      </View>
    );
  }

    return (
        <View style={{ flex: 1, backgroundColor: theme.background, paddingTop: insets.top  }}>

          <View style={[styles.container, { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 20 }]}>
            
            {/* HEADER AREA */}
            <View style={styles.header}>
              <Text style={[styles.kpi, { color: theme.tint }]}>AVAILABLE POSITION</Text>
              <Text style={[styles.title, { color: theme.text }]}>{shift?.title}</Text>
            </View>

            {/* INFO GRID - Stile Moderno Flat */}
            <View style={styles.detailsBox}>
              <DetailRow 
                icon="calendar-outline" 
                label="Date" 
                value={formatDate(shift?.shift_date)} 
                theme={theme} 
              />
              <DetailRow 
                icon="time-outline" 
                label="Schedule" 
                value={`${shift?.start_time.slice(0, 5)} — ${shift?.end_time.slice(0, 5)}`} 
                theme={theme} 
              />
              <DetailRow 
                icon="location-outline" 
                label="Location" 
                value="On-site HQ" 
                theme={theme} 
              />
            </View>

            <View style={{ flex: 1 }} />

            {/* BOTTONE D'AZIONE - Stile Solid Brand */}
            <Pressable
              disabled={applied === null || applied}
              onPress={handleApply}
              style={({ pressed }) => [
                styles.applyButton,
                {
                  backgroundColor: applied ? theme.secondaryText : theme.text,
                  opacity: pressed ? 0.8 : 1,
                  transform: [{ scale: pressed ? 0.98 : 1 }]
                },
              ]}
            >
              {applied ? (
                <View style={styles.btnContent}>
                  <Ionicons name="checkmark-circle" size={20} color={theme.background} />
                  <Text style={[styles.applyText, { color: theme.background }]}>APPLICATION SENT</Text>
                </View>
              ) : (
                <Text style={[styles.applyText, { color: theme.background }]}>APPLY NOW</Text>
              )}
            </Pressable>
          </View>
        </View>
      );
    }

const DetailRow = ({ icon, label, value, theme }: any) => (
  <View style={[styles.detailRow, { borderBottomColor: theme.border }]}>
    <View style={[styles.iconBox, { backgroundColor: theme.card }]}>
      <Ionicons name={icon} size={22} color={theme.text} />
    </View>
    <View>
      <Text style={[styles.detailLabel, { color: theme.secondaryText }]}>{label.toUpperCase()}</Text>
      <Text style={[styles.detailValue, { color: theme.text }]}>{value}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  backButton: {
  marginLeft: 10,
  width: 40,
  height: 40,
  justifyContent: 'center',
  alignItems: 'center',
},
  container: { flex: 1, paddingHorizontal: 25 },
  header: { marginBottom: 40 },
  kpi: { fontSize: 11, fontWeight: "900", letterSpacing: 2, marginBottom: 8 },
  title: { fontSize: 42, fontWeight: "900", letterSpacing: -2, lineHeight: 45 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  detailsBox: { gap: 0 },
  detailRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingVertical: 20, 
    borderBottomWidth: 1,
    gap: 16 
  },
  iconBox: { 
    width: 48, 
    height: 48, 
    borderRadius: 16, 
    justifyContent: 'center', 
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB'
  },
  detailLabel: { fontSize: 10, fontWeight: "800", letterSpacing: 1 },
  detailValue: { fontSize: 18, fontWeight: "700" },

  applyButton: {
    height: 64,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
  },
  btnContent: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  applyText: { fontSize: 16, fontWeight: "900", letterSpacing: 1 },
});