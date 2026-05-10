import { useState } from "react";
import { Alert } from "react-native";
import { supabase } from "@/lib/supabase";
import { createShift } from "@/queries/managerQueries";
import { useRouter } from "expo-router";
import { FormShiftSchema } from "@/src/validation/formShift.schema";

export const useHandleCreateShift = () => {
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const router = useRouter();

  const handleCreate = async (form: any) => {
    // ZOD validation
    const result = FormShiftSchema.safeParse(form);

    if (!result.success) {
      const errorMsg = result.error.issues[0].message;
      Alert.alert("Validation Error", errorMsg);
      return;
    }

    const validatedData = result.data;

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not found");

      const payload = {
        title: validatedData.title,
        description: validatedData.description || "",
        department: validatedData.department,
        hourly_rate: validatedData.hourly_rate.toString(),
        date: validatedData.shift_date, 
        startTime: validatedData.start_time,
        endTime: validatedData.end_time,
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