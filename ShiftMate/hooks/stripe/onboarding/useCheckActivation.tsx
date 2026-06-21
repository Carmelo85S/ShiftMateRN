import { supabase } from "@/lib/supabase";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";

type ActivationStatus = {
  loading: boolean;
  hasSubscription: boolean;
  onboardingCompleted: boolean;
  availableCredits: number;
};

export const useCheckActivation = (
  businessId?: string,
  userRole?: "owner" | "manager",
  userId?: string,
) => {
  const [status, setStatus] = useState<ActivationStatus>({
    loading: true,
    hasSubscription: false,
    onboardingCompleted: false,
    availableCredits: 0,
  });

  const check = useCallback(async () => {
    try {
      if (!businessId) {
        setStatus((prev) => ({ ...prev, loading: false }));
        return;
      }

      // =========================
      // BUSINESS (SOURCE OF TRUTH)
      // =========================
      const { data: business, error } = await supabase
        .from("businesses")
        .select("stripe_subscription_status, stripe_onboarding_completed")
        .eq("id", businessId)
        .maybeSingle();

      if (error) throw error;

      const hasSubscription =
        business?.stripe_subscription_status === "active" ||
        business?.stripe_subscription_status === "trialing";

      const onboardingCompleted = !!business?.stripe_onboarding_completed;

      // =========================
      // CREDITS (UNIFIED SYSTEM)
      // =========================
      const { data: creditsData, error: creditsError } = await supabase
        .from("job_credit_accounts")
        .select("available_credits")
        .eq("business_id", businessId)
        .maybeSingle();

      if (creditsError) {
        console.error("Credits fetch error:", creditsError);
      }

      const availableCredits = creditsData?.available_credits || 0;

      // =========================
      // SET STATE
      // =========================
      setStatus({
        loading: false,
        hasSubscription,
        onboardingCompleted,
        availableCredits,
      });
    } catch (err) {
      console.error("Activation check error:", err);

      setStatus({
        loading: false,
        hasSubscription: false,
        onboardingCompleted: false,
        availableCredits: 0,
      });
    }
  }, [businessId]);

  useFocusEffect(
    useCallback(() => {
      check();
    }, [check]),
  );

  return status;
};
