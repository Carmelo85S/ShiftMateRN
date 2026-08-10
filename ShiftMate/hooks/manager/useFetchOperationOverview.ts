import { useAuth } from "@/hooks/auth/useAuth";
import { supabase } from "@/lib/supabase";
import { useCallback, useState } from "react";

interface OperationsStats {
  openShifts: number;
  filledShifts: number;
  workersNeeded: number;
  pendingApplications: number;
}

export const useOperationsOverview = () => {
  const { businessId } = useAuth();

  const [stats, setStats] = useState<OperationsStats>({
    openShifts: 0,
    filledShifts: 0,
    workersNeeded: 0,
    pendingApplications: 0,
  });

  const [loading, setLoading] = useState(true);

  const fetchOperationsStats = useCallback(async () => {
    if (!businessId) {
      setStats({
        openShifts: 0,
        filledShifts: 0,
        workersNeeded: 0,
        pendingApplications: 0,
      });

      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // YYYY-MM-DD
      const today = new Date().toLocaleDateString("en-CA");

      /*
       * --------------------------------------------------
       * OPEN SHIFTS
       * --------------------------------------------------
       *
       * Prendiamo TUTTI gli open shifts di oggi.
       *
       * Niente join con applications qui.
       * Altrimenti uno shift senza application verrebbe
       * escluso dalla query.
       */
      const openShiftsQuery = supabase
        .from("shifts")
        .select("id, required_workers")
        .eq("business_id", businessId)
        .eq("shift_date", today)
        .eq("status", "open");

      /*
       * --------------------------------------------------
       * FILLED SHIFTS
       * --------------------------------------------------
       */
      const filledShiftsQuery = supabase
        .from("shifts")
        .select("id", {
          count: "exact",
          head: true,
        })
        .eq("business_id", businessId)
        .eq("shift_date", today)
        .eq("status", "filled");

      /*
       * --------------------------------------------------
       * PENDING APPLICATIONS
       * --------------------------------------------------
       *
       * Solo applications:
       * - status = applied
       * - non archiviate
       * - appartenenti a shift di oggi
       * - appartenenti al business corrente
       */
      const applicationsQuery = supabase
        .from("applications")
        .select(
          `
            id,
            shifts!inner (
              business_id,
              shift_date
            )
          `,
          {
            count: "exact",
            head: true,
          }
        )
        .eq("status", "applied")
        .eq("is_archived", false)
        .eq("shifts.business_id", businessId)
        .eq("shifts.shift_date", today);

      /*
       * --------------------------------------------------
       * ACCEPTED APPLICATIONS
       * --------------------------------------------------
       *
       * Ci servono per sapere quanti workers sono già
       * stati accettati negli open shifts.
       */
      const acceptedApplicationsQuery = supabase
        .from("applications")
        .select(
          `
            id,
            shifts!inner (
              business_id,
              shift_date,
              status
            )
          `
        )
        .eq("status", "accepted")
        .eq("shifts.business_id", businessId)
        .eq("shifts.shift_date", today)
        .eq("shifts.status", "open");

      const [
        {
          data: openShifts,
          error: openShiftsError,
        },
        {
          count: filledShifts,
          error: filledShiftsError,
        },
        {
          count: pendingApplications,
          error: applicationsError,
        },
        {
          data: acceptedApplications,
          error: acceptedApplicationsError,
        },
      ] = await Promise.all([
        openShiftsQuery,
        filledShiftsQuery,
        applicationsQuery,
        acceptedApplicationsQuery,
      ]);

      /*
       * --------------------------------------------------
       * ERROR HANDLING
       * --------------------------------------------------
       */

      if (openShiftsError) {
        console.error(
          "Error fetching open shifts:",
          openShiftsError
        );
      }

      if (filledShiftsError) {
        console.error(
          "Error fetching filled shifts:",
          filledShiftsError
        );
      }

      if (applicationsError) {
        console.error(
          "Error fetching pending applications:",
          applicationsError
        );
      }

      if (acceptedApplicationsError) {
        console.error(
          "Error fetching accepted applications:",
          acceptedApplicationsError
        );
      }

      /*
       * --------------------------------------------------
       * WORKERS NEEDED
       * --------------------------------------------------
       *
       * Esempio:
       *
       * Shift A -> required_workers = 2
       * Shift B -> required_workers = 1
       * Shift C -> required_workers = 2
       *
       * Totale richiesti = 5
       *
       * Se 2 workers sono stati accettati:
       *
       * 5 - 2 = 3 workers needed
       */

      const totalRequiredWorkers =
        openShifts?.reduce(
          (total, shift) =>
            total + (shift.required_workers ?? 0),
          0
        ) ?? 0;

      const acceptedWorkers =
        acceptedApplications?.length ?? 0;

      const workersNeeded = Math.max(
        0,
        totalRequiredWorkers - acceptedWorkers
      );

      /*
       * --------------------------------------------------
       * SET STATS
       * --------------------------------------------------
       */

      setStats({
        openShifts: openShifts?.length ?? 0,
        filledShifts: filledShifts ?? 0,
        workersNeeded,
        pendingApplications: pendingApplications ?? 0,
      });

      console.log("OPERATIONS OVERVIEW:", {
        today,
        openShifts: openShifts?.length ?? 0,
        filledShifts: filledShifts ?? 0,
        totalRequiredWorkers,
        acceptedWorkers,
        workersNeeded,
        pendingApplications: pendingApplications ?? 0,
      });
    } catch (error) {
      console.error(
        "Unexpected error fetching operations stats:",
        error
      );
    } finally {
      setLoading(false);
    }
  }, [businessId]);

  return {
    stats,
    loading,
    fetchOperationsStats,
  };
};
