import { useState } from "react";
import { Alert } from "react-native";
import { supabase } from "@/lib/supabase";
import { useRouter } from "expo-router";
import { createBusinessAndAssignOwner } from "@/queries/managerQueries";

export const useSetupBusiness = () => {
  const [businessName, setBusinessName] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const generateInviteCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "";
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const handleCreateBusiness = async () => {
    if (!businessName.trim()) {
      Alert.alert("Attention", "Please enter your business name.");
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not found.");

      const inviteCode = generateInviteCode();
      await createBusinessAndAssignOwner(user.id, businessName, inviteCode);

      Alert.alert(
        "Business Created!",
        `Invite code: ${inviteCode}. Share it with your team to let them join.`,
        [{ 
          text: "LET'S START", 
          onPress: () => router.replace("/(manager)/(tabs)/dashboard") 
        }]
      );

    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  return {
    businessName,
    setBusinessName,
    loading,
    handleCreateBusiness
  };
};