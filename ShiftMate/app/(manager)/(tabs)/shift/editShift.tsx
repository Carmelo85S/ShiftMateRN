// /(manager)/(tabs)/shift/[id]/editShift.tsx
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { supabase } from "@/lib/supabase";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useState, useEffect } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  ActivityIndicator,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import ShiftUploader from "@/components/imagePicker/imagePickerShift";

export default function EditShift() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [shiftDate, setShiftDate] = useState(new Date());
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date());
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // 🔹 Carica i dati esistenti dello shift
  useEffect(() => {
    const fetchShift = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("shifts")
          .select("*")
          .eq("id", id)
          .single();
        if (error) throw error;

        setTitle(data.title);
        setDescription(data.description ?? "");
        setShiftDate(new Date(data.shift_date));
        setStartTime(new Date(`1970-01-01T${data.start_time}`));
        setEndTime(new Date(`1970-01-01T${data.end_time}`));
        setImageUrl(data.image_url ?? null);
      } catch (err) {
        console.error(err);
        Alert.alert("Error", "Failed to load shift");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchShift();
  }, [id]);

  // 🔹 Salva le modifiche
  const handleSave = async () => {
    if (!title) {
      Alert.alert("Validation", "Title is required");
      return;
    }

    if (description.length > 300) {
      Alert.alert("Validation", "Max 300 characters");
      return;
    }

    setSaving(true);

    try {
      const { error } = await supabase
        .from("shifts")
        .update({
          title,
          description,
          shift_date: shiftDate.toISOString().split("T")[0],
          start_time: startTime.toTimeString().split(" ")[0],
          end_time: endTime.toTimeString().split(" ")[0],
          image_url: imageUrl,
        })
        .eq("id", id);

      if (error) throw error;

      Alert.alert("Success", "Shift updated successfully");
      router.back();
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to update shift");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.tint} />
      </View>
    );
  }

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={[styles.container, { backgroundColor: theme.background }]}
    >
      {/* HEADER */}
      <Text style={[styles.subtitle, { color: theme.text }]}>
        Edit job opportunity
      </Text>

      {/* IMAGE */}
      <View style={styles.card}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          Cover Image
        </Text>
        <ShiftUploader
          initialUrl={imageUrl}
          onUpload={(url) => setImageUrl(`${url}?t=${Date.now()}`)}
        />
      </View>

      {/* DETAILS */}
      <View style={styles.card}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          Details
        </Text>

        <Text style={[styles.label, { color: theme.text }]}>Title</Text>
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="e.g. Bartender night shift"
          placeholderTextColor="#999"
          style={[styles.input, { color: theme.text }]}
        />

        <Text style={[styles.label, { color: theme.text }]}>Description</Text>
        <TextInput
          value={description}
          onChangeText={setDescription}
          placeholder="Describe tasks, requirements, notes..."
          placeholderTextColor="#999"
          multiline
          maxLength={300}
          style={[styles.textarea, { color: theme.text }]}
        />
        <Text style={styles.counter}>{description.length}/300</Text>
      </View>

      {/* SCHEDULE */}
      <View style={styles.card}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          Schedule
        </Text>

        <View style={styles.row}>
          <Text style={[styles.rowLabel, { color: theme.text }]}>Date</Text>
          <DateTimePicker
            value={shiftDate}
            mode="date"
            onChange={(_, d) => d && setShiftDate(d)}
          />
        </View>

        <View style={styles.row}>
          <Text style={[styles.rowLabel, { color: theme.text }]}>Start</Text>
          <DateTimePicker
            value={startTime}
            mode="time"
            onChange={(_, d) => d && setStartTime(d)}
          />
        </View>

        <View style={styles.row}>
          <Text style={[styles.rowLabel, { color: theme.text }]}>End</Text>
          <DateTimePicker
            value={endTime}
            mode="time"
            onChange={(_, d) => d && setEndTime(d)}
          />
        </View>
      </View>

      {/* SAVE BUTTON */}
      <Pressable
        onPress={handleSave}
        style={({ pressed }) => [
          styles.button,
          { backgroundColor: theme.tint, opacity: pressed ? 0.85 : 1 },
        ]}
        disabled={saving}
      >
        <Text style={styles.buttonText}>{saving ? "Saving..." : "Save Shift"}</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  subtitle: { fontSize: 14, opacity: 0.7, marginBottom: 20 },

  card: { borderRadius: 18, padding: 16, marginBottom: 16, backgroundColor: "#fff", elevation: 2 },
  sectionTitle: { fontSize: 16, fontWeight: "600", marginBottom: 12 },
  label: { fontSize: 13, marginBottom: 6, opacity: 0.7 },
  input: { borderWidth: 1, borderColor: "#ddd", borderRadius: 12, padding: 14, fontSize: 15, marginBottom: 12 },
  textarea: { borderWidth: 1, borderColor: "#ddd", borderRadius: 12, padding: 14, fontSize: 15, minHeight: 100, textAlignVertical: "top", marginBottom: 4 },
  counter: { textAlign: "right", fontSize: 12, color: "#999", marginBottom: 0 },

  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  rowLabel: { fontSize: 14, fontWeight: "500" },

  button: { marginTop: 10, padding: 18, borderRadius: 16, alignItems: "center" },
  buttonText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});