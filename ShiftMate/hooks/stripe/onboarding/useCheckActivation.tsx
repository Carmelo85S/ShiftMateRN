import { supabase } from "@/lib/supabase";
import { useState, useCallback } from "react";
import { useFocusEffect } from "expo-router";

export const useCheckActivation = (businessId?: string) => {
  const [status, setStatus] = useState({ 
    loading: true, 
    hasSubscription: false, 
    onboardingCompleted: false 
  });

  const check = useCallback(async () => {
    if (!businessId) {
      setStatus(prev => ({ ...prev, loading: false }));
      return;
    }

    // 1. Chiamiamo l'Edge Function per assicurarci che lo stato su Stripe sia sincronizzato
    // (Questo aggiorna anche il database tramite la logica della funzione)
    await supabase.functions.invoke('check-onboarding-status', {
      body: { businessId }
    });

    // 2. Leggiamo il dato aggiornato dal database
    const { data: business, error } = await supabase
      .from('businesses')
      .select('stripe_subscription_status, stripe_onboarding_completed')
      .eq('id', businessId)
      .single();

    if (error) {
      setStatus({ loading: false, hasSubscription: false, onboardingCompleted: false });
      return;
    }

    const isActive = ['active', 'trialing'].includes(business?.stripe_subscription_status ?? '');
    
    setStatus({ 
      loading: false, 
      hasSubscription: isActive,
      onboardingCompleted: !!business?.stripe_onboarding_completed
    });
  }, [businessId]);

  // Ogni volta che l'utente torna sulla schermata, rieseguiamo il check
  useFocusEffect(
    useCallback(() => {
      check();
    }, [check])
  );

  return status;
};