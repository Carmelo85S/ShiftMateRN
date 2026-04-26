import { supabase } from "@/lib/supabase";
import { useEffect } from "react";
import { fetchUserProfile } from "@/queries/managerQueries";

export const useLoadProfile = (setForm: any) => {
    useEffect(() => {
        const loadProfile = async () => {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            const profile = await fetchUserProfile(user.id);
            if (profile?.department) {
              setForm((prev: any) => ({ ...prev, department: profile.department }));
            }
          }
        };
        loadProfile();
      }, []);
}