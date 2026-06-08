import { createBusinessAndAssignOwner } from "@/queries/managerQueries";
import * as WebBrowser from "expo-web-browser";
import { useState } from "react";
import { Alert } from "react-native";

export const useSetupBusiness = () => {
  const [businessName, setBusinessName] = useState("");
  const [businessAddress, setBusinessAddress] = useState("");
  const [businessCity, setBusinessCity] = useState("");
  const [businessType, setBusinessType] = useState("standard");
  const [loading, setLoading] = useState(false);

  const generateInviteCodeManager = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "";
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const generateInviteCodeTeam = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "";
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const createBusinessRecord = async (userId: string) => {
    setLoading(true);
    try {
      const inviteCodeMgr = generateInviteCodeManager();
      const inviteCodeWrk = generateInviteCodeTeam();
      return await createBusinessAndAssignOwner(
        userId,
        businessName,
        inviteCodeMgr,
        inviteCodeWrk,
        businessAddress,
        businessCity,
        businessType,
      );
    } catch (error: any) {
      Alert.alert("Error", error.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async (
    priceId: string,
    businessId: string,
    mode: "payment" | "subscription",
  ) => {
    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/create-checkout-session`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ priceId, businessId, mode }),
        },
      );
      const result = await response.json();
      console.log("Server response:", result);
      if (result.error) throw new Error(result.error);
      if (result.url) await WebBrowser.openBrowserAsync(result.url);
    } catch (error: any) {
      Alert.alert("Errore", error.message);
    } finally {
      setLoading(false);
    }
  };

  return {
    businessName,
    setBusinessName,
    businessAddress,
    setBusinessAddress,
    businessCity,
    setBusinessCity,
    businessType,
    setBusinessType,
    loading,
    createBusinessRecord,
    handlePayment,
  };
};
