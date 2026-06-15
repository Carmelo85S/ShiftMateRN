import { supabase } from "@/lib/supabase";
import {
  completeShiftWithActualTime,
  fetchShiftFullDetails,
} from "@/queries/managerQueries";
import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useState } from "react";

export const useShiftDetail = (id: string | string[] | undefined) => {
  const [shift, setShift] = useState<any | null>(null);
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [user, setUser] = useState<{ id: string; role: string } | null>(null);

  // 👤 Get current user
  useEffect(() => {
    const fetchCurrentUser = async () => {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();

      if (!authUser) return;

      setUser({
        id: authUser.id,
        role: authUser.user_metadata?.role || "manager",
      });
    };

    fetchCurrentUser();
  }, []);

  // 📦 Load shift data
  const loadData = useCallback(async () => {
    if (!id) return;

    try {
      const result = await fetchShiftFullDetails(id as string);

      console.log("📊 SHIFT RESULT:", result);

      // ⚠️ SHIFT NON ESISTE (deleted or invalid id)
      if (!result?.shift) {
        console.log("⚠️ Shift not found (deleted or missing)");

        setShift(null);
        setApplications([]);
        return;
      }

      setShift(result.shift);
      setApplications(result.applications ?? []);
    } catch (err) {
      console.log("===== FETCH ERROR =====");
      console.log(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [id]);

  // 🔁 Reload on focus
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData]),
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  // ✅ Complete shift
  const completeShift = async (actualEndTime: string) => {
    if (!id) return;

    await completeShiftWithActualTime(id as string, actualEndTime);
    await loadData();
  };

  return {
    shift,
    applications,
    loading,
    refreshing,
    onRefresh,
    user,
    completeShift,
  };
};
