import { supabase } from "@/lib/supabase";
import { fetchWorkerProfile } from "@/queries/workerQueries";
import { useFocusEffect } from "expo-router";
import { useState, useCallback } from "react";

export const useFetchProfile = () => {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false); 
  
  const fetchProfile = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;

      const data = await fetchWorkerProfile(userData.user.id);

      if (data) setProfile(data);
    } catch (err) {
      console.error("Error fetching profile:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchProfile();
    }, [fetchProfile])
  );

  return { 
    profile, 
    setProfile, 
    loading, 
    setLoading, 
    fetchProfile: () => fetchProfile(true),
    refreshing 
  };
};