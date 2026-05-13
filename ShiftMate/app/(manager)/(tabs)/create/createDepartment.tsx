import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from "react-native";
import { Colors } from "@/constants/theme";
import { supabase } from "@/lib/supabase";
import { Stack, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function CreateDepartment() {
  const theme = Colors.light;
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [name, setName] = useState("");
  const [budget, setBudget] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!name || !budget) {
      Alert.alert("MISSING DATA", "Please fill all fields to proceed.");
      return;
    }

    setLoading(true);
    try {
      // 1. Recupero sessione e business_id
      const { data: { session } } = await supabase.auth.getSession();
      const { data: profile } = await supabase
        .from("profiles")
        .select("business_id")
        .eq("id", session?.user?.id)
        .single();

      if (!profile?.business_id) throw new Error("Business ID not found.");

      // 2. Inserimento dipartimento
      const { error } = await supabase.from("departments").insert([
        {
          name: name.trim(),
          monthly_budget: parseFloat(budget),
          business_id: profile.business_id,
        },
      ]);

      if (error) throw error;

      Alert.alert("SUCCESS", `Department "${name.toUpperCase()}" created correctly.`, [
        { text: "OK", onPress: () => router.back() }
      ]);
    } catch (error: any) {
      Alert.alert("OPERATION FAILED", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1, backgroundColor: theme.background }}
    >
      <ScrollView 
        contentContainerStyle={[styles.container, { paddingTop: insets.top + 20 }]}
        keyboardShouldPersistTaps="handled"
      >
        {/* HEADER SECTION */}
        <View style={styles.header}>
          <Text style={[styles.kpi, { color: theme.tint }]}>STRUCTURAL SETUP</Text>
          <Text style={[styles.title, { color: theme.text }]}>New{"\n"}Department</Text>
        </View>

        {/* FORM SECTION */}
        <View style={styles.form}>
          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>DEPARTMENT NAME</Text>
            <TextInput
              placeholder="e.g. Kitchen, Bar, Security..."
              placeholderTextColor="#999"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              style={[styles.input, { color: theme.text }]}
            />
          </View>

          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>MONTHLY BUDGET (€)</Text>
            <TextInput
              placeholder="0.00"
              placeholderTextColor="#999"
              value={budget}
              onChangeText={setBudget}
              keyboardType="numeric"
              style={[styles.input, { color: theme.text }]}
            />
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.submitButton,
              { backgroundColor: theme.text, opacity: (loading || pressed) ? 0.8 : 1 }
            ]}
            onPress={handleCreate}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={theme.background} />
            ) : (
              <>
                <Text style={[styles.submitText, { color: theme.background }]}>
                  CONFIRM CREATION
                </Text>
                <Ionicons name="checkmark-circle" size={20} color={theme.background} />
              </>
            )}
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 32,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 45,
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
    gap: 28,
  },
  inputWrapper: {
    gap: 10,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
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
  submitButton: {
    width: "100%",
    height: 64,
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
  submitText: {
    fontWeight: "800",
    fontSize: 16,
    letterSpacing: 0.2,
  },
});