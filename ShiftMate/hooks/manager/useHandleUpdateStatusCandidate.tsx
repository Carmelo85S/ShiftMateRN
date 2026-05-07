import { updateApplicationStatus } from "@/queries/managerQueries";
import { useLocalSearchParams } from "expo-router";
import { useState, useCallback } from "react";
import { Alert } from "react-native";

export const useHandleUpdateStatusCandidate = (
  setAppStatus: (s: string) => void, 
  setShStatus: (s: string) => void
) => {
  const { id: profileId, shiftId } = useLocalSearchParams<{ id: string; shiftId: string }>();    
  const [processing, setProcessing] = useState<"accepted" | "rejected" | null>(null);
    
  const handleUpdateStatus = useCallback(async (status: "accepted" | "rejected") => {
    if (!shiftId || !profileId) return;

    setProcessing(status);
    try {
      await updateApplicationStatus(shiftId, profileId, status);
      
      // Sincronizzazione immediata dello stato locale
      setAppStatus(status);
      if (status === 'accepted') setShStatus('filled');

      Alert.alert("Successo", status === 'accepted' ? "Candidato assunto!" : "Candidatura rifiutata");
    } catch (err: any) {
      console.error("Update Error:", err);
      if (err.message?.includes('APPLICATION NOT FOUND')) {
        Alert.alert("Errore", "Candidatura non trovata. Potrebbe essere stata cancellata.");
      } else {
        Alert.alert("Errore", "Impossibile aggiornare lo stato.");
      }
    } finally {
      setProcessing(null);
    }
  }, [profileId, shiftId, setAppStatus, setShStatus]);

  return { processing, handleUpdateStatus };
};