import { supabase } from "@/lib/supabase";

// --- NOTIFICATIONS ---

export const fetchUnreadNotificationCount = async (userId: string) => {
  const { count, error } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('profile_id', userId)
    .eq('is_read', false)
    .eq('is_archived', false)

  if (error) {
    console.error("Error fetching unread count:", error.message);
    return 0;
  }
  return count || 0;
};

// Realtime subscription for notifications changes
export const subscribeToNotifications = (userId: string, onUpdate: () => void) => {
  return supabase
    .channel(`tab-badge-${userId}`)
    .on(
      'postgres_changes',
      { 
        event: '*', 
        schema: 'public', 
        table: 'notifications',
        filter: `profile_id=eq.${userId}` 
      },
      () => onUpdate()
    )
    .subscribe();
};