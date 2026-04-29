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
      
      // Update UI local state
      setAppStatus(status);
      if (status === 'accepted') setShStatus('filled');

      Alert.alert("Success", status === 'accepted' ? "Candidate hired!" : "Candidate rejected");
    } catch (err: any) {
      if (err.message?.includes('SHIFT_ALREADY_FILLED')) {
        Alert.alert("Too Late!", "This shift has just been filled by another candidate.");
      } else if (err.code === '23505') {
        Alert.alert("Conflict", "A candidate is already accepted for this shift.");
      } else {
        Alert.alert("Error", "Action failed. Check your connection.");
      }
      console.error("Update Error:", err);
    } finally {
      setProcessing(null);
    }
  };

  return { processing, handleUpdateStatus };
}