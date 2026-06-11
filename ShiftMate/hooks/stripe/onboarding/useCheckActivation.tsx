import { supabase } from "@/lib/supabase";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";

export const useCheckActivation = (
  businessId?: string,
  userRole?: "owner" | "manager",
  userId?: string,
) => {
  const [status, setStatus] = useState({
    loading: true,
    hasSubscription: false,
    onboardingCompleted: false,
  });

  const check = useCallback(async () => {
    if (!businessId || !userRole || !userId) {
      setStatus((prev) => ({ ...prev, loading: false }));
      return;
    }

    if (userRole === "owner") {
      // LOGICA AGENZIA: Legge da 'businesses'
      const { data: business } = await supabase
        .from("businesses")
        .select("stripe_subscription_status, stripe_onboarding_completed")
        .eq("id", businessId)
        .single();

      const hasSub = ["active", "trialing"].includes(
        business?.stripe_subscription_status ?? "",
      );
      setStatus({
        loading: false,
        hasSubscription: hasSub,
        onboardingCompleted: hasSub
          ? !!business?.stripe_onboarding_completed
          : false,
      });
    } else {
      // LOGICA MANAGER: Legge sia acquisto che stato onboarding
      const { data: purchase } = await supabase
        .from("manager_purchases")
        .select("status")
        .eq("user_id", userId)
        .eq("status", "active")
        .maybeSingle(); // Usiamo maybeSingle per evitare errori se non esiste

      const { data: profile } = await supabase
        .from("profiles")
        .select("stripe_onboarding_completed")
        .eq("id", userId)
        .single();

      setStatus({
        loading: false,
        hasSubscription: !!purchase,
        onboardingCompleted: !!profile?.stripe_onboarding_completed,
      });
    }
  }, [businessId, userRole, userId]);

  useFocusEffect(
    useCallback(() => {
      check();
    }, [check]),
  );

  return status;
};
