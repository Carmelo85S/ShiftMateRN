import { useState } from "react";
import { Alert } from "react-native";
import { useRouter } from "expo-router";
import { updateShift, deleteShift } from "@/queries/managerQueries";

interface ShiftForm {
  title: string;
  department: string;
  hourly_rate: string;
  description?: string;
  date: Date;
  startTime: Date;
  endTime: Date;
}

export const useEditShiftActions = (
  id: string | undefined, 
  form: ShiftForm, 
  imageUrl: string | null
) => {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleUpdate = async () => {
    if (!id) return;
    if (!form.title || !form.department || !form.hourly_rate) {
      Alert.alert("Missing Info", "Department, Title, and Hourly Rate are required.");
      return;
    }

    setSaving(true);
    try {
      await updateShift(id, {
        title: form.title,
        department: form.department,
        hourly_rate: form.hourly_rate,
        description: form.description ?? "",
        shift_date: form.date,
        start_time: form.startTime,
        end_time: form.endTime,
        image_url: imageUrl,
      });
      
      Alert.alert("Success", "Shift updated!", [
        { text: "OK", onPress: () => router.back() }
      ]);
    } catch (err: any) {
      Alert.alert("Error", err.message || "Something went wrong.");
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
            // Usiamo replace per evitare che l'utente torni indietro a una pagina vuota
            router.replace("/(manager)/(tabs)/shift");
          } catch (err) {
            Alert.alert("Error", "Could not delete the shift.");
          } finally { 
            setDeleting(false); 
          }
        }
      }
    ]);
  };

  return { saving, deleting, handleUpdate, handleDelete };
};