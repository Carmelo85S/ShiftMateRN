import { supabase } from "@/lib/supabase";
import { fetchGlobalShifts } from "@/queries/workerQueries";
import { useCallback, useEffect, useState } from "react";

export type Shift = {
  id: string;
  business_id: string;
  title: string;
  shift_date: string;
  start_time: string;
  end_time: string;
  image_url: string | null;
  total_pay: number;   
  hourly_rate: number;
  department: string; 
  status: string;
  businesses?: {
    name: string;
  };
  application_status?: string;
};

export const useLoadShiftsBoard = () => {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [myBusinessShifts, setMyBusinessShifts] = useState<Shift[]>([]);
  const [myApplications, setMyApplications] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isGuest, setIsGuest] = useState(true);

  // Helper normalization function to ensure consistent data structure
  const normalizeShifts = (data: any[]): Shift[] => {
    return (data || []).map((s) => ({
      id: String(s.id),
      business_id: s.business_id,
      title: s.title,
      shift_date: s.shift_date,
      start_time: s.start_time,
      end_time: s.end_time,
      image_url: s.image_url ?? null,
      total_pay: Number(s.total_pay) || 0,
      hourly_rate: Number(s.hourly_rate) || 0,
      department: s.department || "hospitality",
      status: s.status || "open",
      application_status: s.application_status,
      businesses: Array.isArray(s.businesses) ? s.businesses[0] : s.businesses,
    }));
  };

  const loadData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

   try {
      // 1. Fetch global shifts
      const globalData = await fetchGlobalShifts();
      setShifts(normalizeShifts(globalData));
      
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        setIsGuest(false);

// 2. Fetch Applications
const { data: appData, error: appError } = await supabase
  .from("applications")
  .select("status, shifts(*, businesses(name))")
  .eq("profile_id", session.user.id)
  .in("status", ["accepted", "applied", "rejected"]);

if (appError) throw appError;

// Estraiamo i turni INIETTANDO lo status dell'applicazione
const extractedShifts = (appData || []).map(app => {
  if (!app.shifts) return null;
  return {
    ...app.shifts,
    application_status: app.status 
  };
}).filter(Boolean);

setMyApplications(normalizeShifts(extractedShifts));

        // 3. Retrieve business_id per la tab "My Workplace"
        const { data: profile } = await supabase
          .from("profiles")
          .select("business_id")
          .eq("id", session.user.id)
          .single();

        if (profile?.business_id) {
          const { data: bShifts, error: bError } = await supabase
            .from("shifts")
            .select("*, businesses(id, name)")
            .eq("business_id", profile.business_id);

          if (bError) throw bError;
          setMyBusinessShifts(normalizeShifts(bShifts));
        }
      } else {
        setIsGuest(true);
        setMyBusinessShifts([]);
        setMyApplications([]);
      }
    } catch (err) {
      console.error("Errore durante il caricamento dei turni:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return { 
    shifts, 
    myBusinessShifts, 
    myApplications,
    loading, 
    refreshing, 
    isGuest, 
    refresh: () => loadData(true) 
  };
};