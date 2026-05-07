import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { fetchUnreadNotificationCount, subscribeToNotifications } from "@/queries/workerLayoutQueries";

export const useTabBadge = () => {
  const [unreadCount, setUnreadCount] = useState<number | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isGuest, setIsGuest] = useState(true);

  // Load badge count for a given user ID
  const loadBadge = useCallback(async (uid: string) => {
    const count = await fetchUnreadNotificationCount(uid);
    setUnreadCount(count > 0 ? count : null);
  }, []);

  // Authentication state listener
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserId(session?.user?.id || null);
      setIsGuest(!session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user?.id || null);
      setIsGuest(!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Realtime subscription management (only if there's a userId)
  useEffect(() => {
    if (!userId) {
      setUnreadCount(null);
      return;
    }

    // Load initial count
    loadBadge(userId);

    // Subscribe to changes
    const channel = subscribeToNotifications(userId, () => loadBadge(userId));

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [userId, loadBadge]);

  return { unreadCount, isGuest };
};