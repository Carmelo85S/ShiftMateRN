import { supabase } from "@/lib/supabase";
import { fetchManagerHistory } from "@/queries/managerQueries";
import { useState, useCallback } from "react";

export const useLoadHistory = () => {

    const [history, setHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [totalHistorySpending, setTotalHistorySpending] = useState(0);
    
    const loadHistory = useCallback(async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.user?.id) return;
        
            const data = await fetchManagerHistory(session.user.id);
            setHistory(data);
        
            const total = data.reduce((acc, shift) => acc + (Number(shift.total_pay) || 0), 0);
            setTotalHistorySpending(total);
        } catch (error) {
            console.error("History error:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    return {history, setHistory, loading, setLoading, totalHistorySpending, setTotalHistorySpending, loadHistory}
}