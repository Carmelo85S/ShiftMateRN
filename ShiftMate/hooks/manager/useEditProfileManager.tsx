import { useState, useEffect, useCallback } from "react";
import { Alert } from "react-native";
import { useRouter } from "expo-router";
import { supabase } from "@/lib/supabase";
import { fetchUserProfile, updateUserProfile } from "@/queries/managerQueries";

export type Department = 'bar' | 'kitchen' | 'restaurant' | 'housekeeping' | 'reception' | 'maintenance' | '';

export const useEditProfileManager = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    id: "",
    name: "",
    surname: "",
    job_role: "",
    bio: "",
    phone: "",
    department: "" as Department,
    avatar_url: null as string | null,
  });

  const loadData = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      const data = await fetchUserProfile(user.id);
      if (data) {
        setForm({
          id: data.id,
          name: data.name ?? "",
          surname: data.surname ?? "",
          job_role: data.job_role ?? "",
          bio: data.bio ?? "",
          phone: data.phone ?? "",
          department: (data.department as Department) ?? "",
          avatar_url: data.avatar_url ?? null,
        });
      }
    } catch (error) { 
      console.error("Error loading profile:", error); 
    } finally { 
      setLoading(false); 
    }
  }, []);

  useEffect(() => { 
    loadData(); 
  }, [loadData]);

  const selectDepartment = () => {
    const deps: Department[] = ['bar', 'kitchen', 'restaurant', 'housekeeping', 'reception', 'maintenance'];
    Alert.alert("Department", "Select your area", [
      ...deps.map((dep) => ({
        text: dep.charAt(0).toUpperCase() + dep.slice(1),
        onPress: () => setForm((prev) => ({ ...prev, department: dep })),
      })),
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const handleSave = async () => {
    if (!form.name || !form.surname) {
      Alert.alert("Missing Info", "Name and Surname are required.");
      return;
    }
    setSaving(true);
    try {
      const cleanAvatarUrl = form.avatar_url?.split('?')[0] || null;
      await updateUserProfile(form.id, { ...form, avatar_url: cleanAvatarUrl });
      router.back();
    } catch (error: any) { 
      Alert.alert("Error", error.message); 
    } finally { 
      setSaving(false); 
    }
  };

  const handleDeleteProfile = () => {
    Alert.alert("Delete Account", "Are you sure? This action is permanent.", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete Everything", style: "destructive", onPress: async () => {
          setSaving(true);
          try {
            const { error } = await supabase.functions.invoke('delete-user');
            if (error) throw error;
            await supabase.auth.signOut();
            router.replace("/");
          } catch (error: any) { 
            Alert.alert("Error", error.message); 
          } finally { 
            setSaving(false); 
          }
      }}
    ]);
  };

  return { 
    form, 
    setForm, 
    loading, 
    saving, 
    handleSave, 
    handleDeleteProfile, 
    selectDepartment 
  };
};