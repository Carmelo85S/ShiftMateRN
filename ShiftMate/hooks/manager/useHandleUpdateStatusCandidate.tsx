import { updateApplicationStatus } from "@/queries/managerQueries";
import { useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Alert } from "react-native";

export const useHandleUpdateStatusCandidate = (
  setAppStatus: (s: string) => void, 
  setShStatus: (s: string) => void
) => {
  const { id, shiftId } = useLocalSearchParams();    
  const [processing, setProcessing] = useState<"accepted" | "rejected" | null>(null);
    
  const handleUpdateStatus = async (status: "accepted" | "rejected") => {
    if (!shiftId || !id) return;

    setProcessing(status);
    try {
      await updateApplicationStatus(shiftId as string, id as string, status);
      
      setAppStatus(status);
      if (status === 'accepted') setShStatus('filled');

      Alert.alert("Success", `Candidate ${status}`, [{ text: "OK" }]);
    } catch (err) {
      Alert.alert("Error", "Action failed.");
    } finally {
      setProcessing(null);
    }
  };

  return { processing, handleUpdateStatus };
}