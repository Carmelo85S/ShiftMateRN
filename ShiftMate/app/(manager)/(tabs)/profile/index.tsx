import { Colors } from "@/constants/theme";
import { useHandleProfile } from "@/hooks/manager/useHandleProfile";
import { supabase } from "@/lib/supabase";
import { useFocusEffect, useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import React, { useCallback } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  useColorScheme,
  View
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Components
import { MenuRowProfile } from "@/components/manager/profile/MenuRowProfile";
import { BiographySection } from "@/components/shared/profile/BiographySection";
import { ProfileHeader } from "@/components/shared/profile/ProfileHeader";
import { ProfileInfoCard } from "@/components/shared/profile/ProfileInfoCard";
import { ScreenWrapper } from "@/components/shared/wrapper/layout-wrapper";

export default function ProfileManager() {
  const theme = Colors[useColorScheme() ?? "light"];
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { profile, loading, loadData } = useHandleProfile();

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData]),
  );

  const handleManageSubscription = async () => {
    const customerId = profile?.businesses?.stripe_customer_id;

    // 1. Se NON ha un customerId, significa che non ha mai iniziato un processo di pagamento
    if (!customerId) {
      Alert.alert(
        "Info",
        "Non hai un profilo di pagamento. Scegli un piano per iniziare.",
      );
      router.push("/subscription");
      return;
    }

    // 2. Se ha un customerId, PERMETTIAMO comunque l'accesso al portale.
    // Stripe gestirà internamente la situazione: se non ha abbonamenti attivi,
    // il portale permetterà all'utente di aggiungere un metodo di pagamento o sottoscrivere un piano.

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/create-portal-link`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.access_token}`,
          },
          body: JSON.stringify({ customerId }),
        },
      );

      const result = await response.json();

      if (result.error) throw new Error(result.error);

      if (result.url) {
        await WebBrowser.openBrowserAsync(result.url);
      } else {
        throw new Error("URL del portale non ricevuto.");
      }
    } catch (err) {
      console.error("Errore portale:", err);
      Alert.alert(
        "Errore",
        "Impossibile accedere al portale pagamenti. Riprova più tardi.",
      );
    }
  };

  if (loading)
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="small" color={theme.tint} />
      </View>
    );

  return (
    <ScreenWrapper style={{ paddingTop: insets.top }}>
      <ProfileHeader profile={profile} theme={theme} />

      <ProfileInfoCard role={profile?.role || "User"} theme={theme} />

      <BiographySection bio={profile?.bio} theme={theme} />

      <View style={styles.menuContainer}>
        <MenuRowProfile
          label="Edit Details"
          icon="person-outline"
          onPress={() => router.push("/(manager)/(tabs)/profile/editProfile")}
          theme={theme}
        />

        <MenuRowProfile
          label="Security"
          icon="shield-checkmark-outline"
          onPress={() => {}}
          theme={theme}
        />
        <MenuRowProfile
          label="Preferences"
          icon="options-outline"
          onPress={() => {}}
          theme={theme}
        />

        <MenuRowProfile
          label="Subscription & Billing"
          icon="card-outline"
          subLabel={
            profile?.businesses?.stripe_subscription_status === "active"
              ? "Active"
              : "Manage"
          }
          onPress={handleManageSubscription}
          theme={theme}
          rightIcon={
            profile?.businesses?.stripe_subscription_status === "active"
              ? "checkmark-circle"
              : "chevron-forward"
          }
          iconColor={
            profile?.businesses?.stripe_subscription_status === "active"
              ? "#10B981"
              : theme.text
          }
        />

        <MenuRowProfile
          label="Notifications"
          icon="notifications-outline"
          onPress={() => {}}
          theme={theme}
        />
        <MenuRowProfile
          label="Help & Support"
          icon="help-circle-outline"
          onPress={() => {}}
          theme={theme}
        />
        <MenuRowProfile
          label="Logout"
          icon="log-out-outline"
          onPress={() => supabase.auth.signOut()}
          theme={theme}
        />
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  scrollContent: { paddingHorizontal: 28 },
  menuContainer: { gap: 4, marginTop: 20 },
});
