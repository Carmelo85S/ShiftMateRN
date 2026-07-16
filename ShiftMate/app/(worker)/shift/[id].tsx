import { Colors } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Core Data Connections
import { supabase } from "@/lib/supabase";
import {
  applyForShift,
  cancelApplication,
  fetchShiftDetails,
} from "@/queries/workerQueries";

const { width } = Dimensions.get("window");

export default function WorkerShiftDetailPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme];
  const insets = useSafeAreaInsets();

  const [shift, setShift] = useState<any>(null);
  const [myApplication, setMyApplication] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadShiftData = useCallback(
    async (isRefresh = false) => {
      if (!id) return;
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      try {
        const shiftData = await fetchShiftDetails(id);
        setShift(shiftData);

        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session?.user) {
          setUser(session.user);
          const { data: appData } = await supabase
            .from("applications")
            .select("id, status")
            .eq("profile_id", session.user.id)
            .eq("shift_id", id)
            .maybeSingle();

          setMyApplication(appData || null);
        }
      } catch (error) {
        console.error("UI Fetch Error:", error);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [id],
  );

  useEffect(() => {
    loadShiftData();
  }, [id, loadShiftData]);

  if (loading && !refreshing) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="small" color={theme.text} />
      </View>
    );
  }

  if (!shift) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <Text style={[styles.errorText, { color: theme.secondaryText }]}>
          Shift asset missing or expired.
        </Text>
        <Pressable
          style={[styles.btnBack, { backgroundColor: theme.text }]}
          onPress={() => router.back()}
        >
          <Text style={{ color: theme.background, fontWeight: "700" }}>
            Return to Board
          </Text>
        </Pressable>
      </View>
    );
  }

  const appStatus = myApplication?.status
    ? String(myApplication.status).toLowerCase().trim()
    : null;
  const hasApplied = !!myApplication;

  const getSemanticStatus = () => {
    switch (appStatus) {
      case "accepted":
      case "approved":
        return {
          label: "Confirmed Assignment",
          color: "#10B981",
          bg: "#10B98110",
          icon: "shield-checkmark",
        };
      case "rejected":
        return {
          label: "Position Filled",
          color: "#EF4444",
          bg: "#EF444410",
          icon: "close-circle",
        };
      case "applied":
      case "pending":
        return {
          label: "Application Under Review",
          color: "#F59E0B",
          bg: "#F59E0B10",
          icon: "hourglass-sharp",
        };
      default:
        return null;
    }
  };

  const statusStyle = getSemanticStatus();

  const handleAction = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const currentUser = user || session?.user;

    if (!currentUser) {
      Alert.alert(
        "Worker Account Required",
        "Please authenticate to dispatch an assignment application request.",
      );
      return;
    }

    setIsSubmitting(true);
    try {
      if (hasApplied) {
        if (appStatus === "applied" || appStatus === "pending") {
          Alert.alert(
            "Withdrawal Confirmation",
            "Are you sure you want to retract your availability for this shift?",
            [
              { text: "Dismiss", style: "cancel" },
              {
                text: "Yes, Withdraw",
                style: "destructive",
                onPress: async () => {
                  await cancelApplication(myApplication.id);
                  Alert.alert(
                    "Retracted",
                    "Your application records have been removed.",
                  );
                  loadShiftData();
                },
              },
            ],
          );
        } else {
          Alert.alert(
            "State Locked",
            "This assignment status can no longer be updated manually.",
          );
        }
      } else {
        await applyForShift(currentUser.id, shift.id);
        Alert.alert(
          "Application Active",
          "Your professional profile has been shared with the manager.",
        );
        loadShiftData();
      }
    } catch (err: any) {
      Alert.alert(
        "Transaction Failed",
        "Could not synchronize server state. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // if the shift has a client_name (Staffing) use that, otherwise fall back to the fixed business info
  const venueName =
    shift.client_name || shift.businesses?.name || "The Plaza Elite Lounge";

  // If the shift has a manually entered address (Staffing) use that, otherwise fall back to the fixed business info
  const addressText =
    shift.address ||
    shift.businesses?.business_address ||
    "Via Montenapoleone 8";
  const cityText = shift.city || shift.businesses?.business_city || "Milano";

  // Combine address and city for a full display string
  const fullDisplayAddress = `${addressText}, ${cityText}`;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        bounces={true}
        contentContainerStyle={{ paddingBottom: insets.bottom + 140 }}
      >
        {/* CINEMATIC HERO HEADER */}
        <View style={styles.heroWrapper}>
          {shift.image_url ? (
            <Image source={{ uri: shift.image_url }} style={styles.heroImage} />
          ) : (
            <View
              style={[
                styles.heroPlaceholder,
                { backgroundColor: theme.text + "04" },
              ]}
            >
              <Ionicons name="sparkles-sharp" size={32} color={theme.tint} />
            </View>
          )}
          <View style={styles.heroOverlayGradient} />

          {/* TOP FLOATING METADATA */}
          <View style={[styles.topFloatRow, { top: insets.top + 60 }]}>
            <View
              style={[styles.pillBadge, { backgroundColor: "rgba(0,0,0,0.6)" }]}
            >
              <Text style={styles.pillText}>
                {shift.departments?.name || "GENERAL"}
              </Text>
            </View>
          </View>

          {/* LOWER HERO CONTENT METRICS */}
          <View style={styles.heroBottomAnchor}>
            <View style={styles.priceContainer}>
              <Text style={styles.priceOverline}>ESTIMATED EARNINGS</Text>
              <Text style={styles.priceText}>
                €{Number(shift.total_pay).toFixed(0)}
              </Text>
            </View>
          </View>
        </View>

        {/* CORE INTERFACE BODY SURFACE */}
        <View style={styles.surfaceBody}>
          <View style={styles.titleSection}>
            <Text style={[styles.mainTitle, { color: theme.text }]}>
              {shift.title}
            </Text>
            <View style={styles.venueRow}>
              <View
                style={[styles.venueIconRing, { borderColor: theme.border }]}
              >
                <Ionicons name="business" size={14} color={theme.text} />
              </View>
              <Text style={[styles.venueText, { color: theme.secondaryText }]}>
                {venueName}
              </Text>
            </View>
          </View>

          {/* DYNAMIC SEMANTIC SYSTEM STATE */}
          {statusStyle && (
            <View
              style={[
                styles.statusBannerContainer,
                {
                  backgroundColor: statusStyle.bg,
                  borderColor: statusStyle.color + "20",
                },
              ]}
            >
              <Ionicons
                name={statusStyle.icon as any}
                size={16}
                color={statusStyle.color}
              />
              <Text
                style={[styles.statusBannerLabel, { color: statusStyle.color }]}
              >
                {statusStyle.label}
              </Text>
            </View>
          )}

          {/* ASYMMETRIC LOGISTICS GRID COMPONENT */}
          <View style={styles.logisticsGrid}>
            <View style={[styles.gridCard, { backgroundColor: theme.card }]}>
              <Ionicons
                name="calendar-outline"
                size={18}
                color={theme.text}
                style={styles.cardIconSpace}
              />
              <Text
                style={[styles.gridOverline, { color: theme.secondaryText }]}
              >
                DATE
              </Text>
              <Text style={[styles.gridValue, { color: theme.text }]}>
                {new Date(shift.shift_date).toLocaleDateString("en-US", {
                  day: "2-digit",
                  month: "short",
                  weekday: "short",
                })}
              </Text>
            </View>

            <View style={[styles.gridCard, { backgroundColor: theme.card }]}>
              <Ionicons
                name="time-outline"
                size={18}
                color={theme.text}
                style={styles.cardIconSpace}
              />
              <Text
                style={[styles.gridOverline, { color: theme.secondaryText }]}
              >
                SCHEDULE
              </Text>
              <Text style={[styles.gridValue, { color: theme.text }]}>
                {shift.start_time?.slice(0, 5)} — {shift.end_time?.slice(0, 5)}
              </Text>
            </View>
          </View>

          <View style={[styles.longCard, { backgroundColor: theme.card }]}>
            <View style={styles.longCardLeft}>
              <View
                style={[
                  styles.subIconSquare,
                  { backgroundColor: theme.text + "08" },
                ]}
              >
                <Ionicons name="wallet-outline" size={18} color={theme.text} />
              </View>
              <View>
                <Text
                  style={[styles.gridOverline, { color: theme.secondaryText }]}
                >
                  RATE METRIC
                </Text>
                <Text style={[styles.gridValue, { color: theme.text }]}>
                  Hourly pay
                </Text>
              </View>
            </View>
            <Text style={[styles.rateHighlight, { color: theme.text }]}>
              €{Number(shift.hourly_rate).toFixed(2)}
              <Text style={styles.rateSub}>/hr</Text>
            </Text>
          </View>

          {/* VENUE LOCATION CARD */}
          <View style={styles.locationSection}>
            <Text style={[styles.proseHeader, { color: theme.text }]}>
              Workplace Location
            </Text>
            <Pressable
              style={({ pressed }) => [
                styles.addressCard,
                { backgroundColor: theme.card, borderColor: theme.border },
                pressed && styles.btnPressedScale,
              ]}
              onPress={() => {
                // Sincronizzazione precisa: unisce Nome Cliente/Locale + Indirizzo del Turno + Città del Turno
                const fullQuery = encodeURIComponent(
                  `${venueName} ${addressText} ${cityText}`,
                );
                const url = Platform.select({
                  ios: `maps:0,0?q=${fullQuery}`,
                  android: `geo:0,0?q=${fullQuery}`,
                });

                if (url) {
                  Linking.openURL(url).catch(() => {
                    Alert.alert(
                      "System Error",
                      "Could not route to native mapping interface.",
                    );
                  });
                }
              }}
            >
              <View
                style={[
                  styles.subIconSquare,
                  { backgroundColor: theme.text + "08" },
                ]}
              >
                <Ionicons name="location-sharp" size={18} color={theme.text} />
              </View>

              <View style={{ flex: 1 }}>
                <Text
                  style={[styles.gridValue, { color: theme.text }]}
                  numberOfLines={1}
                >
                  {venueName}
                </Text>
                <Text
                  style={[styles.addressText, { color: theme.secondaryText }]}
                  numberOfLines={1}
                >
                  {fullDisplayAddress}
                </Text>
              </View>

              <View
                style={[
                  styles.mapActionBadge,
                  { backgroundColor: theme.text + "10" },
                ]}
              >
                <Ionicons
                  name="navigate-outline"
                  size={12}
                  color={theme.text}
                />
                <Text style={[styles.mapActionText, { color: theme.text }]}>
                  Directions
                </Text>
              </View>
            </Pressable>
          </View>

          {/* ROLE DESCRIPTION PROSE LAYOUT */}
          {shift.description && (
            <View style={styles.proseSection}>
              <Text style={[styles.proseHeader, { color: theme.text }]}>
                Assignment Briefing
              </Text>
              <Text style={[styles.proseBody, { color: theme.secondaryText }]}>
                {shift.description}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* CONTINUOUS CONTEXT BASE FLOOR BUTTON */}
      <View
        style={[
          styles.stickyFooter,
          {
            backgroundColor: theme.background,
            paddingBottom: insets.bottom + 12,
            borderTopColor: theme.border,
          },
        ]}
      >
        <Pressable
          onPress={handleAction}
          disabled={
            isSubmitting ||
            (hasApplied && appStatus !== "applied" && appStatus !== "pending")
          }
          style={({ pressed }) => [
            styles.masterActionBtn,
            {
              backgroundColor: hasApplied
                ? appStatus === "applied" || appStatus === "pending"
                  ? "#EF4444"
                  : "#A1A1AA"
                : theme.text,
            },
            pressed && styles.btnPressedScale,
            hasApplied &&
              appStatus !== "applied" &&
              appStatus !== "pending" &&
              styles.btnDisabledState,
          ]}
        >
          {isSubmitting ? (
            <ActivityIndicator color={theme.background} size="small" />
          ) : (
            <View style={styles.btnInternalRow}>
              {!hasApplied && (
                <Ionicons
                  name="arrow-forward-circle-sharp"
                  size={20}
                  color={theme.background}
                />
              )}
              {hasApplied &&
                (appStatus === "applied" || appStatus === "pending") && (
                  <Ionicons name="close-circle-sharp" size={20} color="#FFF" />
                )}
              <Text
                style={[
                  styles.masterActionText,
                  { color: hasApplied ? "#FFF" : theme.background },
                ]}
              >
                {hasApplied
                  ? appStatus === "applied" || appStatus === "pending"
                    ? "Withdraw Position Availability"
                    : "Shift Roster Finalized"
                  : "Accept & Apply for Shift"}
              </Text>
            </View>
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  errorText: { fontSize: 16, fontWeight: "500", marginBottom: 16 },
  btnBack: {
    height: 46,
    paddingHorizontal: 20,
    borderRadius: 12,
    justifyContent: "center",
  },

  // Luxury Hero Layout Group
  heroWrapper: {
    width: width,
    height: 360,
    position: "relative",
    overflow: "hidden",
  },
  heroImage: { width: "100%", height: "100%", resizeMode: "cover" },
  heroPlaceholder: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  heroOverlayGradient: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  topFloatRow: {
    position: "absolute",
    left: 24,
    right: 24,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  pillBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  pillText: {
    color: "#FFF",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.5,
  },
  heroBottomAnchor: { position: "absolute", bottom: 32, left: 24, right: 24 },
  priceContainer: { alignSelf: "flex-start" },
  priceOverline: {
    color: "rgba(255,255,255,0.65)",
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 1.2,
    marginBottom: 2,
  },
  priceText: {
    color: "#FFF",
    fontSize: 40,
    fontWeight: "900",
    letterSpacing: -1,
  },

  // Typography & Structural Hierarchy Surface
  surfaceBody: { flex: 1, paddingHorizontal: 24, paddingTop: 28 },
  titleSection: { marginBottom: 24 },
  mainTitle: {
    fontSize: 26,
    fontWeight: "900",
    letterSpacing: -0.6,
    lineHeight: 32,
    marginBottom: 10,
  },
  venueRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  venueIconRing: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  venueText: { fontSize: 14, fontWeight: "600", letterSpacing: -0.1 },

  // Native Minimal Banner Status UI
  statusBannerContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 26,
  },
  statusBannerLabel: {
    fontWeight: "800",
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },

  // Geometric Matrix System Cards
  logisticsGrid: { flexDirection: "row", gap: 12, marginBottom: 12 },
  gridCard: {
    flex: 1,
    padding: 16,
    borderRadius: 18,
    alignItems: "flex-start",
    borderBottomWidth: 1,
    borderColor: "rgba(0,0,0,0.015)",
  },
  cardIconSpace: { marginBottom: 12, opacity: 0.8 },
  gridOverline: {
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 1,
    marginBottom: 3,
  },
  gridValue: { fontSize: 14, fontWeight: "800", letterSpacing: -0.2 },

  longCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 20,
    marginBottom: 24,
  },
  longCardLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  subIconSquare: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  rateHighlight: { fontSize: 20, fontWeight: "900", letterSpacing: -0.5 },
  rateSub: { fontSize: 12, fontWeight: "600", opacity: 0.6 },

  // Workplace Location Suite Components
  locationSection: { marginBottom: 32 },
  addressCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 20,
    borderWidth: 1,
    gap: 12,
  },
  addressText: { fontSize: 13, fontWeight: "500", marginTop: 1, opacity: 0.75 },
  mapActionBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  mapActionText: {
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },

  // Editorial Prose Content Controls
  proseSection: { marginBottom: 20 },
  proseHeader: {
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: -0.2,
    marginBottom: 10,
  },
  proseBody: { fontSize: 15, lineHeight: 24, fontWeight: "400", opacity: 0.85 },

  // Master Absolute Continuous Floor Base
  stickyFooter: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingTop: 14,
    borderTopWidth: 1,
  },
  masterActionBtn: {
    height: 58,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  btnPressedScale: { opacity: 0.85, transform: [{ scale: 0.98 }] },
  btnDisabledState: { opacity: 0.4 },
  btnInternalRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  masterActionText: { fontSize: 15, fontWeight: "900", letterSpacing: 0.2 },
});
