import { fetchShiftFullDetails } from "@/queries/managerQueries";
import { useFocusEffect, useLocalSearchParams } from "expo-router";
import { useState, useCallback } from "react";

export const useLoadShiftApplication = () => {
    const { id } = useLocalSearchParams();
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState<'all' | 'applied' | 'accepted'>('all');

    const loadData = useCallback(async () => {
        try {
        const result = await fetchShiftFullDetails(id as string);
        setData(result);
        } catch (err) {
        console.error(err);
        } finally {
        setLoading(false);
        }
    }, [id]);

    useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

    return { data, loading, search, setSearch, filter, setFilter };   
}