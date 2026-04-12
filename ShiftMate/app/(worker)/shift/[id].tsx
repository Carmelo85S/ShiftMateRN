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
  ScrollView,
  Image,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons"; 
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

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
  }, [id]);

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

    setApplied(true);
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
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <Stack.Screen options={{ 
        headerTransparent: true, 
        headerTitle: "", 
        headerTintColor: "#FFF" 
      }} />

      <ScrollView 
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
      >
        {/* HERO IMAGE SECTION */}
        <View style={styles.heroContainer}>
          {shift?.image_url ? (
            <Image source={{ uri: shift.image_url }} style={styles.heroImage} />
          ) : (
            <View style={[styles.heroImage, { backgroundColor: theme.text + "10" }]} />
          )}
          <View style={styles.heroOverlay} />
          <View style={[styles.heroContent, { paddingBottom: 60 }]}>
             <View style={[styles.badge, { backgroundColor: theme.tint }]}>
                <Text style={styles.badgeText}>{shift?.department?.toUpperCase() || "STAFF"}</Text>
             </View>
             <Text style={styles.heroTitle}>{shift?.title}</Text>
          </View>
        </View>

        {/* CONTENT BOX (overlap) */}
        <View style={[styles.mainContent, { backgroundColor: theme.background }]}>
          {/* INFO GRID */}
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
              icon="business-outline" 
              label="Workplace" 
              value="On-site HQ" 
              theme={theme} 
            />
          </View>

          {/* JOB DESCRIPTION SECTION */}
          <View style={styles.descriptionSection}>
            <Text style={[styles.descriptionLabel, { color: theme.secondaryText }]}>JOB DESCRIPTION</Text>
            <Text style={[styles.descriptionText, { color: theme.text }]}>
              {shift?.description || "No additional description provided for this emergency shift."}
            </Text>
          </View>
          
          {/* Spazio extra per non coprire il testo con il footer fisso */}
          <View style={{ height: 120 }} />
        </View>
      </ScrollView>

      {/* BOTTONE D'AZIONE FISSO IN BASSO */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 20, backgroundColor: theme.background }]}>
        <Pressable
          disabled={applied === null || applied}
          onPress={handleApply}
          style={({ pressed }) => [
            styles.applyButton,
            {
              backgroundColor: applied ? "#E5E7EB" : theme.text,
              opacity: pressed ? 0.8 : 1,
              transform: [{ scale: pressed ? 0.98 : 1 }]
            },
          ]}
        >
          {applied ? (
            <View style={styles.btnContent}>
              <Ionicons name="checkmark-circle" size={20} color={theme.secondaryText} />
              <Text style={[styles.applyText, { color: theme.secondaryText }]}>APPLICATION SENT</Text>
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
    <View style={{ flex: 1 }}>
      <Text style={[styles.detailLabel, { color: theme.secondaryText }]}>{label.toUpperCase()}</Text>
      <Text style={[styles.detailValue, { color: theme.text }]}>{value}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  
  // HERO STYLES
  heroContainer: { height: 350, width: '100%' },
  heroImage: { width: '100%', height: '100%' },
  heroOverlay: { 
    ...StyleSheet.absoluteFillObject, 
    backgroundColor: 'rgba(0,0,0,0.4)' 
  },
  heroContent: { 
    position: 'absolute', 
    bottom: 0, 
    left: 25, 
    right: 25 
  },
  heroTitle: { 
    color: '#FFF', 
    fontSize: 38, 
    fontWeight: '900', 
    letterSpacing: -1.5,
    lineHeight: 40 
  },
  badge: { 
    alignSelf: 'flex-start', 
    paddingHorizontal: 10, 
    paddingVertical: 5, 
    borderRadius: 8, 
    marginBottom: 12 
  },
  badgeText: { color: '#FFF', fontSize: 10, fontWeight: '800', letterSpacing: 1 },

  // MAIN CONTENT OVERLAP
  mainContent: { 
    flex: 1, 
    marginTop: -30, 
    borderTopLeftRadius: 32, 
    borderTopRightRadius: 32, 
    paddingHorizontal: 25,
    paddingTop: 35 
  },

  detailsBox: { marginBottom: 35 },
  detailRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingVertical: 18, 
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
    borderColor: '#F3F4F6'
  },
  detailLabel: { fontSize: 10, fontWeight: "800", letterSpacing: 1, marginBottom: 2 },
  detailValue: { fontSize: 17, fontWeight: "700" },

  descriptionSection: { marginTop: 10 },
  descriptionLabel: { fontSize: 10, fontWeight: "800", letterSpacing: 1.5, marginBottom: 12 },
  descriptionText: { 
    fontSize: 16, 
    lineHeight: 25, 
    fontWeight: "400", 
    opacity: 0.7 
  },

  footer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    paddingHorizontal: 25,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6'
  },
  applyButton: {
    height: 64,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnContent: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  applyText: { fontSize: 16, fontWeight: "900", letterSpacing: 1 },
});