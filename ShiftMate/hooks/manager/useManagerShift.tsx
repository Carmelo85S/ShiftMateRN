import { supabase } from "@/lib/supabase";
import { fetchManagerShifts } from "@/queries/managerQueries";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";

interface Shift {
  department: string;
  id: string;
  title: string;
  shift_date: string;
  start_time: string;
  end_time: string;
  image_url: string | null;
  status: string;
}
export const useManagerShift = () => {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.user?.id) return;

      // 1. Recupera il business_id dell'utente loggato
      const { data: profile } = await supabase
        .from("profiles")
        .select("business_id")
        .eq("id", session.user.id)
        .single();

      if (!profile?.business_id) return;

      // 2. Passa il business_id trovato!
      const data = await fetchManagerShifts(profile.business_id);

      // 3. Mappa i dati correttamente
      const formattedShifts: Shift[] = data.map((item: any) => ({
        id: item.id,
        title: item.title,
        shift_date: item.shift_date,
        start_time: item.start_time,
        end_time: item.end_time,
        image_url: item.image_url,
        status: item.status,
        // Estrai il nome del dipartimento
        department: item.departments?.name || "General",
      }));

      setShifts(formattedShifts);
    } catch (err) {
      console.error("Error loading shifts:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData]),
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, [loadData]);

  return {
    shifts,
    loading,
    refreshing,
    onRefresh,
    loadData,
  };
};
