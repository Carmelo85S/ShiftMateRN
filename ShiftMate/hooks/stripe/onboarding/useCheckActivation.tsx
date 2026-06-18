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

    // Interroghiamo SOLO la tabella businesses
    const { data: business } = await supabase
      .from("businesses")
      .select("stripe_subscription_status, stripe_onboarding_completed")
      .eq("id", businessId)
      .single();

    console.log("Dati Business da Supabase:", business);

    if (userRole === "owner") {
      setStatus({
        loading: false,
        hasSubscription: ["active", "trialing"].includes(
          business?.stripe_subscription_status ?? "",
        ),
        onboardingCompleted: !!business?.stripe_onboarding_completed,
      });
    } else {
      // Per il manager, verifichiamo solo se ha un acquisto attivo nella sua tabella
      const { data: purchase } = await supabase
        .from("billing_accounts")
        .select("id")
        .eq("user_id", userId)
        .eq("status", "active")
        .gt("expires_at", new Date().toISOString())
        .maybeSingle();

      setStatus({
        loading: false,
        hasSubscription: !!purchase,
        onboardingCompleted: !!business?.stripe_onboarding_completed,
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
