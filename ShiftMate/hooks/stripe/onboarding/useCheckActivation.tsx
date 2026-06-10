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
      // LOGICA MANAGER: Legge da 'manager_purchases'
      const { data: purchase } = await supabase
        .from("manager_purchases")
        .select("status")
        .eq("user_id", userId)
        .eq("status", "active") // Oppure 'trialing' se previsto
        .single();

      setStatus({
        loading: false,
        hasSubscription: !!purchase, // True se ha un acquisto attivo
        onboardingCompleted: true, // Il manager non gestisce onboarding Stripe
      });
    }
  }, [businessId, userRole, userId]);

  // Ogni volta che l'utente torna sulla schermata, rieseguiamo il check
  useFocusEffect(
    useCallback(() => {
      check();
    }, [check]),
  );

  return status;
};
