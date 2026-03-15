// app/index.tsx
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { supabase } from "@/lib/supabase";
import { Stack, useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

export default function Home() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];

  // controlla se l'utente è loggato
  supabase.auth.getUser().then(({ data }) => {
    if (data.user) router.replace("/(tabs)/shifts");
  });

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Text style={[styles.title, { color: theme.tint }]}>ShiftMate</Text>
        <Text style={[styles.subtitle, { color: theme.text }]}>
          Discover your next work shift instantly
        </Text>

        <View style={styles.actions}>
          <Pressable
            style={[styles.button, { backgroundColor: theme.tint }]}
            onPress={() => router.push("/auth/login")}
          >
            <Text style={styles.buttonText}>Login</Text>
          </Pressable>

          <Pressable
            style={[styles.buttonOutline, { borderColor: theme.tint }]}
            onPress={() => router.push("/auth/register")}
          >
            <Text style={[styles.buttonTextOutline, { color: theme.tint }]}>
              Create Account
            </Text>
          </Pressable>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  title: { fontSize: 36, fontWeight: "bold", marginBottom: 12 },
  subtitle: {
    fontSize: 18,
    textAlign: "center",
    marginBottom: 24,
    opacity: 0.8,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  button: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    marginRight: 12,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontWeight: "600", fontSize: 16 },
  buttonOutline: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    marginLeft: 12,
    alignItems: "center",
  },
  buttonTextOutline: { fontWeight: "600", fontSize: 16 },
});
