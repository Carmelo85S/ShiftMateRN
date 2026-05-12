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
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.id) return;
      const data = await fetchManagerShifts(session.user.id); 
      setShifts(data as Shift[]);
      const categories = ["All", ...new Set(data.map(s => s.department))];
      console.log("Shift categories:", categories);

    } catch (err) {
      console.error("Error loading shifts:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
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
    loadData 
  };
};