import { ScreenHeader } from "@/components/shared/Header";
import { Colors } from "@/constants/theme";
import { useSetupBusiness } from "@/hooks/manager/useSetupBusiness";
import { supabase } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useFocusEffect, useLocalSearchParams } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface Plan {
  id: string;
  name: string;
  price: string;
  mode: Mode;
  visible_to: string[];
  kpi: string;
  icon: string;
  isBest: boolean;
  desc: string;
}

const PLANS = [
  {
    id: "price_1TdRTrPf9BDNyCapNvDt0Cxt",
    name: "Essential",
    price: "1490 SEK",
    mode: "subscription",
    visible_to: ["owner"],
    desc: "Up to 3 managers. Perfect for small teams starting to scale operations.",
    kpi: "ESSENTIAL",
    icon: "infinite-outline",
    isBest: false,
  },
  {
    id: "price_1TdpUqPf9BDNyCaphUprM3xC",
    name: "Growth",
    price: "2990 SEK",
    mode: "subscription",
    visible_to: ["owner"],
    desc: "Up to 10 managers. Built for growing teams that need structure and control.",
    kpi: "GROWTH",
    icon: "trending-up-outline",
    isBest: true,
  },
  {
    id: "price_1TdpVXPf9BDNyCapRO9apxU0",
    name: "Scale",
    price: "5990 SEK",
    mode: "subscription",
    visible_to: ["owner"],
    desc: "Unlimited managers. Designed for companies operating at full scale.",
    kpi: "SCALE",
    icon: "rocket-outline",
    isBest: false,
  },
  {
    id: "price_1Th5NLPf9BDNyCapAFoF8oNT",
    name: "Solo Starter",
    price: "600 SEK",
    mode: "payment",
    visible_to: ["owner"],
    desc: "Ideal for individual managers and micro-teams.",
    kpi: "SOLO",
    icon: "person-outline",
    isBest: false,
  },
  {
    id: "price_1TdRUfPf9BDNyCap2gvWBsOm",
    name: "Quick Start",
    price: "390 SEK",
    mode: "payment",
    visible_to: ["owner"],
    desc: "1 job access for 14 days. Ideal for quick hiring needs.",
    kpi: "STARTER",
    icon: "wallet-outline",
    isBest: false,
  },
  {
    id: "price_1TdpSEPf9BDNyCapTpA1yPPY",
    name: "Flexi Pack",
    price: "1500 SEK",
    mode: "payment",
    visible_to: ["owner"],
    desc: "2 job posts within 30 days. Flexible hiring for short cycles.",
    kpi: "FLEXI",
    icon: "wallet-outline",
    isBest: false,
  },
  {
    id: "price_1TdpTlPf9BDNyCapsKtthz8K",
    name: "Business Flow",
    price: "3000 SEK",
    mode: "payment",
    visible_to: ["owner"],
    desc: "3 job posts within 30 days. Best for active recruiting teams.",
    kpi: "FLOW",
    icon: "wallet-outline",
    isBest: false,
  },

  // --- CLIENT PLANS (Manager) ---
  {
    id: "price_1Th6QJPf9BDNyCapiMgf1ymA",
    name: "Client Base",
    price: "490 SEK",
    mode: "subscription",
    visible_to: ["manager"],
    desc: "5 job posts/month. Pro access.",
    kpi: "BASE",
    icon: "person-outline",
    isBest: false,
  },
  {
    id: "price_1Th6RYPf9BDNyCapWULFtVa5",
    name: "Client Pro",
    price: "990 SEK",
    mode: "subscription",
    visible_to: ["manager"],
    desc: "15 job posts/month. Advanced recruiting.",
    kpi: "PRO",
    icon: "trending-up-outline",
    isBest: true,
  },
  {
    id: "price_1Th6SSPf9BDNyCapNeGQHOLw",
    name: "Client Starter",
    price: "190 SEK",
    mode: "payment",
    visible_to: ["manager"],
    desc: "1 extra job post. Quick and easy.",
    kpi: "STARTER",
    icon: "wallet-outline",
    isBest: false,
  },
  {
    id: "price_1Th6UsPf9BDNyCappYyGgGG7",
    name: "Client Booster",
    price: "790 SEK",
    mode: "payment",
    visible_to: ["manager"],
    desc: "15 extra job posts. High volume.",
    kpi: "BOOSTER",
    icon: "wallet-outline",
    isBest: false,
  },
];

type Mode = "subscription" | "payment";

export default function SubscriptionScreen() {
  const { businessId } = useLocalSearchParams<{ businessId: string }>();
  const { userRole } = useLocalSearchParams<{
    userRole: "owner" | "manager";
  }>();
  const { handlePayment, loading } = useSetupBusiness();
  const [isVerifying, setIsVerifying] = useState(false);
  const [mode, setMode] = useState<Mode>("subscription");

  const theme = Colors.light;
  const insets = useSafeAreaInsets();

  const [userId, setUserId] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      supabase.auth.getUser().then(({ data }) => {
        setUserId(data.user?.id || null);
      });
    }, []),
  );

  const filteredPlans = useMemo(() => {
    const role = userRole;
    const filtered = PLANS.filter(
      (p) => p.mode === mode && p.visible_to.includes(role),
    );

    console.log("DEBUG - UserRole:", role);
    console.log("DEBUG - Mode:", mode);
    console.log("DEBUG - Plans Count:", filtered.length);

    return filtered;
  }, [mode, userRole]);

  const checkSubscriptionStatus = useCallback(async () => {
    if (!businessId) return;
    setIsVerifying(true);
    const { data } = await supabase
      .from("businesses")
      .select("is_active_subscriber")
      .eq("id", businessId)
      .single();

    setIsVerifying(false);
  }, [businessId]);

  useFocusEffect(
    useCallback(() => {
      checkSubscriptionStatus();
    }, [checkSubscriptionStatus]),
  );

  if (isVerifying) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={theme.tint} />
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={[styles.container, { paddingTop: insets.top + 50 }]}>
        <ScreenHeader kpi="UPGRADE" title="Choose your plan" theme={theme} />

        <View style={styles.toggle}>
          <View style={styles.toggleInner}>
            {(["subscription", "payment"] as Mode[]).map((item) => {
              const active = mode === item;
              return (
                <Pressable
                  key={item}
                  onPress={() => setMode(item)}
                  style={[
                    styles.toggleBtn,
                    active && { backgroundColor: theme.text },
                  ]}
                >
                  <Text
                    style={[styles.toggleText, active && { color: "#fff" }]}
                  >
                    {item === "subscription" ? "Subscription" : "Payment"}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <FlatList
          data={filteredPlans}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => {
                if (userId) {
                  handlePayment(item.id, businessId, item.mode as Mode, userId); // <--- Passa userId qui
                }
              }}
              style={[styles.card, item.isBest && { borderColor: theme.tint }]}
            >
              {item.isBest && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>MOST POPULAR</Text>
                </View>
              )}
              <View style={styles.row}>
                <Text style={styles.kpi}>{item.kpi}</Text>
                <Ionicons
                  name={item.icon as any}
                  size={20}
                  color={theme.text}
                />
              </View>
              <Text style={styles.title}>{item.name}</Text>
              <Text style={styles.price}>{item.price}</Text>
              <Text style={styles.desc}>{item.desc}</Text>
            </Pressable>
          )}
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20 },
  loader: { flex: 1, justifyContent: "center", alignItems: "center" },
  toggle: { marginBottom: 18 },
  toggleInner: {
    flexDirection: "row",
    backgroundColor: "rgba(0,0,0,0.05)",
    borderRadius: 16,
    padding: 4,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: "center",
  },
  toggleText: { fontSize: 13, fontWeight: "700", color: "#444" },
  card: {
    borderRadius: 22,
    padding: 20,
    marginBottom: 14,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.04)",
  },
  row: { flexDirection: "row", justifyContent: "space-between" },
  kpi: { fontSize: 11, fontWeight: "800", opacity: 0.5 },
  title: { fontSize: 18, fontWeight: "800", marginTop: 6 },
  price: { fontSize: 24, fontWeight: "900", marginTop: 4 },
  desc: { fontSize: 13, opacity: 0.6, marginTop: 6 },
  badge: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "#111",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  badgeText: { color: "#fff", fontSize: 10, fontWeight: "700" },
});
