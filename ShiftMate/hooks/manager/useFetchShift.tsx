import { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import { getShiftForEdit } from "@/queries/managerQueries";

export const useFetchShift = (id: string | undefined, setForm: (data: any) => void) => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchShift = async () => {
      if (!id) return;
      
      setLoading(true);
      try {
        const data = await getShiftForEdit(id);
        
        if (!data) {
          router.replace("/(manager)/(tabs)/shift");
          return;
        }
        setForm({
          title: data.title,
          description: data.description ?? "",
          department: data.department ?? "",
          industry: "hospitality",
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

  return { loading, imageUrl, setImageUrl };
};