import { useEffect } from "react";
import { supabase } from "@/lib/supabase";

export const useRealTimeNotifications = (
  setNotifications: React.Dispatch<React.SetStateAction<any[]>>
) => {
  useEffect(() => {
    let channel: any;

    const setupRealtime = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      channel = supabase
        .channel('db-notifications')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `profile_id=eq.${user.id}`,
          },
          (payload) => {
            setNotifications((current) => [payload.new, ...current]);
          }
        )
        .subscribe();
    };

    setupRealtime();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [setNotifications]);
};