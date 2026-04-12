import React, { useState } from "react";
import { 
  View, 
  Text, 
  TextInput, 
  Pressable, 
  StyleSheet, 
  Alert, 
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from "react-native";
import { supabase } from "@/lib/supabase";
import { useRouter } from "expo-router";
import { Colors } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";

export default function SetupHotel() {
  const [hotelName, setHotelName] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const theme = Colors.light;

  const generateInviteCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "";
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const handleCreateStructure = async () => {
    if (!hotelName.trim()) {
      Alert.alert("Attention", "Please enter your structure name.");
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not found.");

      const inviteCode = generateInviteCode();

      // 1. Inserimento nella tabella hotels
      const { data: hotel, error: hotelError } = await supabase
        .from("hotels")
        .insert([{ 
            name: hotelName.trim(), 
            invite_code: inviteCode 
        }])
        .select()
        .single();

      if (hotelError) throw hotelError;

      // 2. Aggiornamento del profilo dell'Owner
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ hotel_id: hotel.id })
        .eq("id", user.id);

      if (profileError) throw profileError;

      Alert.alert(
        "Structure Created!",
        `Your invite code is: ${inviteCode}. Share it with your team to let them join.`,
        [{ text: "LET'S START", onPress: () => router.replace("/(manager)/(tabs)/dashboard") }]
      );

    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1, backgroundColor: theme.background }}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        
        {/* HEADER IDENTICO A REGISTER/LOGIN */}
        <View style={styles.header}>
          <Text style={[styles.kpi, { color: theme.tint }]}>FIRST STEP</Text>
          <Text style={[styles.title, { color: theme.text }]}>Setup Your{"\n"}Business</Text>
        </View>

        <View style={styles.content}>
          <View style={styles.infoBox}>
            <Ionicons name="information-circle-outline" size={20} color={theme.text} style={{ opacity: 0.6 }} />
            <Text style={styles.subtitle}>
              Register your hotel or restaurant to start managing shifts and your team.
            </Text>
          </View>

          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>STRUCTURE NAME</Text>
            <TextInput
              placeholder="e.g. Grand Hotel or Central Bar"
              placeholderTextColor="#999"
              value={hotelName}
              onChangeText={setHotelName}
              style={[styles.input, { color: theme.text, borderColor: theme.text }]}
            />
          </View>

          <Pressable 
            style={({ pressed }) => [
              styles.button, 
              { backgroundColor: theme.text, opacity: pressed || loading ? 0.8 : 1 }
            ]} 
            onPress={handleCreateStructure}
            disabled={loading}
          >
            <Text style={[styles.buttonText, { color: theme.background }]}>
              {loading ? "CREATING..." : "CREATE STRUCTURE"}
            </Text>
            {!loading && <Ionicons name="checkmark-circle" size={20} color={theme.background} />}
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flexGrow: 1, 
    paddingHorizontal: 32, 
    paddingTop: 80, 
    paddingBottom: 40 
  },
  header: { 
    marginBottom: 40 
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
    letterSpacing: -1 
  },
  content: { 
    gap: 30 
  },
  infoBox: {
    flexDirection: 'row',
    gap: 10,
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)'
  },
  subtitle: { 
    flex: 1,
    fontSize: 15, 
    color: "#666", 
    lineHeight: 20,
    fontWeight: "500"
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
    borderRadius: 20, // Uniformato a Register
    padding: 18, 
    fontSize: 16, 
    borderWidth: 1,
  },
  button: {
    width: "100%",
    padding: 18,
    borderRadius: 22, // Uniformato a Register
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
  }
});