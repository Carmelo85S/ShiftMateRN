import { useState } from "react";
import { Alert } from "react-native";
import { useRouter } from "expo-router";
import { updateShift, deleteShift } from "@/queries/managerQueries";
import { FormShiftSchema, FormShift } from "@/src/validation/formShift.schema";

interface UseEditShiftProps {
  id: string | undefined;
  form: FormShift;
  imageUrl: string | null;
}

export const useEditShiftActions = ({ id, form, imageUrl }: UseEditShiftProps) => {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleUpdate = async () => {
    if (!id) {
      Alert.alert("Errore", "ID turno mancante.");
      return;
    }

    // Zod validation
    const validation = FormShiftSchema.safeParse(form);
    
    if (!validation.success) {
      const firstError = validation.error.issues[0]?.message ?? "Dati non validi";
      Alert.alert("Attenzione", firstError);
      return;
    }

    const validatedData = validation.data;

    setSaving(true);
    try {
      await updateShift(id, {
        title: validatedData.title,
        department: validatedData.department,
        hourly_rate: validatedData.hourly_rate.toString(), 
        description: validatedData.description ?? "",
        shift_date: validatedData.shift_date,
        start_time: validatedData.start_time,
        end_time: validatedData.end_time,
        image_url: imageUrl,
      });
      
      Alert.alert("Success", "Shift updated!", [
        { text: "OK", onPress: () => router.back() }
      ]);
    } catch (err: any) {
      Alert.alert("Errore", err.message || "Impossible to update shift.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    if (!id) return;

    Alert.alert("Delete Shift", "Are you sure? This action is irreversible.", [
      { text: "Cancel", style: "cancel" },
      { 
        text: "Delete", 
        style: "destructive", 
        onPress: async () => {
          setDeleting(true);
          try {
            await deleteShift(id);
            router.replace("/(manager)/(tabs)/shift");
          } catch (err) {
            Alert.alert("Error", "Unable to delete shift.");
          } finally { 
            setDeleting(false); 
          }
        }
      }
    ]);
  };

  return { saving, deleting, handleUpdate, handleDelete };
};