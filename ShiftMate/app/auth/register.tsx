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
import { Ionicons } from "@expo/vector-icons";

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
      Alert.alert("Missing Info", "Please fill all fields to request access.");
      return;
    }

    setLoading(true);
    try {
      // 1. Creazione utente in Supabase Auth (Tabella interna auth.users)
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });
      
      if (authError) throw authError;
      if (!authData.user) throw new Error("User creation failed.");

      // 2. Creazione profilo pubblico (Tabella public.profiles)
      // Inviamo solo i dati non sensibili necessari all'app
      const { error: profileError } = await supabase.from("profiles").insert({
        id: authData.user.id,
        name,
        surname,
        role,
        // La colonna 'email' qui non esiste, quindi non la inviamo.
      });

      if (profileError) throw profileError;

      // 3. Routing dinamico post-registrazione
      // Se Supabase fa l'auto-login dopo il signup, lo mandiamo alla home corretta
      const targetPath = role === "manager" 
        ? "/(manager)/(tabs)/dashboard" 
        : "/(worker)/(tabs)/shifts";
      
      router.replace(targetPath);

    } catch (error: any) {
      Alert.alert("Registration Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: theme.background }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* HEADER */}
          <View style={styles.header}>
            <Pressable onPress={() => router.back()} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={24} color={theme.text} />
            </Pressable>
            <Text style={[styles.kpi, { color: theme.tint }]}>JOIN THE TEAM</Text>
            <Text style={[styles.title, { color: theme.text }]}>Create{"\n"}Account</Text>
          </View>

          {/* ROLE SELECTOR - Brutalist Style */}
          <View style={styles.roleWrapper}>
            <Text style={styles.inputLabel}>SELECT YOUR ROLE</Text>
            <View style={styles.roleContainer}>
              <RoleCard 
                label="WORKER" 
                selected={role === "worker"} 
                onPress={() => setRole("worker")} 
                theme={theme}
                icon="hammer-sharp"
              />
              <RoleCard 
                label="MANAGER" 
                selected={role === "manager"} 
                onPress={() => setRole("manager")} 
                theme={theme}
                icon="briefcase-sharp"
              />
            </View>
          </View>

          {/* FORM */}
          <View style={styles.form}>
            <View style={styles.row}>
               <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>FIRST NAME</Text>
                  <TextInput
                    placeholder="John"
                    value={name}
                    onChangeText={setName}
                    style={[styles.input, { color: theme.text, borderColor: theme.text }]}
                  />
               </View>
               <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>LAST NAME</Text>
                  <TextInput
                    placeholder="Doe"
                    value={surname}
                    onChangeText={setSurname}
                    style={[styles.input, { color: theme.text, borderColor: theme.text }]}
                  />
               </View>
            </View>

            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>WORK EMAIL</Text>
              <TextInput
                placeholder="email@company.com"
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
              onPress={handleRegister}
              disabled={loading}
            >
              <Text style={[styles.buttonText, { color: theme.background }]}>
                {loading ? "CREATING..." : "REQUEST ACCESS"}
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}

// Sub-component for Role Selection
const RoleCard = ({ label, selected, onPress, theme, icon }: any) => (
  <Pressable
    onPress={onPress}
    style={[
      styles.roleButton,
      { borderColor: selected ? theme.tint : theme.text, backgroundColor: selected ? theme.tint : 'transparent' }
    ]}
  >
    <Ionicons name={icon} size={20} color={selected ? "#FFF" : theme.text} />
    <Text style={[styles.roleText, { color: selected ? "#FFF" : theme.text }]}>{label}</Text>
  </Pressable>
);

const styles = StyleSheet.create({
  container: { padding: 25, paddingBottom: 50 },
  header: { marginBottom: 30, marginTop: 20 },
  backBtn: { marginBottom: 20, marginLeft: -5 },
  kpi: { fontSize: 11, fontWeight: "900", letterSpacing: 2, marginBottom: 8 },
  title: { fontSize: 48, fontWeight: "900", lineHeight: 48, letterSpacing: -2 },
  
  roleWrapper: { marginBottom: 25 },
  roleContainer: { flexDirection: "row", gap: 12, marginTop: 10 },
  roleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
  },
  roleText: { fontWeight: "900", fontSize: 12, letterSpacing: 1 },

  form: { gap: 20 },
  row: { flexDirection: 'row', gap: 12 },
  inputWrapper: { gap: 8 },
  inputLabel: { fontSize: 10, fontWeight: "800", letterSpacing: 1, marginLeft: 4 },
  input: {
    width: "100%",
    borderWidth: 2,
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    fontWeight: "600",
  },
  button: {
    width: "100%",
    padding: 20,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: { fontWeight: "900", fontSize: 16, letterSpacing: 1 },
});