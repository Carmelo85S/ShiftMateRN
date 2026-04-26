import { useState } from "react";
import { Alert } from "react-native";
import { supabase } from "@/lib/supabase";
import { createShift } from "@/queries/managerQueries";
import { useRouter } from "expo-router";

export const useHandleCreateShift = () => {
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const router = useRouter();

  const handleCreate = async (form: any) => {
    if (!form.title || !form.department || !form.hourly_rate) {
      Alert.alert("Missing Info", "Please fill in all required fields.");
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not found");

      const payload = {
        ...form,
        shift_date: form.date.toISOString().split('T')[0],
        start_time: form.startTime.toLocaleTimeString('it-IT', { hour12: false }),
        end_time: form.endTime.toLocaleTimeString('it-IT', { hour12: false }),
      };

      await createShift(user.id, imageUrl, payload);
      router.push("/(manager)/(tabs)/shift");
    } catch (err: any) {
      Alert.alert("Error", err.message);
    } finally {
      setLoading(false);
    }
  };

  return { handleCreate, loading, imageUrl, setImageUrl };
};