import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { 
  countPendingApplications, 
  fetchManagerShifts, 
  getManagerProfile 
} from "@/queries/managerQueries";

// Tipo per le statistiche del ristorante (Standard)
type DepartmentStat = {
  id: string;
  name: string;
  plannedBudget: number;   
  effectiveSpent: number;
  availableBudget: number;
};

// Tipo per le statistiche dell'agenzia (Staffing)
type ClientStat = {
  id: string;
  name: string;
  revenue: number; // Totale SEK generato da questo cliente nel mese corrente
};

type DashboardStats = {
  departments: DepartmentStat[]; // Usato se businessType === "standard"
  clients: ClientStat[];         // Usato se businessType === "staffing"
  pendingCount: number;
  totalMonthlyRevenue?: number;  // KPI extra utile solo per lo staffing
};

export const useDashboardData = () => {
  const [userName, setUserName] = useState("Manager");
  const [businessType, setBusinessType] = useState<"standard" | "staffing">("standard");
  const [stats, setStats] = useState<DashboardStats>({ departments: [], clients: [], pendingCount: 0 });
  const [upcomingShifts, setUpcomingShifts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;
      if (!userId) return;

      const today = new Date().toISOString().split("T")[0];
      
      // Date correnti per filtrare il mese e anno attuale
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth();

      // 1. Recuperiamo il profilo dell'utente, includendo il tipo di business
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

      // Determiniamo il tipo di business (standard o staffing)
      const bType = (profileData?.businesses as any)?.business_type || "standard";
      setBusinessType(bType);

      // 2. Fetch parallelo di turni e candidature pendenti
      const [allShifts, pendingCount] = await Promise.all([
        fetchManagerShifts(userId),
        countPendingApplications(userId)
      ]);

      const businessId = profileData?.business_id;
      let departmentStatsArray: DepartmentStat[] = [];
      let clientStatsArray: ClientStat[] = [];
      let totalRevenueAccumulator = 0;

      if (businessId) {
        // 🌟 CASO A: LOGICA PER STAFFING AGENCY
        if (bType === "staffing") {
          // Filtriamo solo i turni COMPLETATI nel mese e anno corrente
          const completedShiftsThisMonth = allShifts?.filter(s => {
            if (s.status?.toLowerCase() !== "completed") return false;
            if (!s.shift_date) return false;
            
            const shiftDate = new Date(s.shift_date);
            return (
              shiftDate.getFullYear() === currentYear &&
              shiftDate.getMonth() === currentMonth
            );
          }) || [];

          // Estraiamo l'elenco dei clienti unici inseriti nei turni di questo mese
          const uniqueClients = Array.from(
            new Set(completedShiftsThisMonth.map(s => s.client_name?.trim() || "Generic Client"))
          );

          // Calcoliamo il fatturato (revenue) per ogni singolo cliente
          clientStatsArray = uniqueClients.map(clientName => {
            const clientShifts = completedShiftsThisMonth.filter(
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

        // 🌟 CASO B: LOGICA PER RISTORANTE / HOTEL STANDARD
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
                  
                  const shiftDate = new Date(s.shift_date);
                  return (
                    shiftDate.getFullYear() === currentYear &&
                    shiftDate.getMonth() === currentMonth
                  );
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

      // Salviamo i dati formattati nello stato in base al tipo di business
      setStats({
        departments: departmentStatsArray,
        clients: clientStatsArray,
        pendingCount: pendingCount || 0,
        totalMonthlyRevenue: totalRevenueAccumulator
      });

      // Prendiamo i primi 3 turni futuri da mostrare nella dashboard
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

  // Sottoscrizione ai canali Realtime di Supabase per aggiornamenti istantanei
  useEffect(() => {
    fetchData();

    const applicationsChannel = supabase
      .channel("db-applications-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "applications" },
        (payload) => {
          console.log("⚡ Realtime: Candidature variate!", payload);
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
          console.log("⚡ Realtime: Turni variati!", payload);
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
    businessType, // 🌟 Restituito così la Dashboard sa quale grafica mostrare
    stats,
    upcomingShifts,
    loading,
    refreshing,
    fetchData,
    onRefresh
  };
};