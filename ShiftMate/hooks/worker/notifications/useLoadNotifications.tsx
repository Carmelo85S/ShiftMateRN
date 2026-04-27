import { supabase } from "@/lib/supabase";
import { fetchWorkerNotifications } from "@/queries/workerQueries";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";

export const useLoadNotifications = () => {
    const [notifications, setNotifications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const loadNotifications = async () => {
        try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const data = await fetchWorkerNotifications(user.id);
        setNotifications(data);
        } catch (error) {
        console.error("Error loading notifications:", error);
        } finally {
        setLoading(false);
        setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
        loadNotifications();
        }, [])
    );

    return {notifications, setNotifications, loading, setLoading, refreshing, setRefreshing, loadNotifications}
}