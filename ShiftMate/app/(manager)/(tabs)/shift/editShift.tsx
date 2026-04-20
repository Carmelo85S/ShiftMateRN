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
  Platform,
  Modal,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import ShiftUploader from "@/components/imagePicker/imagePickerShift";
import { Ionicons } from "@expo/vector-icons";
import { deleteShift, getShiftForEdit, updateShift } from "@/queries/managerQueries";

export default function EditShift() {
  const theme = Colors.light;
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  // --- STATE ---
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [department, setDepartment] = useState("");
  const [hourlyRate, setHourlyRate] = useState("");
  const [shiftDate, setShiftDate] = useState(new Date());
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date());
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [picker, setPicker] = useState({
    show: false,
    mode: 'date' as 'date' | 'time',
    target: '' as 'date' | 'startTime' | 'endTime'
  });

  const [deleting, setDeleting] = useState(false);

  // --- FETCH DATA ---
  useEffect(() => {
    const fetchShift = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const data = await getShiftForEdit(id);
        if (!data) {
          Alert.alert("Error", "Shift not found");
          router.back();
          return;
        }

        setTitle(data.title);
        setDescription(data.description ?? "");
        setDepartment(data.department ?? "");
        setHourlyRate(data.hourly_rate?.toString() ?? "");
        setShiftDate(new Date(data.shift_date));
        // Formattazione ore per il picker (ISO dummy date + time string)
        setStartTime(new Date(`1970-01-01T${data.start_time}`));
        setEndTime(new Date(`1970-01-01T${data.end_time}`));
        setImageUrl(data.image_url ?? null);
      } catch (err) {
        console.error("Fetch Error:", err);
        Alert.alert("Error", "Failed to load shift data");
      } finally {
        setLoading(false);
      }
    };

    fetchShift();
  }, [id]);

  const handleDelete = () => {
    Alert.alert(
      "Delete Shift",
      "Are you sure you want to delete this shift? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive", 
          onPress: async () => {
            setDeleting(true);
            try {
              await deleteShift(id!);
              router.replace("/(manager)/(tabs)/shift");
            } catch (err) {
              console.error("Delete Error:", err);
              Alert.alert("Error", "Could not delete the shift. Check if there are active applications.");
            } finally {
              setDeleting(false);
            }
          }
        }
      ]
    );
  };
  
  // --- SAVE LOGIC ---
  const handleSave = async () => {
    if (!title || !hourlyRate || !department) {
      Alert.alert("Validation", "Please fill in Title, Department and Hourly Rate");
      return;
    }

    setSaving(true);
    try {
      await updateShift(id!, {
        title: title.trim(),
        description: description.trim(),
        shift_date: shiftDate,
        start_time: startTime,
        end_time: endTime,
        image_url: imageUrl,
        hourly_rate: hourlyRate,
        department: department.trim()
      });

      Alert.alert("Success", "Shift updated successfully", [
        { text: "OK", onPress: () => router.back() }
      ]);
    } catch (err) {
      console.error("Update Error:", err);
      Alert.alert("Error", "Failed to update shift");
    } finally {
      setSaving(false);
    }
  };

  // --- PICKER HELPERS ---
  const onPickerChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setPicker({ ...picker, show: false });
    }
    if (selectedDate) {
      if (picker.target === 'date') setShiftDate(selectedDate);
      else if (picker.target === 'startTime') setStartTime(selectedDate);
      else if (picker.target === 'endTime') setEndTime(selectedDate);
    }
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
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.container}>
        <Text style={[styles.subtitle, { color: theme.text }]}>Modify the shift details</Text>

        {/* IMAGE SECTION */}
        <View style={styles.card}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Cover Image</Text>
          <ShiftUploader initialUrl={imageUrl} onUpload={(url) => setImageUrl(url)} />
        </View>

        {/* DETAILS SECTION */}
        <View style={styles.card}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Job Details</Text>
          
          <Text style={[styles.label, { color: theme.text }]}>Shift Title</Text>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="e.g. Senior Waiter"
            style={[styles.input, { color: theme.text }]}
          />

          <View style={styles.inputRow}>
            <View style={{ flex: 1.5 }}>
              <Text style={[styles.label, { color: theme.text }]}>Department</Text>
              <TextInput
                value={department}
                onChangeText={setDepartment}
                placeholder="e.g. Kitchen"
                style={[styles.input, { color: theme.text }]}
              />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={[styles.label, { color: theme.text }]}>Rate (€/h)</Text>
              <TextInput
                value={hourlyRate}
                onChangeText={setHourlyRate}
                keyboardType="numeric"
                placeholder="15.00"
                style={[styles.input, { color: theme.text }]}
              />
            </View>
          </View>

          <Text style={[styles.label, { color: theme.text }]}>Description</Text>
          <TextInput
            value={description}
            onChangeText={setDescription}
            multiline
            maxLength={300}
            placeholder="Describe the tasks..."
            style={[styles.textarea, { color: theme.text }]}
          />
          <Text style={styles.counter}>{description.length}/300</Text>
        </View>

        {/* SCHEDULE SECTION */}
        <View style={styles.card}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Timing</Text>

          <Pressable style={styles.row} onPress={() => showPickerMode('date', 'date')}>
            <Text style={[styles.rowLabel, { color: theme.text }]}>Date</Text>
            <View style={styles.pickerTrigger}>
              <Text style={{ color: theme.text }}>{shiftDate.toLocaleDateString()}</Text>
              <Ionicons name="calendar-outline" size={16} color={theme.tint} />
            </View>
          </Pressable>

          <Pressable style={styles.row} onPress={() => showPickerMode('time', 'startTime')}>
            <Text style={[styles.rowLabel, { color: theme.text }]}>Starts at</Text>
            <View style={styles.pickerTrigger}>
              <Text style={{ color: theme.text }}>{startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
              <Ionicons name="time-outline" size={16} color={theme.tint} />
            </View>
          </Pressable>

          <Pressable style={styles.row} onPress={() => showPickerMode('time', 'endTime')}>
            <Text style={[styles.rowLabel, { color: theme.text }]}>Ends at</Text>
            <View style={styles.pickerTrigger}>
              <Text style={{ color: theme.text }}>{endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
              <Ionicons name="time-outline" size={16} color={theme.tint} />
            </View>
          </Pressable>
        </View>

        {/* SAVE BUTTON */}
        <Pressable
          onPress={handleSave}
          style={({ pressed }) => [
            styles.button,
            { backgroundColor: theme.text, opacity: pressed || saving ? 0.8 : 1 }
          ]}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color={theme.background} />
          ) : (
            <Text style={[styles.buttonText, { color: theme.background }]}>Update Shift</Text>
          )}
        </Pressable>
        {/* DELETE BUTTON */}
        <Pressable
          onPress={handleDelete}
          style={({ pressed }) => [
            styles.deleteButton,
            { opacity: pressed || deleting ? 0.6 : 1 }
          ]}
          disabled={saving || deleting}
        >
          {deleting ? (
            <ActivityIndicator color="#FF3B30" />
          ) : (
            <>
              <Ionicons name="trash-outline" size={18} color="#FF3B30" />
              <Text style={styles.deleteButtonText}>Delete Shift</Text>
            </>
          )}
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
  inputRow: { flexDirection: 'row', width: '100%' },
  textarea: { backgroundColor: 'rgba(0,0,0,0.02)', borderRadius: 16, padding: 16, fontSize: 15, minHeight: 120, textAlignVertical: "top" },
  counter: { textAlign: "right", fontSize: 12, opacity: 0.3, marginTop: 4 },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.03)' },
  rowLabel: { fontSize: 15, fontWeight: "600" },
  pickerTrigger: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: 'rgba(0,0,0,0.02)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  button: { padding: 20, borderRadius: 22, alignItems: "center", marginTop: 10 },
  buttonText: { fontWeight: "800", fontSize: 17 },
  
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' },
  modalContent: { height: 380, borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingBottom: 30 },
  modalHeader: { height: 50, flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', paddingHorizontal: 20, borderBottomWidth: 0.5, borderBottomColor: '#ccc', marginBottom: 10 },
  deleteButton: {flexDirection: 'row',alignItems: 'center',justifyContent: 'center',gap: 8,marginTop: 25,padding: 15},
  deleteButtonText: {color: "#FF3B30",fontWeight: "700",fontSize: 15},
});