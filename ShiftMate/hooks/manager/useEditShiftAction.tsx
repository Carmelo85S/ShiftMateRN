import { deleteShift, updateShift } from "@/queries/managerQueries";
import { FormShift, FormShiftSchema } from "@/src/validation/formShift.schema";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert } from "react-native";

// --- HELPER FUNCTIONS ---
const formatTime = (date: any): string => {
  if (typeof date === "string" && date.includes(":") && !date.includes("T")) {
    return date.split(":").length === 2 ? `${date}:00` : date;
  }
  const d = new Date(date);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}:${String(d.getSeconds()).padStart(2, "0")}`;
};

const formatDate = (date: any): string => {
  if (typeof date === "string" && !date.includes("T")) return date;
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

export const useEditShiftActions = ({
  id,
  imageUrl,
}: {
  id: string | undefined;
  imageUrl: string | null;
}) => {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleUpdate = async (formData: FormShift) => {
    if (!id) return;

    // 1. Valida i dati così come sono (Zod gestirà i null e le stringhe vuote)
    const validation = FormShiftSchema.safeParse(formData);

    if (!validation.success) {
      // Logga l'errore per capire QUALE campo fallisce
      console.error(
        "Zod Validation Error:",
        validation.error.flatten().fieldErrors,
      );
      Alert.alert(
        "Attenzione",
        "Dati non validi: " + validation.error.issues[0].message,
      );
      return;
    }

    setSaving(true);
    try {
      // 2. USA I DATI VALIDATI (validation.data)
      // Non ricostruire il payload manualmente, usa il risultato di Zod
      const payload = {
        ...validation.data,
        // Formatta solo le date/time che Zod ha già validato
        shift_date: formatDate(validation.data.shift_date),
        start_time: formatTime(validation.data.start_time),
        end_time: formatTime(validation.data.end_time),
        image_url: imageUrl, // Questo rimane esterno perché è gestito dallo stato dell'uploader
      };

      console.log("DEBUG: Invio al DB:", payload);
      await updateShift(id, payload);

      Alert.alert("Success", "Shift updated!");
      router.back();
    } catch (err: any) {
      console.error("DEBUG - Errore DB:", err);
      Alert.alert("Errore", "Impossibile aggiornare lo shift.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
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
          } catch (err: any) {
            console.error("DELETE ERROR:", err);
            Alert.alert("Error", "Could not delete shift.");
          } finally {
            setDeleting(false);
          }
        },
      },
    ]);
  };

  return { saving, deleting, handleUpdate, handleDelete };
};
