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

      // 1. Recupero business_id
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("business_id")
        .eq("id", user.id)
        .single();

      if (profileError || !profile?.business_id) throw new Error("No business linked.");

      // 2. Recupero dati business
      const { data: business, error: bizError } = await supabase
        .from("businesses")
        .select("id, owner_id, business_type, plan_type")
        .eq("id", profile.business_id)
        .single();

      if (bizError || !business) throw new Error("Business data not found.");

      // 3. Creazione payload
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

      // 4. Creazione effettiva dello Shift nel DB
      await createShift(user.id, imageUrl, payload);

      // 5. Scalata credito atomica via RPC
      const isOwner = (user.id === business.owner_id);
      const { data: success, error: rpcError } = await supabase
        .rpc('increment_job_usage', { 
          p_user_id: user.id,
          p_business_id: business.id, 
          p_is_owner: isOwner
        });

      if (rpcError || !success) {
        throw new Error("Shift created, but failed to deduct credit. Contact support.");
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