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
  ActivityIndicator
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

type UserRole = "worker" | "manager" | "owner" | "candidate";

export default function Register() {
  const theme = Colors.light;
  const router = useRouter();

  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("worker");
  const [inviteCode, setInviteCode] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name || !surname || !email || !password) {
      Alert.alert("Missing Info", "Please fill all fields.");
      return;
    }

    if (role !== "owner" && role !== "candidate" && !inviteCode) {
      Alert.alert("Invite Code", "Please enter the code provided by your manager.");
      return;
    }

    setLoading(true);
    try {
      let businessId = null;

      if (role !== "owner") {
        const cleanCode = inviteCode.trim().toUpperCase(); // Normalizing the input
        console.log("Searching for code:", cleanCode);
        const { data: business, error: businessError } = await supabase
          .from("businesses")
          .select("id")
          .eq("invite_code", cleanCode) // Ensure column name matches exactly in DB
          .maybeSingle(); // Better than .single() because it doesn't throw if 0 rows found

        if (businessError) {
          console.error("Query Error:", businessError.message);
          throw new Error("Connection error while checking the code.");
        }

        if (!business) {
          throw new Error("Invalid code. Please check with your manager.");
        }

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
        role,
        business_id: businessId,
      });

      if (profileError) throw profileError;

      if (role === "owner") {
        router.replace("/(manager)/setupBusiness" as any);
      } else {
        const targetPath = role === "manager" 
          ? "/(manager)/(tabs)/dashboard" 
          : "/(worker)/(tabs)/shifts";
        router.replace(targetPath as any);
      }

    } catch (error: any) {
      Alert.alert("Registration Failed", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/auth/login" as any);
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
          
          <View style={styles.header}>
            <Pressable onPress={handleBack} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={24} color={theme.text} />
            </Pressable>
            <Text style={[styles.kpi, { color: theme.tint }]}>SECURE ACCESS</Text>
            <Text style={[styles.title, { color: theme.text }]}>Join the{"\n"}Team</Text>
          </View>

          {/* ROLE SELECTOR */}
          <View style={styles.roleWrapper}>
            <Text style={styles.inputLabel}>YOUR ROLE</Text>
            <View style={styles.roleContainer}>
              <RoleCard label="OWNER" selected={role === "owner"} onPress={() => setRole("owner")} theme={theme} icon="business" />
              <RoleCard label="WORKER" selected={role === "worker"} onPress={() => setRole("worker")} theme={theme} icon="hammer" />
              <RoleCard label="MANAGER" selected={role === "manager"} onPress={() => setRole("manager")} theme={theme} icon="briefcase" />
              <RoleCard label="CANDIDATE" selected={role === "candidate"} onPress={() => setRole("candidate")} theme={theme} icon="star" />
            </View>
          </View>

          <View style={styles.form}>
            <View style={styles.row}>
               <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>FIRST NAME</Text>
                  <TextInput
                    placeholder="John"
                    placeholderTextColor="#999"
                    value={name}
                    onChangeText={setName}
                    style={[styles.input, { color: theme.text, borderColor: theme.text }]}
                  />
               </View>
               <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>LAST NAME</Text>
                  <TextInput
                    placeholder="Doe"
                    placeholderTextColor="#999"
                    value={surname}
                    onChangeText={setSurname}
                    style={[styles.input, { color: theme.text, borderColor: theme.text }]}
                  />
               </View>
            </View>

            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>WORK EMAIL</Text>
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

            {role !== "owner" && role!=="candidate" &&(
              <View style={styles.inputWrapper}>
                <Text style={[styles.inputLabel, { color: theme.tint }]}>COMPANY INVITE CODE</Text>
                <TextInput
                  placeholder="EX: BUSINESS2024"
                  placeholderTextColor="#999"
                  value={inviteCode}
                  onChangeText={setInviteCode}
                  autoCapitalize="characters"
                  style={[styles.input, { color: theme.text, borderColor: theme.tint, borderWidth: 1.5 }]}
                />
              </View>
            )}

            <Pressable
              style={({ pressed }) => [
                styles.button,
                { backgroundColor: theme.text, opacity: (loading || pressed) ? 0.8 : 1 }
              ]}
              onPress={handleRegister}
              disabled={loading}
            >
              <Text style={[styles.buttonText, { color: theme.background }]}>
                {loading ? "CREATING ACCOUNT..." : role === "owner" ? "REGISTER STRUCTURE" : "REGISTER"}
              </Text>
              {!loading && <Ionicons name="arrow-forward" size={20} color={theme.background} />}
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}

const RoleCard = ({ label, selected, onPress, theme, icon }: any) => (
  <Pressable
    onPress={onPress}
    style={[
      styles.roleButton,
      { 
        backgroundColor: selected ? theme.text : "#F1F3F5",
        borderColor: selected ? theme.text : "rgba(0,0,0,0.05)",
        borderWidth: 1
      }
    ]}
  >
    <Ionicons name={icon} size={18} color={selected ? theme.background : theme.text} />
    <Text style={[styles.roleText, { color: selected ? theme.background : theme.text }]}>{label}</Text>
  </Pressable>
);

const styles = StyleSheet.create({
  container: { 
    flexGrow: 1,
    paddingHorizontal: 32, 
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: { 
    marginBottom: 40, 
    alignItems: 'flex-start' 
  },
  backBtn: { 
    marginBottom: 20, 
    marginLeft: -10, 
    width: 44, 
    height: 44, 
    justifyContent: 'center' 
  },
  kpi: { 
    fontSize: 13, 
    fontWeight: "700", 
    letterSpacing: 0.5, 
    marginBottom: 8, 
    opacity: 0.8 
  },
  title: {
    fontSize: 38,
    fontWeight: "800",
    lineHeight: 42,
    letterSpacing: -1,
  },
  roleWrapper: { 
    marginBottom: 32 
  },
  roleContainer: { 
    flexDirection: "row", 
    gap: 10, 
    marginTop: 12 
  },
  roleButton: { 
    flex: 1, 
    alignItems: 'center', 
    justifyContent: 'center', 
    gap: 8, 
    paddingVertical: 14, 
    borderRadius: 20,
  },
  roleText: { 
    fontWeight: "700", 
    fontSize: 10, 
    letterSpacing: 0.5 
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
    fontSize: 14, 
    fontWeight: "600", 
    marginLeft: 4, 
    opacity: 0.7 
  },
  input: { 
    width: "100%", 
    backgroundColor: "#F1F3F5", 
    borderWidth: 1,
    padding: 18, 
    fontSize: 16, 
    borderRadius: 20, 
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
    letterSpacing: 0.2 
  },
});