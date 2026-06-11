import { planConfigName } from "@/constants/plans";
import { supabase } from "@/lib/supabase";
import { createShift } from "@/queries/managerQueries";
import { FormShiftSchema } from "@/src/validation/formShift.schema";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Alert } from "react-native";

export const useHandleCreateShift = () => {
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const router = useRouter();

  const [currentUser, setCurrentUser] = useState<any | null>(null);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getUser()
      .then(({ data }) => {
        if (!mounted) return;
        setCurrentUser(data?.user ?? null);
      })
      .catch((e) => {
        console.error("Failed to get current user:", e);
      });
    return () => { mounted = false; };
  }, []);

  const formatTime = (date: Date): string => {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  };

  const formatDate = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };

  const handleCreate = async (form: any) => {
    const result = FormShiftSchema.safeParse(form);
    if (!result.success) {
      Alert.alert("Validation Error", result.error.issues[0].message);
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not found");

      // 1. Recupero business_id dal profilo
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("business_id")
        .eq("id", user.id)
        .single();

      if (profileError || !profile?.business_id) {
        throw new Error("No business linked to your account.");
      }

      // 2. Recupero dati business
      const { data: business, error: bizError } = await supabase
        .from("businesses")
        .select("id, job_postings_limit, job_postings_used, business_type, plan_type")
        .eq("id", profile.business_id)
        .single();

      console.log("DEBUG - Profilo/Business:", profile, business);

      if (bizError || !business) throw new Error("Business data not found.");

      // 3. Controllo limiti basato su planConfig
      const currentPlan = planConfigName[business.plan_type];
      
      console.log("DEBUG - Piano in uso:", business.plan_type);
      console.log("DEBUG - Configurazione trovata:", currentPlan);

      if (!currentPlan) {
        console.error("ERRORE CRITICO: Nessun piano trovato per chiave:", business.plan_type);
        Alert.alert("System error", `Your plan '${business.plan_type}' is not configured.`);
        return;
      }

      if (business.business_type === 'staffing') {
        const { count, error: countError } = await supabase
          .from("profiles")
          .select("*", { count: 'exact', head: true })
          .eq("business_id", business.id)
          .eq("role", "manager");

        if (countError) throw new Error("Error counting managers.");
        
        if ((count ?? 0) >= currentPlan.limit) {
          Alert.alert("Limit Reached", `The ${currentPlan.name} plan allows a maximum of ${currentPlan.limit} managers.`);
          return;
        }
      } else {
        // Forza il confronto numerico per sicurezza
        const used = Number(business.job_postings_used);
        const limit = Number(currentPlan.limit);
        
        console.log(`DEBUG - Confronto crediti: ${used} >= ${limit}`);
        
        if (used >= limit) {
          Alert.alert(
            "Limit Reached", 
            `You have reached the limit of ${limit} shifts allowed by the ${currentPlan.name} plan.`,
            [
              { 
                text: "Cancel", 
                style: "cancel" 
              },
              { 
                text: "Manage Subscription", 
                onPress: () => router.push({
                  pathname: "/subscription", 
                  params: { businessId: business.id } // Passa l'ID qui
                })
              }
            ]
          );
          return; // BLOCCA l'esecuzione
        }
      }

      // 4. Creazione payload
      const payload = {
        title: result.data.title,
        description: result.data.description || "",
        departmentId: result.data.department === "staffing_agency_global" ? null : result.data.department,
        hourly_rate: result.data.hourly_rate, 
        date: formatDate(result.data.shift_date), 
        startTime: formatTime(result.data.start_time), 
        endTime: formatTime(result.data.end_time),
        required_workers: result.data.required_workers || 1, 
        address: (result.data as any).address || null,
        city: (result.data as any).city || null,
        client_name: (result.data as any).client_name || null,
      };

      await createShift(user.id, imageUrl, payload);

      // 5. Aggiornamento contatore (solo per modelli Standard)
      if (business.business_type !== 'staffing') {
        const { error: updateError } = await supabase
          .from("businesses")
          .update({ job_postings_used: business.job_postings_used + 1 })
          .eq("id", business.id);

        if (updateError) throw new Error("Shift created but could not update credits.");
      }

      router.push("/(manager)/(tabs)/shift");
    } catch (err: any) {
      console.error("DEBUG - Errore finale:", err);
      Alert.alert("Error", err.message);
    } finally {
      setLoading(false);
    }
  };

  return { handleCreate, loading, imageUrl, setImageUrl };
};