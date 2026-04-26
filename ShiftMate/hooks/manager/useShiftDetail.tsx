import { useState, useCallback } from "react";
import { useFocusEffect } from "expo-router";
import { fetchShiftFullDetails } from "@/queries/managerQueries";

export const useShiftDetail = (id: string | string[] | undefined) => {
  const [data, setData] = useState<{ shift: any; applications: any[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    if (!id) return;
    try {
      const result = await fetchShiftFullDetails(id as string);
      setData(result);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  return {
    shift: data?.shift,
    applications: data?.applications ?? [],
    loading,
    refreshing,
    onRefresh,
  };
};