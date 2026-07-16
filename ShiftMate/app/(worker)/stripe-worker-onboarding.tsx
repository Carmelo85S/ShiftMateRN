import { supabase } from "@/lib/supabase";
import * as Linking from "expo-linking";
import { Stack, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

export default function WorkerStripeOnboarding() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleStartOnboarding = async () => {
    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Utente non autenticato");

      const { data, error } = await supabase.functions.invoke(
        "create-worker-stripe-onboarding",
        {
          method: "POST",
          body: { userId: user.id, email: user.email },
        },
      );

      if (error) throw error;
      if (data?.url) await Linking.openURL(data.url);
    } catch (err: any) {
      Alert.alert(
        "Errore",
        "Impossible connect to Stripe. Please try again later.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: "Setting Stripe" }} />
      <Text style={styles.title}>Receive Payments</Text>
      <Text style={styles.subtitle}>
        Connect your Stripe account to receive payments for completed shifts.
      </Text>

      <Pressable
        style={styles.button}
        onPress={handleStartOnboarding}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Connect Stripe</Text>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  title: { fontSize: 22, fontWeight: "800", marginBottom: 12 },
  subtitle: { textAlign: "center", color: "#666", marginBottom: 30 },
  button: {
    backgroundColor: "#000",
    padding: 18,
    borderRadius: 12,
    width: "100%",
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontWeight: "bold" },
});
