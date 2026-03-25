// app/index.tsx
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { supabase } from "@/lib/supabase";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, useRouter } from "expo-router";
import { useEffect } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

export default function Home() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        router.replace("/(tabs)/shifts");
      }
    };
    checkUser();
  }, []);

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.container}>
        {/* 🖼 BACKGROUND */}
        <Image
          source={require("@/assets/images/heroImage.png")}
          style={StyleSheet.absoluteFillObject}
          contentFit="cover"
        />

        {/* 🌈 GRADIENT (molto meglio del nero piatto) */}
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.8)"]}
          style={StyleSheet.absoluteFillObject}
        />

        {/* 🔽 CONTENUTO */}
        <View style={styles.content}>
          <View style={styles.textBlock}>
            <Text style={styles.title}>ShiftMate</Text>
            <Text style={styles.subtitle}>
              Discover your next work shift instantly
            </Text>
          </View>

          <View style={styles.actions}>
            <Pressable
              style={styles.button}
              onPress={() => router.push("/auth/login")}
            >
              <Text style={styles.buttonText}>Login</Text>
            </Pressable>

            <Pressable
              style={styles.buttonOutline}
              onPress={() => router.push("/auth/register")}
            >
              <Text style={styles.buttonTextOutline}>Create Account</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  content: {
    flex: 1,
    justifyContent: "flex-end",
    padding: 24,
    paddingBottom: 50,
  },

  textBlock: {
    marginBottom: 28,
  },

  title: {
    fontSize: 42,
    fontWeight: "800",
    color: "#fff",
    marginBottom: 8,
    letterSpacing: -0.5, // 👈 più moderno
  },

  subtitle: {
    fontSize: 17,
    color: "#fff",
    opacity: 0.9,
    lineHeight: 22,
  },

  actions: {
    flexDirection: "row",
    gap: 12, // 👈 più pulito (se RN supporta)
  },

  button: {
    flex: 1,
    backgroundColor: "#fff",
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
  },

  buttonText: {
    fontWeight: "700",
    fontSize: 16,
  },

  buttonOutline: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: "#fff",
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
  },

  buttonTextOutline: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
});
