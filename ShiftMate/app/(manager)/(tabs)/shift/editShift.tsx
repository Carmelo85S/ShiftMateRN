import { Colors } from "@/constants/theme";
import { supabase } from "@/lib/supabase";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useState, useEffect, useCallback } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  ActivityIndicator,
  Platform,
  Modal,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import ShiftUploader from "@/components/imagePicker/imagePickerShift";
import { Ionicons } from "@expo/vector-icons";

export default function EditShift() {
  const theme = Colors.light;
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  // Stati del Form
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [shiftDate, setShiftDate] = useState(new Date());
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date());
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  
  // Stati UI
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [picker, setPicker] = useState({
    show: false,
    mode: 'date' as 'date' | 'time',
    target: '' as 'date' | 'startTime' | 'endTime'
  });

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

  const handleSave = async () => {
    if (!title) {
      Alert.alert("Validation", "Title is required");
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
          start_time: startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
          end_time: endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
          image_url: imageUrl,
        })
        .eq("id", id);

      if (error) throw error;
      Alert.alert("Success", "Shift updated successfully");
      router.back();
    } catch (err) {
      Alert.alert("Error", "Failed to update shift");
    } finally {
      setSaving(false);
    }
  };

  const onPickerChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setPicker({ ...picker, show: false });
      if (selectedDate) updateStateFromPicker(selectedDate);
    } else {
      if (selectedDate) updateStateFromPicker(selectedDate);
    }
  };

  const updateStateFromPicker = (date: Date) => {
    if (picker.target === 'date') setShiftDate(date);
    else if (picker.target === 'startTime') setStartTime(date);
    else if (picker.target === 'endTime') setEndTime(date);
  };

  const showPickerMode = (mode: 'date' | 'time', target: 'date' | 'startTime' | 'endTime') => {
    setPicker({ show: true, mode, target });
  };

  const renderDatePicker = () => {
    if (!picker.show) return null;

    const currentValue = picker.target === 'date' ? shiftDate : picker.target === 'startTime' ? startTime : endTime;

    const pickerElement = (
      <DateTimePicker
        value={currentValue}
        mode={picker.mode}
        is24Hour={true}
        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
        onChange={onPickerChange}
        textColor={theme.text}
      />
    );

    if (Platform.OS === 'ios') {
      return (
        <Modal transparent animationType="slide" visible={picker.show}>
          <Pressable style={styles.modalOverlay} onPress={() => setPicker({ ...picker, show: false })}>
            <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
              <View style={styles.modalHeader}>
                <Pressable onPress={() => setPicker({ ...picker, show: false })}>
                  <Text style={{ color: theme.tint, fontWeight: '700', fontSize: 16 }}>Done</Text>
                </Pressable>
              </View>
              {pickerElement}
            </View>
          </Pressable>
        </Modal>
      );
    }
    return pickerElement;
  };

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.tint} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.container}
      >
        <Text style={[styles.subtitle, { color: theme.text }]}>Edit job opportunity</Text>

        {/* IMAGE */}
        <View style={styles.card}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Cover Image</Text>
          <ShiftUploader
            initialUrl={imageUrl}
            onUpload={(url) => setImageUrl(url)}
          />
        </View>

        {/* DETAILS */}
        <View style={styles.card}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Details</Text>
          <Text style={[styles.label, { color: theme.text }]}>Title</Text>
          <TextInput
            value={title}
            onChangeText={setTitle}
            style={[styles.input, { color: theme.text }]}
          />

          <Text style={[styles.label, { color: theme.text }]}>Description</Text>
          <TextInput
            value={description}
            onChangeText={setDescription}
            multiline
            maxLength={300}
            style={[styles.textarea, { color: theme.text }]}
          />
          <Text style={styles.counter}>{description.length}/300</Text>
        </View>

        {/* SCHEDULE - REPLACED WITH PRESSABLES */}
        <View style={styles.card}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Schedule</Text>

          <Pressable style={styles.row} onPress={() => showPickerMode('date', 'date')}>
            <Text style={[styles.rowLabel, { color: theme.text }]}>Date</Text>
            <View style={styles.pickerTrigger}>
              <Text style={{ color: theme.text }}>{shiftDate.toLocaleDateString()}</Text>
              <Ionicons name="chevron-forward" size={16} color={theme.text} style={{ opacity: 0.3 }} />
            </View>
          </Pressable>

          <Pressable style={styles.row} onPress={() => showPickerMode('time', 'startTime')}>
            <Text style={[styles.rowLabel, { color: theme.text }]}>Start Time</Text>
            <View style={styles.pickerTrigger}>
              <Text style={{ color: theme.text }}>{startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
              <Ionicons name="chevron-forward" size={16} color={theme.text} style={{ opacity: 0.3 }} />
            </View>
          </Pressable>

          <Pressable style={styles.row} onPress={() => showPickerMode('time', 'endTime')}>
            <Text style={[styles.rowLabel, { color: theme.text }]}>End Time</Text>
            <View style={styles.pickerTrigger}>
              <Text style={{ color: theme.text }}>{endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
              <Ionicons name="chevron-forward" size={16} color={theme.text} style={{ opacity: 0.3 }} />
            </View>
          </Pressable>
        </View>

        <Pressable
          onPress={handleSave}
          style={({ pressed }) => [
            styles.button,
            { backgroundColor: theme.text, opacity: pressed || saving ? 0.8 : 1 }
          ]}
          disabled={saving}
        >
          <Text style={[styles.buttonText, { color: theme.background }]}>
            {saving ? "Saving..." : "Save Changes"}
          </Text>
        </Pressable>
      </ScrollView>

      {renderDatePicker()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, paddingBottom: 60 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  subtitle: { fontSize: 15, opacity: 0.5, marginBottom: 25 },
  card: { 
    borderRadius: 24, 
    padding: 20, 
    marginBottom: 20, 
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.04,
    shadowRadius: 20,
    elevation: 3 
  },
  sectionTitle: { fontSize: 18, fontWeight: "700", marginBottom: 16 },
  label: { fontSize: 11, fontWeight: "700", marginBottom: 8, opacity: 0.4, textTransform: 'uppercase' },
  input: { backgroundColor: 'rgba(0,0,0,0.02)', borderRadius: 16, padding: 16, fontSize: 15, marginBottom: 16 },
  textarea: { backgroundColor: 'rgba(0,0,0,0.02)', borderRadius: 16, padding: 16, fontSize: 15, minHeight: 120, textAlignVertical: "top" },
  counter: { textAlign: "right", fontSize: 12, opacity: 0.3, marginTop: 4 },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.03)' },
  rowLabel: { fontSize: 15, fontWeight: "600" },
  pickerTrigger: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  button: { padding: 18, borderRadius: 20, alignItems: "center" },
  buttonText: { fontWeight: "700", fontSize: 17 },
  
  // MODAL STYLES (iOS Alto)
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalContent: {
    height: 380,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 30,
  },
  modalHeader: {
    height: 50,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 20,
    borderBottomWidth: 0.5,
    borderBottomColor: '#ccc',
    marginBottom: 10,
  },
});