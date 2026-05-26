import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { 
  countPendingApplications, 
  fetchManagerShifts, 
  getManagerProfile 
} from "@/queries/managerQueries";

type DepartmentStat = {
  id: string;
  name: string;
  plannedBudget: number;   
  effectiveSpent: number;
  availableBudget: number;
}

type DashboardStats = {
  departments: DepartmentStat[];
  pendingCount: number;
};

export const useDashboardData = () => {
  const [userName, setUserName] = useState("Manager");
  const [stats, setStats] = useState<DashboardStats>({ departments: [], pendingCount: 0 });
  const [upcomingShifts, setUpcomingShifts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;
      if (!userId) return;

      const today = new Date().toISOString().split("T")[0];
      
      // Current year and month
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth();

      const [profileData, allShifts, pendingCount] = await Promise.all([
        getManagerProfile(userId),
        fetchManagerShifts(userId),
        countPendingApplications(userId)
      ]);

      if (profileData?.name) setUserName(profileData.name);

      const businessId = profileData?.business_id;
      let departmentStatsArray: DepartmentStat[] = [];

      if (businessId) {
        const { data: departments, error: deptError } = await supabase
          .from("departments")
          .select("id, name, monthly_budget")
          .eq("business_id", businessId);

        if (!deptError && departments) {
          departmentStatsArray = departments.map((dept) => {
            const deptShifts = allShifts?.filter(s => s.department_id === dept.id) || [];
            
            // Filter only completed shift this month and year
            const effectiveSum = deptShifts
              .filter(s => {
                if (s.status?.toLowerCase() !== "completed") return false;
                if (!s.shift_date) return false;
                
                const shiftDate = new Date(s.shift_date);
                return (
                  shiftDate.getFullYear() === currentYear &&
                  shiftDate.getMonth() === currentMonth
                );
              })
              .reduce((acc, s) => acc + (Number(s.total_pay) || 0), 0);
              console.log("SUM: ", effectiveSum)

            const planned = Number(dept.monthly_budget) || 0;

            return {
              id: dept.id,
              name: dept.name,
              plannedBudget: planned,
              effectiveSpent: effectiveSum,
              availableBudget: planned - effectiveSum
            };
          });
        }
      }

      setStats({
        departments: departmentStatsArray,
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

  // Real time
  useEffect(() => {
    fetchData();

    const applicationsChannel = supabase
      .channel("db-applications-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "applications" },
        (payload) => {
          console.log("⚡ Realtime: Variazione candidature intercettata!", payload);
          fetchData(); 
        }
      )
      .subscribe();

    const shiftsChannel = supabase
      .channel("db-shifts-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "shifts" },
        (payload) => {
          console.log("⚡ Realtime: Variazione turni intercettata!", payload);
          fetchData(); 
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(applicationsChannel);
      supabase.removeChannel(shiftsChannel);
    };
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