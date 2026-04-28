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
  businesses?: {
    name: string;
  };
};

export const useLoadShiftsBoard = () => {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isGuest, setIsGuest] = useState(true);
  const [myBusinessId, setMyBusinessId] = useState<string | null>(null);

  const loadShiftsBoard = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
        const { data: { session } } = await supabase.auth.getSession();
        const guestStatus = !session;
        setIsGuest(guestStatus);

        if (!guestStatus && session.user) {
            const { data: profile } = await supabase
            .from("profiles")
            .select("business_id")
            .eq("id", session.user.id)
            .single();
            setMyBusinessId(profile?.business_id || null);
        }

        const shiftsData = await fetchGlobalShifts();

        const normalized: Shift[] = (shiftsData || []).map((s: any) => ({
            id: String(s.id),
            business_id: s.business_id, 
            title: s.title,
            shift_date: s.shift_date,
            start_time: s.start_time,
            end_time: s.end_time,
            image_url: s.image_url ?? null,
            total_pay: Number(s.total_pay) || 0,
            hourly_rate: Number(s.hourly_rate) || 0,
            department: s.department || 'hospitality',
            businesses: s.businesses
        }));
      
        setShifts(normalized);
        } catch (err: any) {
            console.error("WorkerShifts Load Error:", err.message);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

  useEffect(() => {
    loadShiftsBoard();
  }, [loadShiftsBoard]);

  return {
    shifts,
    loading,
    refreshing,
    isGuest,
    myBusinessId,
    refresh: () => loadShiftsBoard(true) 
    };
};