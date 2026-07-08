import { getShiftForEdit } from "@/queries/managerQueries";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";

export const useFetchShift = (
  id: string | undefined,
  setForm: (data: any) => void,
) => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [shiftData, setShiftData] = useState<any>(null);

  useEffect(() => {
    console.log("DEBUG: useFetchShift triggerato con ID:", id);
    const fetchShift = async () => {
      if (!id) return;

      setLoading(true);
      try {
        const data = await getShiftForEdit(id);
        console.log("Fetched shift data:", data);

        if (!data) {
          router.replace("/(manager)/(tabs)/shift");
          return;
        }

        // 1. Salva i dati grezzi per poterli usare nel componente
        setShiftData(data);

        // 2. Popola il form con i valori formattati
        setForm({
          title: data.title,
          description: data.description ?? "",
          department: data.department_id ?? "",
          hourly_rate: data.hourly_rate?.toString() ?? "",
          shift_date: new Date(data.shift_date),
          start_time: new Date(`1970-01-01T${data.start_time}`),
          end_time: new Date(`1970-01-01T${data.end_time}`),
        });

        setImageUrl(data.image_url ?? null);
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchShift();
  }, [id, setForm]);

  // IMPORTANTE: Esporta shiftData qui!
  return { loading, imageUrl, setImageUrl, shiftData };
};
