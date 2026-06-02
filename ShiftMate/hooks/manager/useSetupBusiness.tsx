import { useState } from "react";
import { Alert } from "react-native";
import * as WebBrowser from 'expo-web-browser'; // Importa WebBrowser
import { supabase } from "@/lib/supabase";
import { useRouter } from "expo-router";
import { createBusinessAndAssignOwner } from "@/queries/managerQueries";

export const useSetupBusiness = () => {
  const [businessName, setBusinessName] = useState("");
  const [businessAddress, setBusinessAddress] = useState("");
  const [businessCity, setBusinessCity] = useState("");
  const [businessType, setBusinessType] = useState("standard");
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
      
      const businessId = await createBusinessAndAssignOwner(
        user.id, businessName, inviteCode, businessAddress, businessCity, businessType
      );

      const SUPABASE_LINK = process.env.EXPO_PUBLIC_SUPABASE_URL;
      const response = await fetch(`${SUPABASE_LINK}/functions/v1/create-checkout-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          priceId: 'price_1TdRTrPf9BDNyCapNvDt0Cxt', 
          businessId: businessId 
        }),
      });

      const result = await response.json();
      if (result.error) throw new Error(result.error);

      // Feedback e apertura WebBrowser in-app
      Alert.alert(
        "Business Created!",
        "Now, let's set up your subscription. We'll open a secure window to complete your payment.",
        [
          { 
            text: "CONTINUE TO PAYMENT", 
            onPress: async () => {
              if (result.url) {
                // Utilizzo di WebBrowser al posto di Linking
                await WebBrowser.openBrowserAsync(result.url);
              } else {
                Alert.alert("Error", "Could not load payment page.");
              }
            }
          }
        ]
      );

    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  return {
    businessName, setBusinessName, businessAddress, setBusinessAddress,
    businessCity, setBusinessCity, businessType, setBusinessType,
    loading, handleCreateBusiness
  };
};