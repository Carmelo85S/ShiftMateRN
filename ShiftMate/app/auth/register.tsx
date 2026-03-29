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
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";

export default function Register() {
  const theme = Colors.light;
  const router = useRouter();

  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"worker" | "manager">("worker");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name || !surname || !email || !password) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }

    setLoading(true);
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });
      if (authError) throw authError;
      if (!authData.user) throw new Error("User not created");

      const { error: profileError } = await supabase.from("profiles").insert({
        id: authData.user.id,
        name,
        surname,
        role,
      });
      if (profileError) throw profileError;

      Alert.alert("Success", "Account created! Please login.");
        if(role === "manager"){
        router.push("/(manager)/(tabs)/profile");
        } else if (role === "worker"){
          router.push("/(worker)/(tabs)/profile")
        }
      } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.formContainer}>
            <Text style={[styles.title, { color: theme.text }]}>
              Create Account
            </Text>

            <TextInput
              placeholder="Name"
              placeholderTextColor={theme.icon}
              value={name}
              onChangeText={setName}
              style={[styles.input, { color: theme.text, borderColor: theme.tint }]}
            />
            <TextInput
              placeholder="Surname"
              placeholderTextColor={theme.icon}
              value={surname}
              onChangeText={setSurname}
              style={[styles.input, { color: theme.text, borderColor: theme.tint }]}
            />
            <TextInput
              placeholder="Email"
              placeholderTextColor={theme.icon}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              style={[styles.input, { color: theme.text, borderColor: theme.tint }]}
            />
            <TextInput
              placeholder="Password"
              placeholderTextColor={theme.icon}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              style={[styles.input, { color: theme.text, borderColor: theme.tint }]}
            />

            <View style={styles.roleContainer}>
              <Pressable
                style={[
                  styles.roleButton,
                  role === "worker" && styles.roleButtonSelected,
                ]}
                onPress={() => setRole("worker")}
              >
                <Text style={styles.roleText}>Worker</Text>
              </Pressable>
              <Pressable
                style={[
                  styles.roleButton,
                  role === "manager" && styles.roleButtonSelected,
                ]}
                onPress={() => setRole("manager")}
              >
                <Text style={styles.roleText}>Manager</Text>
              </Pressable>
            </View>

            <Pressable
              style={[styles.button, { backgroundColor: theme.tint }]}
              onPress={handleRegister}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading ? "Loading..." : "Register"}
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: "center", padding: 24 },
  formContainer: { width: "100%" },
  title: { fontSize: 28, fontWeight: "bold", marginBottom: 24, textAlign: "center" },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    fontSize: 16,
  },
  roleContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 16,
  },
  roleButton: {
    flex: 1,
    padding: 12,
    marginHorizontal: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ccc",
    alignItems: "center",
  },
  roleButtonSelected: {
    backgroundColor: "#1E90FF",
    borderColor: "#1E90FF",
  },
  roleText: { color: "#000", fontWeight: "600" },
  button: {
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 12,
  },
  buttonText: { color: "#fff", fontWeight: "600", fontSize: 16 },
});