import { useState, useEffect } from "react";
import { Alert } from "react-native";
import { supabase } from "@/lib/supabase";
import { useRouter } from "expo-router";

export const useEditProfile = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<any>({});

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userData.user.id)
        .single();

      if (error) throw error;
      if (data) setForm(data);
    } catch (error) {
      Alert.alert("Error", "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const executeUpdate = async (sanitizedPhone: string) => {
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        name: form.name,
        surname: form.surname,
        job_role: form.job_role,
        bio: form.bio,
        phone: sanitizedPhone,
        experience: form.experience,
        department: form.department,
        avatar_url: form.avatar_url,
      })
      .eq("id", form.id);

    setSaving(false);

    if (error) {
      Alert.alert("Error", error.message);
    } else {
      Alert.alert("Success", "Profile updated");
      router.back();
    }
  };

  const handleSave = async () => {
    const trimmedPhone = form.phone?.trim() || "";
    
    if (!trimmedPhone) {
      Alert.alert("Missing Info", "Phone number is required.");
      return;
    }

    const phoneRegex = /^\+?[0-9\s-]{8,20}$/;
    if (!phoneRegex.test(trimmedPhone)) {
      Alert.alert("Invalid Phone", "Please enter a valid phone number.");
      return;
    }

    if (!trimmedPhone.startsWith('+')) {
      Alert.alert(
        "International Format", 
        "We recommend starting with '+' and country code. Save anyway?",
        [
          { text: "Edit", style: "cancel" },
          { text: "Save Anyway", onPress: () => executeUpdate(trimmedPhone) }
        ]
      );
      return; 
    }
    executeUpdate(trimmedPhone);
  };

  const selectDepartment = (callback: (dept: string) => void) => {
    const deps = ['bar', 'kitchen', 'restaurant', 'housekeeping', 'reception', 'maintenance'];
    Alert.alert("Select Department", "Where do you work?", [
      ...deps.map(d => ({ 
        text: d.toUpperCase(), 
        onPress: () => callback(d) 
      })),
      { text: "Cancel", style: "cancel" }
    ]);
  };

  return { 
    form, 
    setForm, 
    loading, 
    saving, 
    handleSave, 
    selectDepartment 
  };
};