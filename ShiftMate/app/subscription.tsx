import React, { useCallback, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSetupBusiness } from "@/hooks/manager/useSetupBusiness";
import { router, Stack, useFocusEffect, useLocalSearchParams } from "expo-router";
import { Colors } from "@/constants/theme";
import { supabase } from "@/lib/supabase";
import { ScreenHeader } from "@/components/shared/Header";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const PLANS = [
  {
    id: "price_1TdRTrPf9BDNyCapNvDt0Cxt",
    name: "Essential",
    price: "1490 SEK",
    mode: "subscription",
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
    desc: "Unlimited managers. Designed for companies operating at full scale.",
    kpi: "SCALE",
    icon: "rocket-outline",
    isBest: false,
  },

  {
    id: "price_1TdRUfPf9BDNyCap2gvWBsOm",
    name: "Quick Start",
    price: "390 SEK",
    mode: "payment",
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
    desc: "3 job posts within 30 days. Best for active recruiting teams.",
    kpi: "FLOW",
    icon: "wallet-outline",
    isBest: false,
  },
];

type Mode = "subscription" | "payment";

export default function SubscriptionScreen() {
  const { businessId } = useLocalSearchParams<{ businessId: string }>();
  const { handlePayment, loading } = useSetupBusiness();
  const [isVerifying, setIsVerifying] = useState(false);
  const [mode, setMode] = useState<Mode>("subscription");

  const theme = Colors.light;
  const insets = useSafeAreaInsets();

  const filteredPlans = useMemo(
    () => PLANS.filter((p) => p.mode === mode),
    [mode]
  );

  const checkSubscriptionStatus = useCallback(async () => {
    if (!businessId) return;

    setIsVerifying(true);

    const { data } = await supabase
      .from("businesses")
      .select("is_active_subscriber")
      .eq("id", businessId)
      .single();

    if (data?.is_active_subscriber) {
      router.replace("/dashboard");
    }

    setIsVerifying(false);
  }, [businessId]);

  useFocusEffect(
    useCallback(() => {
      checkSubscriptionStatus();
    }, [checkSubscriptionStatus])
  );

  const handlePress = (plan: any) => {
    if (!businessId) return;
    handlePayment(plan.id, businessId, plan.mode);
  };

  if (isVerifying) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={theme.tint} />
        <Text style={{ marginTop: 10, opacity: 0.6 }}>
          Checking subscription...
        </Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

        <View style={[styles.container, { paddingTop: insets.top + 50 }]}>
          
          <ScreenHeader
            kpi="UPGRADE"
            title="Choose your plan"
            theme={theme}
          />

          {/* TOGGLE (stile reports) */}
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
                      style={[
                        styles.toggleText,
                        active && { color: "#fff" },
                      ]}
                    >
                      {item === "subscription" ? "Subscription" : "Payment"}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* LIST */}
          <FlatList
            data={filteredPlans}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <Pressable
                onPress={() => handlePress(item)}
                style={[
                  styles.card,
                  item.isBest && { borderColor: theme.tint },
                ]}
              >
                {item.isBest && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>MOST POPULAR</Text>
                  </View>
                )}

                <View style={styles.row}>
                  <Text style={styles.kpi}>{item.kpi}</Text>
                  <Ionicons name={item.icon as any} size={20} color={theme.text} />
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
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },

  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  /* TOGGLE STYLE REPORT-STYLE */
  toggle: {
    marginBottom: 18,
  },

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

  toggleText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#444",
  },

  /* CARD PIÙ PROFONDA */
  card: {
    borderRadius: 22,
    padding: 20,
    marginBottom: 14,

    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.04)",

    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 4,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  kpi: {
    fontSize: 11,
    fontWeight: "800",
    opacity: 0.5,
  },

  title: {
    fontSize: 18,
    fontWeight: "800",
    marginTop: 6,
  },

  price: {
    fontSize: 24,
    fontWeight: "900",
    marginTop: 4,
  },

  desc: {
    fontSize: 13,
    opacity: 0.6,
    marginTop: 6,
  },

  badge: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "#111",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },

  badgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "700",
  },
});