import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  useColorScheme,
} from "react-native";
import { supabase } from "@/lib/supabase";
import { Colors } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function CreateShift() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];

  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
    startTime: "09:00",
    endTime: "17:00",
  });

  const handleCreate = async () => {
    if (!form.title || !form.date || !form.startTime || !form.endTime) {
      Alert.alert("Missing Info", "Please fill in all required fields marked with *");
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { error } = await supabase.from("shifts").insert([
        {
          manager_id: user.id,
          title: form.title,
          description: form.description,
          shift_date: form.date,
          start_time: form.startTime,
          end_time: form.endTime,
          status: "open",
        },
      ]);

      if (error) throw error;

      Alert.alert("Success", "Shift posted successfully!", [
        { text: "View Shifts", onPress: () => router.push("/(manager)/(tabs)/shift") },
      ]);
      
      setForm({ title: "", description: "", date: form.date, startTime: "09:00", endTime: "17:00" });
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Could not create shift. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const renderInput = (label: string, icon: string, key: keyof typeof form, placeholder: string, multiLine = false) => (
    <View style={styles.inputWrapper}>
      <View style={styles.labelRow}>
        <Ionicons name={icon as any} size={16} color={theme.text} style={{ opacity: 0.5 }} />
        <Text style={[styles.label, { color: theme.text }]}>{label}</Text>
      </View>
      <TextInput
        style={[
          styles.input,
          { backgroundColor: theme.card, color: theme.text, borderColor: theme.text + "10" },
          multiLine && styles.textArea
        ]}
        placeholder={placeholder}
        placeholderTextColor={theme.text + "40"}
        value={form[key]}
        onChangeText={(text) => setForm({ ...form, [key]: text })}
        multiline={multiLine}
      />
    </View>
  );

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"} 
      style={{ flex: 1, backgroundColor: theme.background }}
    >
      <ScrollView 
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 20, paddingBottom: 120 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.text }]}>Create New Shift</Text>
          <Text style={[styles.subtitle, { color: theme.text }]}>Fill in the details to find the best workers.</Text>
        </View>

        {renderInput("Job Title *", "briefcase-outline", "title", "e.g. Head Waiter")}
        {renderInput("Description", "document-text-outline", "description", "Describe tasks, dress code, etc.", true)}

        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            {renderInput("Date *", "calendar-outline", "date", "YYYY-MM-DD")}
          </View>
        </View>

        <View style={styles.row}>
          <View style={{ flex: 1, marginRight: 12 }}>
            {renderInput("Start Time *", "time-outline", "startTime", "09:00")}
          </View>
          <View style={{ flex: 1 }}>
            {renderInput("End Time *", "log-out-outline", "endTime", "17:00")}
          </View>
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.submitButton,
            { backgroundColor: theme.text, opacity: pressed || loading ? 0.8 : 1 }
          ]}
          onPress={handleCreate}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={theme.background} />
          ) : (
            <>
              <Text style={[styles.submitText, { color: theme.background }]}>Post Shift</Text>
              <Ionicons name="sparkles" size={18} color={theme.background} />
            </>
          )}
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scrollContent: { paddingHorizontal: 24 },
  header: { marginBottom: 32 },
  title: { fontSize: 32, fontWeight: "800", letterSpacing: -1 },
  subtitle: { fontSize: 16, opacity: 0.5, marginTop: 4, fontWeight: "500" },
  
  inputWrapper: { marginBottom: 20 },
  labelRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 10, marginLeft: 4 },
  label: { fontSize: 14, fontWeight: "700", opacity: 0.8 },
  input: {
    padding: 18,
    borderRadius: 20,
    fontSize: 16,
    fontWeight: "500",
    borderWidth: 1,
  },
  textArea: { height: 120, textAlignVertical: "top" },
  row: { flexDirection: "row", justifyContent: "space-between" },
  
  submitButton: {
    marginTop: 20,
    height: 64,
    borderRadius: 22,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 8 },
    elevation: 5,
  },
  submitText: { fontSize: 18, fontWeight: "800" },
});