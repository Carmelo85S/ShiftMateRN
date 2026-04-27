import { Alert } from "react-native";
import { supabase } from "@/lib/supabase";
import { 
  markNotificationAsRead, 
  markAllNotificationsAsRead, 
  archiveNotification 
} from "@/queries/workerQueries";

export const useNotificationsActions = (
  notifications: any[],
  setNotifications: React.Dispatch<React.SetStateAction<any[]>>,
  loadNotifications: () => Promise<void>
) => {

  const handleMarkAsRead = async (id: string) => {
    try {
      await markNotificationAsRead(id);
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, is_read: true } : n)
      );
    } catch (error) {
      console.error("Errore aggiornamento badge:", error);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await markAllNotificationsAsRead(user.id);
      await loadNotifications();
    } catch (error) {
      console.error("Errore mark all as read:", error);
    }
  };

  const handleDeleteNotification = async (id: string) => {
    try {
      await archiveNotification(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Could not remove notification.");
    }
  };

  return {
    handleMarkAsRead,
    handleMarkAllRead,
    handleDeleteNotification
  };
};