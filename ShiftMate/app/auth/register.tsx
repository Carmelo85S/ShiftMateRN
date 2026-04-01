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
  container: { 
    paddingHorizontal: 30, // Più spazio ai lati per centrare lo sguardo
    paddingBottom: 60, 
    paddingTop: 20 
  },
  header: { 
    marginBottom: 40, 
    marginTop: 10 
  },
  backBtn: { 
    marginBottom: 20, 
    marginLeft: -10, // Allineamento ottico con l'icona
    width: 44, 
    height: 44, 
    justifyContent: 'center' 
  },
  kpi: { 
    fontSize: 13, 
    fontWeight: "700", 
    letterSpacing: 0.5, // Ridotto lo spacing eccessivo
    marginBottom: 8,
    opacity: 0.6 
  },
  title: { 
    fontSize: 36, // Da 48 a 36: più elegante
    fontWeight: "800", 
    lineHeight: 42, 
    letterSpacing: -1 
  },
  
  roleWrapper: { 
    marginBottom: 32 
  },
  roleContainer: { 
    flexDirection: "row", 
    gap: 12, 
    marginTop: 12,
    backgroundColor: "#F1F3F5", // Sfondo comune per entrambi (stile iOS)
    padding: 6,
    borderRadius: 20,
  },
  roleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12, // Più sottile
    borderRadius: 14,
    borderWidth: 0, // Rimosso il bordo spesso 2px
  },
  // Nota: per lo stato 'selected' userai un'ombra leggera e sfondo bianco puro
  roleText: { 
    fontWeight: "600", 
    fontSize: 14, 
    letterSpacing: 0 
  },

  form: { 
    gap: 24 
  },
  row: { 
    flexDirection: 'row', 
    gap: 16 
  },
  inputWrapper: { 
    gap: 10 
  },
  inputLabel: { 
    fontSize: 14, // Più leggibile (da 10)
    fontWeight: "600", 
    marginLeft: 4,
    opacity: 0.8 
  },
  input: {
    width: "100%",
    backgroundColor: "#F1F3F5", // Sfondo soft invece del bordo nero
    borderRadius: 18,
    padding: 16,
    fontSize: 16,
    fontWeight: "500",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.03)", // Bordo quasi impercettibile
  },
  button: {
    width: "100%",
    padding: 18,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 15,
    // Soft Shadow per far risaltare l'azione principale
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  buttonText: { 
    fontWeight: "700", 
    fontSize: 16, 
    letterSpacing: 0.2 
  },
});