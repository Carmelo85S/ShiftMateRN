import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { 
  countPendingApplications, 
  fetchManagerShifts, 
} from "@/queries/managerQueries";

type DepartmentStat = {
  id: string;
  name: string;
  plannedBudget: number;   
  effectiveSpent: number;
  availableBudget: number;
};

type ClientStat = {
  id: string;
  name: string;
  revenue: number; 
};

type DashboardStats = {
  departments: DepartmentStat[]; 
  clients: ClientStat[];         
  pendingCount: number;
  totalMonthlyRevenue?: number;  
};

export const useDashboardData = () => {
  const [userName, setUserName] = useState("Manager");
  // Inizializza a null per indicare che non sappiamo ancora che business sia
  const [businessType, setBusinessType] = useState<"standard" | "staffing" | null>(null); 
  const [stats, setStats] = useState<DashboardStats>({ departments: [], clients: [], pendingCount: 0 });
  const [upcomingShifts, setUpcomingShifts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;
      if (!userId) return;

      // Generiamo le stringhe temporali correnti all'interno della funzione
      const now = new Date();
      const currentYear = String(now.getFullYear());
      const currentMonth = String(now.getMonth() + 1).padStart(2, "0"); // "01" - "12"
      const todayStr = now.toISOString().split("T")[0];

      // 1. Recuperiamo il profilo dell'utente
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select(`
          name, 
          business_id, 
          businesses ( business_type )
        `)
        .eq("id", userId)
        .single();

      if (profileError) throw profileError;
      if (profileData?.name) setUserName(profileData.name);

      const bType = (profileData?.businesses as any)?.business_type || "standard";
      
      // Impostiamo il business type
      setBusinessType(bType);

      // 2. Fetch dei turni e dei dati paralleli
      const [allShifts, pendingCount] = await Promise.all([
        fetchManagerShifts(userId),
        countPendingApplications(userId)
      ]);

      const businessId = profileData?.business_id;
      let departmentStatsArray: DepartmentStat[] = [];
      let clientStatsArray: ClientStat[] = [];
      let totalRevenueAccumulator = 0;

      if (businessId) {
        // ==========================================
        // 🌟 LOGICA CASO STAFFING
        // ==========================================
        if (bType === "staffing") {
          const activeShiftsThisMonth = allShifts?.filter(s => {
            const currentStatus = s.status?.toLowerCase();
            const isCorrectStatus = ["completed", "filled", "assigned", "open"].includes(currentStatus);
            if (!isCorrectStatus) return false;
            if (!s.shift_date) return false;

            const [sYear, sMonth] = s.shift_date.split("-");
            return sYear === currentYear && sMonth === currentMonth;
          }) || [];

          const uniqueClients = Array.from(
            new Set(activeShiftsThisMonth.map(s => s.client_name?.trim() || "Generic Client"))
          );

          clientStatsArray = uniqueClients.map(clientName => {
            const clientShifts = activeShiftsThisMonth.filter(
              s => (s.client_name?.trim() || "Generic Client") === clientName
            );
            
            const revenueSum = clientShifts.reduce((acc, s) => acc + (Number(s.total_pay) || 0), 0);
            totalRevenueAccumulator += revenueSum;

            return {
              id: clientName,
              name: clientName,
              revenue: revenueSum
            };
          });

        // ==========================================
        // 🌟 LOGICA CASO RISTORANTE (STANDARD)
        // ==========================================
        } else {
          const { data: departments, error: deptError } = await supabase
            .from("departments")
            .select("id, name, monthly_budget")
            .eq("business_id", businessId);

          if (!deptError && departments) {
            departmentStatsArray = departments.map((dept) => {
              const deptShifts = allShifts?.filter(s => s.department_id === dept.id) || [];
              
              const effectiveSum = deptShifts
                .filter(s => {
                  if (s.status?.toLowerCase() !== "completed") return false;
                  if (!s.shift_date) return false;
                  
                  const [sYear, sMonth] = s.shift_date.split("-");
                  return sYear === currentYear && sMonth === currentMonth;
                })
                .reduce((acc, s) => acc + (Number(s.total_pay) || 0), 0);

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
      }

      // Invio definitivo dei dati calcolati
      setStats({
        departments: departmentStatsArray,
        clients: clientStatsArray,
        pendingCount: pendingCount || 0,
        totalMonthlyRevenue: totalRevenueAccumulator
      });

      setUpcomingShifts(allShifts.filter((s: any) => s.shift_date >= todayStr).slice(0, 3));
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

  useEffect(() => {
    fetchData();

    const applicationsChannel = supabase
      .channel("db-applications-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "applications" }, () => {
        fetchData(); 
      })
      .subscribe();

    const shiftsChannel = supabase
      .channel("db-shifts-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "shifts" }, () => {
        fetchData(); 
      })
      .subscribe();

    return () => {
      supabase.removeChannel(applicationsChannel);
      supabase.removeChannel(shiftsChannel);
    };
  }, [fetchData]);

  return {
    userName,
    businessType, 
    stats,
    upcomingShifts,
    loading,
    refreshing,
    fetchData,
    onRefresh
  };
};