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

    const validation = FormShiftSchema.safeParse(formData);
    if (!validation.success) {
      Alert.alert("Attenzione", validation.error.issues[0].message);
      return;
    }

    setSaving(true);
    try {
      const payload = {
        title: formData.title,
        description: formData.description ?? "",
        department_id:
          formData.department_id &&
          formData.department_id !== "staffing_agency_global" &&
          formData.department_id.length > 30
            ? formData.department_id
            : null,
        shift_date: formatDate(formData.shift_date),
        start_time: formatTime(formData.start_time),
        end_time: formatTime(formData.end_time),
        image_url: imageUrl,
        hourly_rate: Number(formData.hourly_rate) || 0,
        required_workers: formData.required_workers ?? 1,
        client_name: formData.client_name ?? null,
        address: formData.address ?? null,
        city: formData.city ?? null,
      };

      console.log("DEBUG ID:", id);
      console.log("DEBUG DEPARTMENT_ID:", payload.department_id);

      if (payload.department_id && payload.department_id.length < 30) {
        console.warn(
          "ATTENZIONE: department_id sembra non essere un UUID valido!",
        );
      }

      console.log("DEBUG: Invio update a Supabase", {
        targetId: id,
        isIdValidUuid: id && id.length === 36,
        payload: payload,
      });

      await updateShift(id, payload);
      Alert.alert("Success", "Shift updated!");
      router.back();
    } catch (err: any) {
      console.error(
        "DEBUG - Errore ricevuto dal DB:",
        JSON.stringify(err, null, 2),
      );
      Alert.alert("Errore", err.message || "Errore sconosciuto");
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
