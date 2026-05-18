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

  // Helper per estrarre solo la stringa HH:MM:SS dall'oggetto Date (richiesto dal tipo TIME di Postgres)
  const formatTime = (date: Date): string => {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  };

  // Helper per formattare la data in YYYY-MM-DD
  const formatDate = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };

  const handleCreate = async (form: any) => {
    // 1. Validazione Zod centralizzata qui nell'hook
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

      // 2. Costruiamo il payload formattando correttamente i dati per Postgres
      const payload = {
        title: validatedData.title,
        description: validatedData.description || "",
        departmentId: validatedData.department, // <-- Cambiato in departmentId per mappare 'department_id'
        hourly_rate: validatedData.hourly_rate, // Lascialo come numero, Zod lo ha già convertito con coerce
        date: formatDate(validatedData.shift_date), // Formato "YYYY-MM-DD"
        startTime: formatTime(validatedData.start_time), // Formato "HH:MM:SS"
        endTime: formatTime(validatedData.end_time), // Formato "HH:MM:SS"
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