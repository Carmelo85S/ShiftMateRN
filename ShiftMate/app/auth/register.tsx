import { Colors } from "@/constants/theme";
import { supabase } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

export default function Register() {
  const theme = Colors.light;
  const router = useRouter();
  const { role } = useLocalSearchParams<{
    role: "owner" | "team" | "candidate";
  }>();

  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name || !surname || !email || !password) {
      Alert.alert("Missing Info", "Please fill all fields.");
      return;
    }

    setLoading(true);
    try {
      let businessId = null;
      let finalRole = role === "team" ? "worker" : role;

      if (role === "team") {
        const cleanCode = inviteCode.trim().toUpperCase();
        console.log("DEBUG: Cerco azienda con codice:", cleanCode);
        const { data: business, error: businessError } = await supabase
          .from("businesses")
          .select("id, invite_code_mgr, invite_code_wrk")
          .or(`invite_code_mgr.eq.${cleanCode},invite_code_wrk.eq.${cleanCode}`)
          .maybeSingle();

        console.log(
          "DEBUG: Risultato query:",
          business,
          "Errore:",
          businessError,
        );

        if (businessError || !business) throw new Error("Invalid invite code.");

        finalRole =
          cleanCode === business.invite_code_mgr ? "manager" : "worker";
        businessId = business.id;
      }

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });
      if (authError) throw authError;
      if (!authData.user) throw new Error("Auth failed.");

      const { error: profileError } = await supabase.from("profiles").insert({
        id: authData.user.id,
        name,
        surname,
        role: finalRole,
        business_id: businessId,
      });

      if (profileError) throw profileError;

      if (businessId) {
        const { error: memberError } = await supabase
          .from("business_members")
          .insert({
            user_id: authData.user.id,
            business_id: businessId,
            role: finalRole, // 'worker' o 'manager'
          });
        if (memberError) throw memberError;
      }

      if (role === "owner") router.replace("/(manager)/setupBusiness");
      else if (finalRole === "manager")
        router.replace("/(manager)/(tabs)/dashboard");
      else router.replace("/(worker)/(tabs)/shifts");
    } catch (error: any) {
      Alert.alert("Registration Failed", error.message);
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
          <View style={styles.header}>
            <Pressable onPress={() => router.back()} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={24} color={theme.text} />
            </Pressable>
            <Text style={[styles.kpi, { color: theme.tint }]}>
              CREATE ACCOUNT
            </Text>
            <Text style={[styles.title, { color: theme.text }]}>
              {role === "owner"
                ? "Setup Your\nBusiness"
                : role === "team"
                  ? "Join Your\nTeam"
                  : "Apply to\nJoin"}
            </Text>
          </View>

          <View style={styles.form}>
            <View style={styles.row}>
              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>FIRST NAME</Text>
                <TextInput
                  value={name}
                  onChangeText={setName}
                  placeholder="John"
                  style={styles.input}
                />
              </View>
              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>LAST NAME</Text>
                <TextInput
                  value={surname}
                  onChangeText={setSurname}
                  placeholder="Doe"
                  style={styles.input}
                />
              </View>
            </View>

            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>EMAIL ADDRESS</Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="name@company.com"
                keyboardType="email-address"
                autoCapitalize="none"
                style={styles.input}
              />
            </View>

            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>PASSWORD</Text>
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                secureTextEntry
                style={styles.input}
              />
            </View>

            {role === "team" && (
              <View style={styles.inputWrapper}>
                <Text style={[styles.inputLabel, { color: theme.tint }]}>
                  INVITE CODE
                </Text>
                <TextInput
                  value={inviteCode}
                  onChangeText={setInviteCode}
                  placeholder="EX: BUSINESS123"
                  autoCapitalize="characters"
                  style={[
                    styles.input,
                    { borderColor: theme.tint, borderWidth: 1.5 },
                  ]}
                />
              </View>
            )}

            <Pressable
              style={({ pressed }) => [
                styles.button,
                {
                  backgroundColor: theme.text, // Sfondo nero (come nel Login)
                  opacity: loading || pressed ? 0.8 : 1,
                },
              ]}
              onPress={handleRegister}
              disabled={loading}
            >
              <Text style={[styles.buttonText, { color: theme.background }]}>
                {loading ? "PROCESSING..." : "REGISTER ACCOUNT"}
              </Text>
              {!loading && (
                <Ionicons
                  name="arrow-forward"
                  size={20}
                  color={theme.background}
                />
              )}
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
    paddingHorizontal: 32,
    paddingTop: 80,
    paddingBottom: 40,
    justifyContent: "center",
  },
  header: {
    marginBottom: 45,
    alignItems: "flex-start",
  },
  backBtn: {
    marginBottom: 20,
    marginLeft: -10,
    width: 44,
    height: 44,
    justifyContent: "center",
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
  row: {
    flexDirection: "row",
    gap: 16,
  },
  inputWrapper: {
    gap: 10,
    flex: 1,
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
    borderColor: "#000",
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
});
