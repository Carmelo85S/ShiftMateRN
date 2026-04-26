import { useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { 
  countPendingApplications, 
  fetchManagerShifts, 
  getManagerProfile 
} from "@/queries/managerQueries";

type Stats = {
  totalSpending: number;     
  effectiveSpending: number; 
  pendingCount: number;
};

export const useDashboardData = () => {
  const [userName, setUserName] = useState("Manager");
  const [stats, setStats] = useState<Stats>({ totalSpending: 0, effectiveSpending: 0, pendingCount: 0 });
  const [upcomingShifts, setUpcomingShifts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;
      if (!userId) return;

      const today = new Date().toISOString().split("T")[0];
      
      const [profileData, allShifts, pendingCount] = await Promise.all([
        getManagerProfile(userId),
        fetchManagerShifts(userId),
        countPendingApplications(userId)
      ]);

      if (profileData?.name) setUserName(profileData.name);

      // Calcolo statistiche
      const totalSum = allShifts.reduce((acc, s) => acc + (Number(s.total_pay) || 0), 0);
      const effectiveSum = allShifts
        .filter(s => s.status === 'assigned') 
        .reduce((acc, s) => acc + (Number(s.total_pay) || 0), 0);

      setStats({
        totalSpending: totalSum,
        effectiveSpending: effectiveSum,
        pendingCount: pendingCount || 0
      });

      setUpcomingShifts(allShifts.filter((s: any) => s.shift_date >= today).slice(0, 3));
    } catch (error) {
      console.error("Dashboard error:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }, [fetchData]);

  return {
    userName,
    stats,
    upcomingShifts,
    loading,
    refreshing,
    fetchData,
    onRefresh
  };
};