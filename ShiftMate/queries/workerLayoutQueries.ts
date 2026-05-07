import { supabase } from "@/lib/supabase";

export const fetchUnreadNotificationCount = async (userId: string) => {
  const { count, error } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('profile_id', userId)
    .eq('is_read', false)
    .eq('is_archived', false);

  if (error) return 0;
  return count || 0;
};

export const subscribeToNotifications = (userId: string, onUpdate: () => void) => {
  return supabase
    .channel(`notifications_user_${userId}`)
    .on(
      'postgres_changes',
      {
        event: '*', 
        schema: 'public',
        table: 'notifications',
        filter: `profile_id=eq.${userId}`
      },
      () => {
        console.log("Notification change detected, refreshing count...");
        onUpdate();
      }
    )
    .subscribe();
};