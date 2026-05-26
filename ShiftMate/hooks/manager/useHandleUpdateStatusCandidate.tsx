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
      
      // Immediate synchronization of local state
      setAppStatus(status);
      if (status === 'accepted') setShStatus('filled');

      Alert.alert(
        "Success", 
        status === 'accepted' ? "Candidate hired successfully!" : "Application rejected."
      );
    } catch (err: any) {
      console.error("Update Error:", err);
      
      // 1. Intercept Supabase unique constraint violation
      if (err.code === '23505' || err.message?.includes('only_one_accepted_per_shift')) {
        Alert.alert(
          "Position Already Filled", 
          "This shift already has an accepted candidate. If you want to change the worker, you must first reject or remove the currently confirmed candidate."
        );
      } 
      // 2. Control check for application not found
      else if (err.message?.includes('APPLICATION NOT FOUND')) {
        Alert.alert("Error", "Application not found. It might have been deleted.");
      } 
      // 3. Generic fallback
      else {
        Alert.alert("System Error", "Unable to update the candidate status at this moment.");
      }
    } finally {
      // Reset loading state in ANY scenario (success or error)
      setProcessing(null); 
    }
  }, [profileId, shiftId, setAppStatus, setShStatus]);

  return { processing, handleUpdateStatus };
};