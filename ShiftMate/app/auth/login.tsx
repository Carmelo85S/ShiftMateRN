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

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 30,
    justifyContent: "center",
  },
  header: {
    marginBottom: 50,
  },
  kpi: {
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 2,
    marginBottom: 8,
  },
  title: {
    fontSize: 52,
    fontWeight: "900",
    lineHeight: 52,
    letterSpacing: -2,
  },
  form: {
    gap: 20,
  },
  inputWrapper: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1,
    marginLeft: 4,
  },
  input: {
    width: "100%",
    borderWidth: 2, // Più spesso per il look Brutalist
    borderRadius: 16,
    padding: 18,
    fontSize: 16,
    fontWeight: "600",
  },
  button: {
    width: "100%",
    padding: 20,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginTop: 10,
  },
  buttonText: {
    fontWeight: "900",
    fontSize: 16,
    letterSpacing: 1,
  },
  registerLink: {
    marginTop: 20,
    alignItems: "center",
  },
  registerText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
  },
});