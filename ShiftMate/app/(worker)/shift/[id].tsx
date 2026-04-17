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
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons"; 
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { applyForShift, checkApplicationStatus, fetchShiftDetails } from "@/queries/workerQueries";

export default function ShiftDetail() {
  const { id } = useLocalSearchParams();
  const theme = Colors.light;
  const insets = useSafeAreaInsets();

  const [shift, setShift] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [applicationStatus, setApplicationStatus] = useState<string | null>(null);
  const [isGuest, setIsGuest] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        // 1. Fetch Shift Details (Public - now includes business join)
        const shiftData = await fetchShiftDetails(id as string);
        setShift(shiftData);

        // 2. Check User Session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          setIsGuest(false);
          // 3. Check application status only if logged in
          const status = await checkApplicationStatus(session.user.id, id as string);
          if (status) setApplicationStatus(status.status);
        }
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id]);

  const handleApply = async () => {
    if (isGuest) {
      Alert.alert(
        "Interested?",
        "Sign up to apply for this shift and start earning.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Sign Up", onPress: () => router.push("/") }
        ]
      );
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await applyForShift(user.id, id as string);
        setApplicationStatus("applied"); // Consistent with DB constraint
      }
    } catch (err) {
      console.error("Apply error:", err);
    }
  };

  const getButtonConfig = () => {
    switch (applicationStatus) {
      case 'accepted':
        return { label: "Shift Confirmed", color: "#10b981", icon: "checkmark-done" };
      case 'rejected':
        return { label: "Not Selected", color: "#ef4444", icon: "close-circle" };
      case 'applied':
        return { label: "Application Pending", color: "#f59e0b", icon: "hourglass" };
      default:
        return { label: "Apply Now", color: theme.text, icon: "arrow-forward" };
    }
  };

  const config = getButtonConfig();

  if (loading) return (
    <View style={styles.center}><ActivityIndicator size="large" color={theme.tint} /></View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <Stack.Screen options={{ headerTransparent: true, headerTitle: "", headerTintColor: "#FFF" }} />

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        <View style={styles.heroContainer}>
          {shift?.image_url ? (
            <Image source={{ uri: shift.image_url }} style={styles.heroImage} />
          ) : (
            <View style={[styles.heroImage, { backgroundColor: '#333' }]} />
          )}
          <View style={styles.heroOverlay} />
          <View style={styles.heroContent}>
             <View style={[styles.badge, { backgroundColor: theme.tint }]}>
                <Text style={styles.badgeText}>{shift?.department?.toUpperCase() || "STAFF"}</Text>
             </View>
             <Text style={styles.heroTitle}>{shift?.title}</Text>
          </View>
        </View>

        <View style={[styles.mainContent, { backgroundColor: theme.background }]}>
          <View style={styles.detailsBox}>
            <DetailRow 
              icon="calendar-outline" 
              label="Date" 
              theme={theme}
              value={shift?.shift_date ? new Date(shift.shift_date).toLocaleDateString("en-US", { weekday: 'long', day: 'numeric', month: 'long' }) : "Loading..."} 
            />
            <DetailRow 
              icon="time-outline" 
              label="Schedule" 
              theme={theme}
              value={shift?.start_time ? `${shift.start_time.slice(0, 5)} — ${shift.end_time.slice(0, 5)}` : "--:--"} 
            />
            <DetailRow 
              icon="business-outline" 
              label="Workplace" 
              value={shift?.businesses?.name || "Premium Venue"} 
              theme={theme} 
            />
            {!!shift?.hourly_rate && (
              <DetailRow 
                icon="cash-outline" 
                label="Hourly Rate" 
                value={`€${shift.hourly_rate} / hr`} 
                theme={theme} 
              />
            )}
          </View>

          <View style={styles.descriptionSection}>
            <Text style={[styles.descriptionLabel, { color: theme.secondaryText }]}>DESCRIPTION</Text>
            <Text style={[styles.descriptionText, { color: theme.text }]}>
              {shift?.description || "No specific description available for this shift."}
            </Text>
          </View>
          <View style={{ height: 140 }} />
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 20, backgroundColor: theme.background }]}>
        <Pressable
          disabled={applicationStatus !== null}
          onPress={handleApply}
          style={({ pressed }) => [
            styles.applyButton,
            {
              backgroundColor: config.color,
              opacity: (pressed || applicationStatus) ? 0.8 : 1,
              transform: [{ scale: (pressed && !applicationStatus) ? 0.98 : 1 }]
            },
          ]}
        >
          <View style={styles.btnContent}>
            {config.icon && <Ionicons name={config.icon as any} size={22} color="#FFF" />}
            <Text style={[styles.applyText, { color: "#FFF" }]}>{config.label}</Text>
          </View>
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
  heroContainer: { height: 350, width: '100%' },
  heroImage: { width: '100%', height: '100%' },
  heroOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.4)' },
  heroContent: { position: 'absolute', bottom: 60, left: 25, right: 25 },
  heroTitle: { color: '#FFF', fontSize: 38, fontWeight: '900', letterSpacing: -1.5, lineHeight: 40 },
  badge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, marginBottom: 12 },
  badgeText: { color: '#FFF', fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  mainContent: { flex: 1, marginTop: -30, borderTopLeftRadius: 32, borderTopRightRadius: 32, paddingHorizontal: 25, paddingTop: 35 },
  detailsBox: { marginBottom: 35 },
  detailRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 18, borderBottomWidth: 1, gap: 16 },
  iconBox: { width: 48, height: 48, borderRadius: 16, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#F3F4F6' },
  detailLabel: { fontSize: 10, fontWeight: "800", letterSpacing: 1, marginBottom: 2 },
  detailValue: { fontSize: 17, fontWeight: "700" },
  descriptionSection: { marginTop: 10 },
  descriptionLabel: { fontSize: 10, fontWeight: "800", letterSpacing: 1.5, marginBottom: 12 },
  descriptionText: { fontSize: 16, lineHeight: 25, fontWeight: "400", opacity: 0.7 },
  footer: { position: 'absolute', bottom: 0, width: '100%', paddingHorizontal: 25, paddingTop: 15, borderTopWidth: 1, borderTopColor: '#F3F4F6' },
  applyButton: { height: 64, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  btnContent: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  applyText: { fontSize: 16, fontWeight: "900", letterSpacing: 1 },
});