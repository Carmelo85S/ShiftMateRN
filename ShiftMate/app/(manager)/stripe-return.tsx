import { supabase } from "@/lib/supabase";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";

export default function StripeReturn() {
  const router = useRouter();
  const { businessId } = useLocalSearchParams();

  useEffect(() => {
    async function finalizeOnboarding() {
      if (!businessId) {
        router.replace("/(manager)/(tabs)/dashboard");
        return;
      }

      // Chiamata per forzare l'aggiornamento
      await supabase.functions.invoke("check-stripe-status", {
        body: { businessId },
      });

      router.replace("/(manager)/(tabs)/dashboard");
    }
    finalizeOnboarding();
  }, [businessId]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center" },
});
