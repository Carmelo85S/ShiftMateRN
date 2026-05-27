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

  const formatTime = (date: Date): string => {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  };

  const formatDate = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };

  const handleCreate = async (form: any) => {
    // 1. Validazione Zod
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

      // 🌟 SICUREZZA DOPPIA
      const incomingDepartment = validatedData.department || form.department;
      const finalDepartmentId = incomingDepartment === "staffing_agency_global" ? null : incomingDepartment;

      // 2. Costruzione del payload definitivo per Postgres
      const payload = {
        title: validatedData.title,
        description: validatedData.description || "",
        departmentId: finalDepartmentId,
        hourly_rate: validatedData.hourly_rate, 
        date: formatDate(validatedData.shift_date), 
        startTime: formatTime(validatedData.start_time), 
        endTime: formatTime(validatedData.end_time),
        required_workers: validatedData.required_workers || form.required_workers || 1, 
        address: (validatedData as any).address || form.address || null,
        city: (validatedData as any).city || form.city || null,
        client_name: (validatedData as any).client_name || form.client_name || null, // 🌟 AGGIUNTO QUI!
      };

      // Invia alla query
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