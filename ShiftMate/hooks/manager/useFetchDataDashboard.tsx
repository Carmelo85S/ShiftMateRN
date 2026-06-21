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
  total_available_credits: number;
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
      const currentYear = now.getFullYear();
      const currentMonth = String(now.getMonth() + 1).padStart(2, "0");
      const today = new Date();

      // =========================
      // PROFILE + BUSINESS
      // =========================
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

      setBusinessType(bType);
      setBusinessId(bId);

      // =========================
      // CREDITS (SINGLE SOURCE OF TRUTH)
      // =========================
      let totalCredits = 0;

      if (bId) {
        const { data: credits, error } = await supabase
          .from("job_credit_accounts")
          .select("available_credits")
          .eq("business_id", bId)
          .maybeSingle();

        if (!error && credits) {
          totalCredits = credits.available_credits || 0;
        }
      }

      // =========================
      // DASHBOARD DATA
      // =========================
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
                new Date(s.shift_date).getFullYear() === currentYear &&
                String(new Date(s.shift_date).getMonth() + 1).padStart(
                  2,
                  "0",
                ) === currentMonth
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

            return {
              id: clientName,
              name: clientName,
              revenue: revenueSum,
            };
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
                    new Date(s.shift_date).getFullYear() === currentYear &&
                    String(new Date(s.shift_date).getMonth() + 1).padStart(
                      2,
                      "0",
                    ) === currentMonth,
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

      // =========================
      // UPCOMING SHIFTS
      // =========================
      const upcoming = (allShifts || [])
        .filter((s) => new Date(s.shift_date) >= today)
        .slice(0, 3);

      // =========================
      // SET STATE
      // =========================
      setStats({
        departments: departmentStatsArray,
        clients: clientStatsArray,
        pendingCount: pendingCount || 0,
        totalMonthlyRevenue: totalRevenueAccumulator,
        total_available_credits: totalCredits,
      });

      setUpcomingShifts(upcoming);
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
    onRefresh: fetchData,
  };
};
