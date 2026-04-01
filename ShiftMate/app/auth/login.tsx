import { Colors } from "@/constants/theme";
import { supabase } from "@/lib/supabase";
import { Stack, useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function Login() {
  const theme = Colors.light;
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter email and password");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;

      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", data.user.id)
        .single();

      if (profileError) throw profileError;

      // Routing basato sul ruolo
      if (profileData.role === "manager") {
        router.replace("/(manager)/(tabs)/dashboard");
      } else if (profileData.role === "worker") {
        router.replace("/(worker)/(tabs)/shifts");
      } else {
        Alert.alert("Error", "Unknown role assigned to this account.");
      }
    } catch (error: any) {
      Alert.alert("Login Failed", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1, backgroundColor: theme.background }}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          {/* HEADER SECTION */}
          <View style={styles.header}>
            <Text style={[styles.kpi, { color: theme.tint }]}>INTERNAL ACCESS</Text>
            <Text style={[styles.title, { color: theme.text }]}>Welcome{"\n"}Back</Text>
          </View>

          {/* FORM SECTION */}
          <View style={styles.form}>
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>EMAIL ADDRESS</Text>
              <TextInput
                placeholder="name@company.com"
                placeholderTextColor="#999"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                style={[styles.input, { color: theme.text, borderColor: theme.text }]}
              />
            </View>

            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>PASSWORD</Text>
              <TextInput
                placeholder="••••••••"
                placeholderTextColor="#999"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                style={[styles.input, { color: theme.text, borderColor: theme.text }]}
              />
            </View>

            <Pressable
              style={({ pressed }) => [
                styles.button,
                { backgroundColor: theme.text, opacity: (loading || pressed) ? 0.8 : 1 }
              ]}
              onPress={handleLogin}
              disabled={loading}
            >
              <Text style={[styles.buttonText, { color: theme.background }]}>
                {loading ? "AUTHENTICATING..." : "LOGIN TO DASHBOARD"}
              </Text>
              {!loading && <Ionicons name="arrow-forward" size={20} color={theme.background} />}
            </Pressable>

            <Pressable 
              onPress={() => router.push("/auth/register")} 
              style={styles.registerLink}
              disabled={loading}
            >
              <Text style={styles.registerText}>
                New here? <Text style={{ color: theme.tint, fontWeight: '900' }}>Request Access</Text>
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}

// Modifica queste parti nel tuo componente
const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingHorizontal: 32,
    paddingTop: 80,
    paddingBottom: 40,
    justifyContent: "center",
  },
  header: {
    marginBottom: 45,
    alignItems: 'flex-start',
  },
  kpi: {
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0.5,
    marginBottom: 8,
    opacity: 0.8,
  },
  title: {
    fontSize: 38,
    fontWeight: "800",
    lineHeight: 42,
    letterSpacing: -1,
  },
  form: {
    gap: 24,
  },
  inputWrapper: {
    gap: 10,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1A1D1E",
    marginLeft: 4,
    opacity: 0.7,
  },
  input: {
    width: "100%",
    backgroundColor: "#F1F3F5", 
    borderRadius: 20,
    padding: 18,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
  },
  button: {
    width: "100%",
    padding: 18,
    borderRadius: 22,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    marginTop: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 5,
  },
  buttonText: {
    fontWeight: "700",
    fontSize: 16,
    letterSpacing: 0.2,
  },
  registerLink: {
    marginTop: 25,
    alignItems: "center",
  },
  registerText: {
    fontSize: 15,
    color: "#8E8E93",
    fontWeight: "500",
  },
});