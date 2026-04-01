// /(manager)/(tabs)/shift/[id]/editShift.tsx
import { Colors } from "@/constants/theme";
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
  const theme = Colors.light;
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
            { backgroundColor: theme.text, opacity: pressed || loading ? 0.8 : 1 }
        ]}
        disabled={saving}
      >
        <Text style={styles.buttonText}>{saving ? "Saving..." : "Save Shift"}</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flexGrow: 1, 
    padding: 24, // Più respiro laterale
    backgroundColor: 'transparent' 
  },
  center: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center" 
  },

  subtitle: { 
    fontSize: 15, 
    opacity: 0.5, 
    lineHeight: 22,
    marginBottom: 25,
    fontWeight: "400" 
  },

  // CARD: Superficie "Galleggiante"
  card: { 
    borderRadius: 24, 
    padding: 20, 
    marginBottom: 20, 
    backgroundColor: "#fff",
    // Ombra diffusa stile Cloud
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.04,
    shadowRadius: 20,
    elevation: 3 
  },
  
  sectionTitle: { 
    fontSize: 18, 
    fontWeight: "700", 
    letterSpacing: -0.5,
    marginBottom: 16 
  },
  
  label: { 
    fontSize: 13, 
    fontWeight: "600",
    marginBottom: 8, 
    opacity: 0.4,
    letterSpacing: 0.3,
    textTransform: 'uppercase' // Etichette più professionali
  },

  // INPUT: Effetto "Scavato" (Inverted Surface)
  input: { 
    backgroundColor: 'rgba(0,0,0,0.02)', // Sfondo quasi invisibile
    borderWidth: 1, 
    borderColor: 'rgba(0,0,0,0.03)', 
    borderRadius: 16, 
    padding: 16, 
    fontSize: 15, 
    fontWeight: "500",
    marginBottom: 16 
  },
  
  textarea: { 
    backgroundColor: 'rgba(0,0,0,0.02)',
    borderWidth: 1, 
    borderColor: 'rgba(0,0,0,0.03)', 
    borderRadius: 16, 
    padding: 16, 
    fontSize: 15, 
    minHeight: 120, 
    textAlignVertical: "top", 
    marginBottom: 6,
    lineHeight: 22
  },
  
  counter: { 
    textAlign: "right", 
    fontSize: 12, 
    fontWeight: "600",
    opacity: 0.3, 
    marginBottom: 4 
  },

  // ROW: Allineamento perfetto
  row: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    alignItems: "center", 
    marginBottom: 16,
    paddingVertical: 4
  },
  
  rowLabel: { 
    fontSize: 15, 
    fontWeight: "600",
    opacity: 0.8 
  },

  // BUTTON: Call to Action Premium
  button: { 
    marginTop: 15, 
    padding: 18, 
    borderRadius: 20, 
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 15,
    elevation: 5
  },
  
  buttonText: { 
    color: "#fff", 
    fontWeight: "700", 
    fontSize: 17,
    letterSpacing: 0.2
  },
});