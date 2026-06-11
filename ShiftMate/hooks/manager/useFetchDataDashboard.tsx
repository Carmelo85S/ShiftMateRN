import { supabase } from "@/lib/supabase";
import {
  countPendingApplications,
  fetchManagerShifts,
} from "@/queries/managerQueries";
import { useCallback, useEffect, useState } from "react";

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
  total_available_credits: number; // 🌟 Integrato
};

export const useDashboardData = () => {
  const [userName, setUserName] = useState("Manager");
  const [businessType, setBusinessType] = useState<
    "standard" | "staffing" | null
  >(null);
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    departments: [],
    clients: [],
    pendingCount: 0,
    total_available_credits: 0,
  });
  const [upcomingShifts, setUpcomingShifts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const userId = session?.user?.id;
      if (!userId) return;

      const now = new Date();
      const currentYear = String(now.getFullYear());
      const currentMonth = String(now.getMonth() + 1).padStart(2, "0");
      const todayStr = now.toISOString().split("T")[0];

      // 1. Recupero profilo e ruolo
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select(
          `
          name, 
          business_id, 
          role,
          businesses ( business_type, owner_id )
        `,
        )
        .eq("id", userId)
        .single();

      if (profileError) throw profileError;
      if (profileData?.name) setUserName(profileData.name);

      const bType =
        (profileData?.businesses as any)?.business_type || "standard";
      const bId = profileData?.business_id || null;
      const userRole = profileData.role;

      // 2. Calcolo Crediti ibrido
      let totalCredits = 0;
      if (bId) {
        if (userRole === "owner") {
          const { data: busData } = await supabase
            .from("businesses")
            .select("job_postings_limit")
            .eq("id", bId)
            .single();
          totalCredits = busData?.job_postings_limit || 0;
        } else {
          const { data: purchases } = await supabase
            .from("manager_purchases")
            .select("total_job_posts_limit, used_job_posts")
            .eq("business_id", bId)
            .gt("expires_at", new Date().toISOString());

          totalCredits =
            purchases?.reduce(
              (acc, p) => acc + (p.total_job_posts_limit - p.used_job_posts),
              0,
            ) || 0;
        }
      }

      setBusinessType(bType);
      setBusinessId(bId);

      // 3. Fetch dati Dashboard
      const [allShifts, pendingCount] = await Promise.all([
        fetchManagerShifts(userId),
        countPendingApplications(userId),
      ]);

      let departmentStatsArray: DepartmentStat[] = [];
      let clientStatsArray: ClientStat[] = [];
      let totalRevenueAccumulator = 0;

      if (bId) {
        if (bType === "staffing") {
          const activeShiftsThisMonth =
            allShifts?.filter((s) => {
              const status = s.status?.toLowerCase();
              return (
                ["completed", "filled", "assigned", "open"].includes(status) &&
                s.shift_date?.startsWith(`${currentYear}-${currentMonth}`)
              );
            }) || [];

          const uniqueClients = Array.from(
            new Set(
              activeShiftsThisMonth.map(
                (s) => s.client_name?.trim() || "Generic Client",
              ),
            ),
          );

          clientStatsArray = uniqueClients.map((clientName) => {
            const revenueSum = activeShiftsThisMonth
              .filter(
                (s) =>
                  (s.client_name?.trim() || "Generic Client") === clientName,
              )
              .reduce((acc, s) => acc + (Number(s.total_pay) || 0), 0);
            totalRevenueAccumulator += revenueSum;
            return { id: clientName, name: clientName, revenue: revenueSum };
          });
        } else {
          const { data: departments } = await supabase
            .from("departments")
            .select("id, name, monthly_budget")
            .eq("business_id", bId);
          if (departments) {
            departmentStatsArray = departments.map((dept) => {
              const effectiveSum = allShifts
                ?.filter(
                  (s) =>
                    s.department_id === dept.id &&
                    s.status === "completed" &&
                    s.shift_date?.startsWith(`${currentYear}-${currentMonth}`),
                )
                .reduce((acc, s) => acc + (Number(s.total_pay) || 0), 0);
              return {
                id: dept.id,
                name: dept.name,
                plannedBudget: Number(dept.monthly_budget) || 0,
                effectiveSpent: effectiveSum,
                availableBudget:
                  (Number(dept.monthly_budget) || 0) - effectiveSum,
              };
            });
          }
        }
      }

      setStats({
        departments: departmentStatsArray,
        clients: clientStatsArray,
        pendingCount: pendingCount || 0,
        totalMonthlyRevenue: totalRevenueAccumulator,
        total_available_credits: totalCredits,
      });

      setUpcomingShifts(
        allShifts.filter((s: any) => s.shift_date >= todayStr).slice(0, 3),
      );
    } catch (error) {
      console.error("Dashboard error:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    userName,
    businessType,
    businessId,
    stats,
    upcomingShifts,
    loading,
    refreshing,
    fetchData,
    onRefresh: () => fetchData(),
  };
};
