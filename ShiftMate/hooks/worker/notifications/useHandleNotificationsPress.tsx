import { useRouter } from "expo-router";

interface UseHandlePressProps {
  handleMarkAsRead: (id: string) => Promise<void>;
}

export const useHandleNotificationsPress = ({ handleMarkAsRead }: UseHandlePressProps) => {
  const router = useRouter();

  const handleNotificationPress = async (item: any) => {
    if (!item) return;
    
    await handleMarkAsRead(item.id);

    if (item.shift_id && ["confirmation", "reminder", "invitation"].includes(item.type)) {
      router.push({ 
        pathname: "/(worker)/shift/[id]", 
        params: { id: item.shift_id } 
      });
    } else if (item.type === "rejection") {
      router.push("/(worker)/(tabs)/shifts");
    }
  };

  return { handleNotificationPress };
};