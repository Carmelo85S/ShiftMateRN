import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { supabase } from "@/lib/supabase";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Button,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import { v4 as uuidv4 } from "uuid";

export default function CreateShift() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [shiftDate, setShiftDate] = useState(new Date());
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date());
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission denied", "Cannot access media library");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setImageUri(uri);
      await uploadImage(uri);
    }
  };

  const uploadImage = async (uri: string) => {
    try {
      setLoading(true);
      const response = await fetch(uri);
      const blob = await response.blob();
      const filename = `${uuidv4()}.jpg`;
      const { data } = await supabase.storage
        .from("shift-images")
        .upload(filename, blob, { upsert: true });

      // Ottieni l'URL pubblico
      const { data: publicData } = supabase.storage
        .from("shift-images")
        .getPublicUrl(filename);

      setImageUrl(publicData.publicUrl);
      setLoading(false);
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to upload image");
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!title || !shiftDate || !startTime || !endTime) {
      Alert.alert("Validation", "Please fill all fields");
      return;
    }

    setLoading(true);

    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("Not logged in");

      const { error } = await supabase.from("shifts").insert([
        {
          title,
          shift_date: shiftDate.toISOString().split("T")[0],
          start_time: startTime.toTimeString().split(" ")[0],
          end_time: endTime.toTimeString().split(" ")[0],
          created_by: userData.user.id,
          image_url: imageUrl,
        },
      ]);

      if (error) throw error;

      Alert.alert("Success", "Shift created");
      router.back();
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to create shift");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
    contentContainerStyle={[styles.container, { backgroundColor: theme.background }]}
    keyboardShouldPersistTaps="handled"
    >
    {/* Image Picker */}
    <Pressable
        style={[styles.imagePicker, { borderColor: theme.tint }]}
        onPress={pickImage}
    >
        {imageUri ? (
        <Image source={{ uri: imageUri }} style={styles.imagePreview} />
        ) : (
        <Text style={{ color: theme.text }}>Pick an image</Text>
        )}
    </Pressable>

    {/* Title */}
    <Text style={[styles.label, { color: theme.text }]}>Title</Text>
    <TextInput
        value={title}
        onChangeText={setTitle}
        placeholder="Shift title"
        placeholderTextColor="#999"
        style={[styles.input, { borderColor: theme.tint, color: theme.text }]}
    />

    {/* Date */}
    <View style={styles.row}>
        <Text style={[styles.rowLabel, { color: theme.text }]}>Date</Text>
        <DateTimePicker
        value={shiftDate}
        mode="date"
        display="default"
        onChange={(_, date) => date && setShiftDate(date)}
        style={styles.rowPicker}
        />
    </View>

    {/* Start Time */}
    <View style={styles.row}>
        <Text style={[styles.rowLabel, { color: theme.text }]}>Start</Text>
        <DateTimePicker
        value={startTime}
        mode="time"
        display="default"
        onChange={(_, date) => date && setStartTime(date)}
        style={styles.rowPicker}
        />
    </View>

    {/* End Time */}
    <View style={styles.row}>
        <Text style={[styles.rowLabel, { color: theme.text }]}>End</Text>
        <DateTimePicker
        value={endTime}
        mode="time"
        display="default"
        onChange={(_, date) => date && setEndTime(date)}
        style={styles.rowPicker}
        />
    </View>

    {/* Save Button */}
    <Pressable
        onPress={handleSave}
        style={[styles.button, { backgroundColor: theme.tint }]}
        disabled={loading}
    >
        <Text style={styles.buttonText}>{loading ? "Saving..." : "Save Shift"}</Text>
    </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 24 },
  label: { marginTop: 12, marginBottom: 4, fontSize: 14, fontWeight: "500" },
  row: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  rowLabel: { width: 80, fontSize: 14, fontWeight: "500" },
  rowPicker: { flex: 1 },
  input: { borderWidth: 1, padding: 14, borderRadius: 12, fontSize: 16, marginBottom: 12 },
  datePicker: { marginBottom: 8 },
  imagePicker: {
    borderWidth: 1,
    borderRadius: 12,
    height: 140,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    overflow: "hidden",
  },
  imagePreview: { width: "100%", height: "100%" },
  button: {
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 12,
  },
  buttonText: { color: "white", fontWeight: "bold", fontSize: 16 },
});