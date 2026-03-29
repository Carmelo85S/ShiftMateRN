// app/auth/choice.tsx
import { View, Text, Pressable, StyleSheet, ImageBackground } from "react-native";
import { useRouter } from "expo-router";
import { Colors } from "@/constants/theme";

export default function AuthChoice() {
  const theme = Colors.light;
  const router = useRouter();

  return (
      <View style={styles.overlay}>
        {/* Hero e sub-hero */}
        <View style={styles.heroContainer}>
          <Text style={[styles.heroTitle, { color: theme.text }]}>
            ShiftMate
          </Text>
          <Text style={[styles.heroSubtitle, { color: theme.text }]}>
            Manage, assign, and claim extra shifts effortlessly
          </Text>
        </View>

        {/* Pulsanti in basso */}
        <View style={styles.buttonsContainer}>
          <Pressable
            style={[styles.button, { backgroundColor: theme.tint }]}
            onPress={() => router.push("/auth/login")}
          >
            <Text style={styles.buttonText}>Login</Text>
          </Pressable>

          <Pressable
            style={[styles.button, { backgroundColor: theme.tint }]}
            onPress={() => router.push("/auth/register")}
          >
            <Text style={styles.buttonText}>Crea Account</Text>
          </Pressable>
        </View>
      </View>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1 },
  overlay: { 
    flex: 1, 
    justifyContent: "flex-end", 
    padding: 24, 
    backgroundColor: "rgba(0,0,0,0.25)" 
  },
  heroContainer: {
    position: "absolute",
    top: 100, // distanza dall'alto
    left: 24,
    right: 24,
    alignItems: "center",
  },
  heroTitle: {
    fontSize: 36,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 12,
  },
  heroSubtitle: {
    fontSize: 18,
    textAlign: "center",
    lineHeight: 24,
  },
  buttonsContainer: {
    marginBottom: 60,
  },
  button: {
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 16,
  },
  buttonText: { color: "#fff", fontWeight: "600", fontSize: 16 },
});