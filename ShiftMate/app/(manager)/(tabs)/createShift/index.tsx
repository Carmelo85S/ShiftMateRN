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
import ShiftUploader from "@/components/imagePicker/imagePickerShift"; // Importato il tuo componente

export default function CreateShift() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];

  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null); // Stato per l'immagine
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
          title: form.title,
          description: form.description,
          shift_date: form.date,
          start_time: form.startTime,
          end_time: form.endTime,
          image_url: imageUrl,
          status: "open",
          created_by: user.id, 
          manager_id: user.id,
        },
      ]);

      if (error) throw error;

      Alert.alert("Success", "Shift posted successfully!", [
        { text: "View Shifts", onPress: () => router.push("/(manager)/(tabs)/shift") },
      ]);
      
      // Reset form
      setForm({ title: "", description: "", date: form.date, startTime: "09:00", endTime: "17:00" });
      setImageUrl(null);
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
        value={form[key] as string}
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
        contentContainerStyle={[styles.scrollContent, {paddingBottom: 120 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.text }]}>Create New Shift</Text>
          <Text style={[styles.subtitle, { color: theme.text }]}>Fill in the details to find the best workers.</Text>
        </View>

        {/* SEZIONE IMMAGINE - Usando il tuo componente */}
        <View style={styles.imageSection}>
           <Text style={[styles.label, { color: theme.text, marginBottom: 12 }]}>Cover Image</Text>
           <ShiftUploader
              initialUrl={imageUrl}
              onUpload={(url) => setImageUrl(url)}
            />
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
  scrollContent: { 
    paddingHorizontal: 28, // Più respiro laterale
  },
  header: { 
    marginBottom: 35,
    marginTop: 10 
  },
  title: { 
    fontSize: 30, // Leggermente più piccolo per eleganza
    fontWeight: "700", // Da 800 a 700
    letterSpacing: -0.8 
  },
  subtitle: { 
    fontSize: 15, 
    opacity: 0.5, 
    marginTop: 6, 
    lineHeight: 20,
    fontWeight: "400" 
  },
  
  imageSection: { 
    marginBottom: 30 
  },
  
  inputWrapper: { 
    marginBottom: 24 
  },
  labelRow: { 
    flexDirection: "row", 
    alignItems: "center", 
    gap: 6, 
    marginBottom: 10, 
    marginLeft: 4 
  },
  label: { 
    fontSize: 14, 
    fontWeight: "600", // Meno pesante
    opacity: 0.6 // Più discreto
  },
  input: {
    padding: 16,
    borderRadius: 18, // Più tondo
    fontSize: 16,
    fontWeight: "500",
    borderWidth: 1,
    // Lo sfondo dell'input deve essere quasi uguale a quello della card
    backgroundColor: 'rgba(0,0,0,0.02)', 
    borderColor: 'rgba(0,0,0,0.05)',
  },
  textArea: { 
    height: 100, 
    textAlignVertical: "top",
    paddingTop: 16 
  },
  row: { 
    flexDirection: "row", 
    gap: 12 // Usiamo gap invece di marginRight manuale
  },
  
  submitButton: {
    marginTop: 15,
    height: 60,
    borderRadius: 20,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
    // Ombra molto diffusa (Soft Shadow)
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 4,
  },
  submitText: { 
    fontSize: 16, 
    fontWeight: "600", // Da 800 a 600 per coerenza soft
    letterSpacing: 0.2
  },
});