import { supabase } from "@/lib/supabase";
import { fetchUserProfile } from "@/queries/managerQueries";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";

export const useHandleProfile = () => {
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const loadData = useCallback(async () => {
        try {
          const { data: userData } = await supabase.auth.getUser();
          if (!userData.user) return;
    
          const data = await fetchUserProfile(userData.user.id);
          setProfile(data);
        } catch (error) {
          console.error("Error loading profile:", error);
        } finally {
          setLoading(false);
        }
      }, []);
    
      useFocusEffect(
        useCallback(() => { 
          loadData(); 
        }, [loadData])
      );
    return {profile,setProfile, loading, setLoading, loadData}
}