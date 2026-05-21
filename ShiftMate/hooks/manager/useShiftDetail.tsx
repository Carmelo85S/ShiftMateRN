import { useState, useCallback, useEffect } from "react";
import { useFocusEffect } from "expo-router";
import { fetchShiftFullDetails, completeShiftWithActualTime } from "@/queries/managerQueries";
import { supabase } from "@/lib/supabase";

export const useShiftDetail = (id: string | string[] | undefined) => {
  const [shift, setShift] = useState<any | null>(null);
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Stato locale per l'utente loggato attuale (richiesto dalla UI per i permessi)
  const [user, setUser] = useState<{ id: string; role: string } | null>(null);

  // 1. Recuperiamo l'utente loggato e il suo ruolo dai metadati della sessione di Supabase
  useEffect(() => {
    const fetchCurrentUser = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser) {
        console.log("Metadati utente reali Auth:", authUser.user_metadata);

        setUser({
          id: authUser.id,
          // Se user_metadata.role è vuoto, dato che siamo nel flusso manager, 
          // impostiamo "manager" come fallback di sicurezza per i tuoi test locale
          role: authUser.user_metadata?.role || "manager", 
        });
      }
    };
    fetchCurrentUser();
  }, []);

  const loadData = useCallback(async () => {
    if (!id) return;
    try {
      const result = await fetchShiftFullDetails(id as string);
      
      // DEBUG: Controlliamo la struttura esatta che arriva dalla query
      console.log("📊 [HOOK REFRESH] Dati grezzi ricevuti dalla query:", result);

      if (result) {
        setShift(result.shift);
        setApplications(result.applications || []);
      }
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

  // 2. Nuova funzione per completare il turno e aggiornare la UI all'istante
  const completeShift = async (actualEndTime: string) => {
    if (!id) return;
    
    // Invia i dati a Supabase (dove il tuo trigger ricalcolerà la paga reale con l'overtime)
    await completeShiftWithActualTime(id as string, actualEndTime);
    
    // Aggiorna ottimisticamente lo stato locale dello shift in React
    // In questo modo lo 'status' diventa 'completed', l'orario si aggiorna e il pulsante scompare subito
    setShift((prevShift: any) => {
      if (!prevShift) return null;
      return {
        ...prevShift,
        status: "completed",
        end_time: actualEndTime
      };
    });
  };

  return {
    shift,          // Esposto direttamente in modo lineare alla UI
    applications,   // Esposto direttamente in modo lineare alla UI
    loading,
    refreshing,
    onRefresh,
    user,          // Esposto per il controllo condizionale del pulsante
    completeShift, // Esposta per l'azione del Pressable
  };
};