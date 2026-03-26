import { View, Text, Pressable, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

export default function AuthChoice() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Hero section */}
      <View style={styles.heroContainer}>
        <Text style={[styles.hero, { color: theme.text }]}>Shift Mate</Text>
        <Text style={[styles.subHero, { color: theme.text }]}>
          Claim or manage extra shifts effortlessly, for yourself or your team
        </Text>
      </View>

      {/* Buttons at bottom */}
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
          <Text style={styles.buttonText}>Create Account</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "space-between", padding: 24 },
  heroContainer: { marginTop: 80 },
  hero: { fontSize: 36, fontWeight: "bold", textAlign: "center", marginBottom: 16 },
  subHero: { fontSize: 18, textAlign: "center", lineHeight: 24 },
  buttonsContainer: { marginBottom: 40 },
  button: {
    padding: 16,
    borderRadius: 12,
    width: "100%",
    alignItems: "center",
    marginBottom: 16,
  },
  buttonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});