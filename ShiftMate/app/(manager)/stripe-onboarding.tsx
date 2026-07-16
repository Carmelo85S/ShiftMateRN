import { Colors } from "@/constants/theme";
import { useAuth } from "@/hooks/auth/useAuth"; // Assicurati di usare l'hook che abbiamo creato
import { supabase } from "@/lib/supabase";
import * as Linking from "expo-linking";
import { Stack, useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

export default function StripeOnboarding() {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const router = useRouter();
  const theme = Colors.light;

  useFocusEffect(
    useCallback(() => {
      const handleDeepLink = async (event: { url: string }) => {
        if (event.url.includes("stripe-return")) {
          await supabase.functions.invoke("check-stripe-status", {
            body: { businessId: user?.id },
          });
          router.replace("/(manager)/(tabs)/dashboard");
        }
      };

      const subscription = Linking.addEventListener("url", handleDeepLink);
      return () => subscription.remove();
    }, []),
  );

  const handleStartOnboarding = async () => {
    if (!user) return;
    setLoading(true);

    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("business_id")
        .eq("id", user.id)
        .single();

      if (!profile?.business_id) throw new Error("Business non trovato");

      const { data, error } = await supabase.functions.invoke(
        "create-stripe-onboarding-link",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            businessId: profile.business_id,
            email: user.email,
          }),
        },
      );

      if (error) throw error;

      if (data?.url) {
        await Linking.openURL(data.url);
      }
    } catch (err: any) {
      console.error(err);
      Alert.alert(
        "Error",
        "Impossible to start Stripe onboarding. Please try again later.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.iconContainer}>
        <Text style={styles.emoji}>🏦</Text>
      </View>
      <Text style={styles.title}>Payment Configuration</Text>
      <Text style={styles.subtitle}>
        Connect your Stripe account to manage payments and receive payouts. It's
        a quick and secure process.
      </Text>

      <Pressable
        style={[styles.button, { backgroundColor: theme.text }]}
        onPress={handleStartOnboarding}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Connect Stripe Account</Text>
        )}
      </Pressable>

      <Pressable
        onPress={() => router.replace("/(manager)/(tabs)/dashboard")}
        style={styles.backButton}
      >
        <Text style={styles.backText}>Back to Dashboard</Text>
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
  iconContainer: {
    marginBottom: 20,
    padding: 20,
    backgroundColor: "#f0f0f0",
    borderRadius: 30,
  },
  emoji: { fontSize: 40 },
  title: { fontSize: 24, fontWeight: "800", marginBottom: 12 },
  subtitle: {
    textAlign: "center",
    color: "#666",
    fontSize: 16,
    marginBottom: 30,
    lineHeight: 22,
  },
  button: {
    padding: 18,
    borderRadius: 16,
    width: "100%",
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  backButton: { marginTop: 20 },
  backText: { color: "#666", fontWeight: "600" },
});
