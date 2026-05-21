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

// --- HELPER FUNCTIONS PER TRASFORMARE LE DATE IN STRINGHE COMPATIBILI CON POSTGRES ---
const formatTime = (date: any): string => {
  if (typeof date === "string" && date.includes(":") && !date.includes("T")) {
    return date.split(":").length === 2 ? `${date}:00` : date;
  }
  const d = new Date(date);
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`; // Restituisce esattamente "HH:MM:SS"
};

const formatDate = (date: any): string => {
  if (typeof date === "string" && !date.includes("T")) return date;
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`; // Restituisce esattamente "YYYY-MM-DD"
};

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
      // MODIFICATO: Formattiamo i dati allineandoli alla firma esatta di updateShift
      await updateShift(id, {
        title: validatedData.title,
        description: validatedData.description ?? "",
        departmentId: validatedData.department, // Cambiato da department a departmentId per matchare la query
        shift_date: formatDate(validatedData.shift_date), // Formattato in stringa "YYYY-MM-DD"
        start_time: formatTime(validatedData.start_time), // Formattato in stringa "HH:MM:SS"
        end_time: formatTime(validatedData.end_time),     // Formattato in stringa "HH:MM:SS"
        image_url: imageUrl,
        hourly_rate: Number(validatedData.hourly_rate) || 0, // Passato come numero puro
      });
      
      Alert.alert("Success", "Shift updated!", [
        { text: "OK", onPress: () => router.back() }
      ]);
    } catch (err: any) {
      console.error("Crash durante updateShift:", err);
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