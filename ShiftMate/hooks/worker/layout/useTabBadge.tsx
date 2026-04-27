import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { fetchUnreadNotificationCount, subscribeToNotifications } from "@/queries/workerLayoutQueries";

export const useTabBadge = () => {
  const [unreadCount, setUnreadCount] = useState<number | null>(null);
  const [isGuest, setIsGuest] = useState(true);

  const loadBadge = useCallback(async (userId: string) => {
    const count = await fetchUnreadNotificationCount(userId);
    setUnreadCount(count > 0 ? count : null);
  }, []);

  useEffect(() => {
    let channel: any;

    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      const handleAuthState = (currentSession: any) => {
        const user = currentSession?.user;
        setIsGuest(!currentSession);

        if (user) {
          loadBadge(user.id);
          channel = subscribeToNotifications(user.id, () => loadBadge(user.id));
        } else {
          setUnreadCount(null);
          if (channel) supabase.removeChannel(channel);
        }
      };

      handleAuthState(session);

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
        handleAuthState(newSession);
      });

      return subscription;
    };

    const authSub = init();

    return () => {
      if (channel) supabase.removeChannel(channel);
      authSub.then(sub => sub?.unsubscribe());
    };
  }, [loadBadge]);

  return { unreadCount, isGuest };
};