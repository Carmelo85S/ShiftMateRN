import { fetchCandidateShiftDetails } from "@/queries/managerQueries";
import { useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Alert } from "react-native";


type Profile = {
  id: string;
  name: string | null;
  surname: string | null;
  avatar_url: string | null;
  bio: string | null;
  experience: string | null;
  phone: string | null;
  job_role: string | null;
  department: string | null;
};

type ShiftInfo = {
  title: string;
  shift_date: string;
  start_time: string;
  end_time: string;
};

export const useFetchCandidateProfile = () => {
  const { id, shiftId } = useLocalSearchParams();

const [profile, setProfile] = useState<Profile | null>(null);
const [loading, setLoading] = useState(true);

const [applicationStatus, setApplicationStatus] = useState<string | null>(null);
const [shiftStatus, setShiftsStatus] = useState<string | null>(null);
const [shiftInfo, setShiftInfo] = useState<ShiftInfo | null>(null);

const fetchProfile = useCallback(async () => {
    if (!id || !shiftId) return;
    setLoading(true);
    try {
      const data = await fetchCandidateShiftDetails(shiftId as string, id as string);
      
      if (!data.profile) {
        setProfile(null);
        return;
      }
      setProfile(data.profile);
      setApplicationStatus(data.applicationStatus);
      setShiftsStatus(data.shiftStatus);
      setShiftInfo(data.shiftInfo);
    } catch (err) {
      console.error("Error fetching profile:", err);
      Alert.alert("Error", "Could not load candidate profile.");
    } finally {
      setLoading(false);
    }
  }, [id, shiftId]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return { profile, loading, applicationStatus, setApplicationStatus, shiftStatus, setShiftsStatus, shiftInfo, setShiftInfo, fetchProfile }
}