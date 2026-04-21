import { Colors } from "@/constants/theme";
import { supabase } from "@/lib/supabase";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useState, useEffect, useMemo } from "react";
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
  KeyboardAvoidingView,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import ShiftUploader from "@/components/imagePicker/imagePickerShift";
import { Ionicons } from "@expo/vector-icons";
import { deleteShift, getShiftForEdit, updateShift } from "@/queries/managerQueries";

const INDUSTRIES = [
  { id: 'hospitality', label: 'Hospitality', icon: 'restaurant-outline' },
  { id: 'retail', label: 'Retail', icon: 'cart-outline' },
  { id: 'events', label: 'Events', icon: 'star-outline' },
  { id: 'logistics', label: 'Logistics', icon: 'bus-outline' },
  { id: 'admin', label: 'Admin', icon: 'briefcase-outline' },
];

const JOB_TITLES_BY_INDUSTRY: Record<string, string[]> = {
  hospitality: ['Waiter/Waitress', 'Bartender', 'Chef', 'Runner', 'Dishwasher', 'Hostess'],
  retail: ['Sales Assistant', 'Store Manager', 'Cashier', 'Visual Merchandiser'],
  events: ['Promoter', 'Security', 'Event Host', 'Stage Hand', 'Photographer'],
  logistics: ['Warehouse Worker', 'Delivery Driver', 'Forklift Operator', 'Packer'],
  admin: ['Receptionist', 'Data Entry', 'Office Assistant', 'Secretary'],
};

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
  const [deleting, setDeleting] = useState(false);
  const [picker, setPicker] = useState({
    show: false,
    mode: 'date' as 'date' | 'time',
    target: '' as 'date' | 'startTime' | 'endTime'
  });

  // --- CALCOLO GUADAGNO ---
  const estimatedEarnings = useMemo(() => {
    const rate = parseFloat(hourlyRate);
    if (isNaN(rate) || rate <= 0) return 0;
    const diffInMs = endTime.getTime() - startTime.getTime();
    const diffInHours = diffInMs / (1000 * 60 * 60);
    const finalHours = diffInHours > 0 ? diffInHours : diffInHours + 24;
    return (rate * finalHours).toFixed(2);
  }, [hourlyRate, startTime, endTime]);

  // --- FETCH DATA ---
  useEffect(() => {
    const fetchShift = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const data = await getShiftForEdit(id);
        if (!data) {
          router.replace("/(manager)/(tabs)/shift");
          return;
        }
        setTitle(data.title);
        setDescription(data.description ?? "");
        setDepartment(data.department ?? "");
        setHourlyRate(data.hourly_rate?.toString() ?? "");
        setShiftDate(new Date(data.shift_date));
        setStartTime(new Date(`1970-01-01T${data.start_time}`));
        setEndTime(new Date(`1970-01-01T${data.end_time}`));
        setImageUrl(data.image_url ?? null);
      } catch (err) {
      } finally {
        setLoading(false);
      }
    };
    fetchShift();
  }, [id]);

  const handleSave = async () => {
    if (!title || !hourlyRate || !department) {
      Alert.alert("Validation", "Please fill in Title, Industry and Hourly Rate");
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
      router.back();
    } catch (err) {
      Alert.alert("Error", "Failed to update shift");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    Alert.alert("Delete Shift", "Are you sure? This action is permanent.", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: async () => {
          setDeleting(true);
          try {
            await deleteShift(id!);
            router.replace("/(manager)/(tabs)/shift");
          } catch (err) {
            Alert.alert("Error", "Could not delete the shift.");
          } finally { setDeleting(false); }
      }}
    ]);
  };

  const onPickerChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') setPicker({ ...picker, show: false });
    if (selectedDate) {
      if (picker.target === 'date') setShiftDate(selectedDate);
      else if (picker.target === 'startTime') setStartTime(selectedDate);
      else if (picker.target === 'endTime') setEndTime(selectedDate);
    }
  };

  const renderDatePicker = () => {
    if (!picker.show) return null;
    const currentValue = picker.target === 'date' ? shiftDate : picker.target === 'startTime' ? startTime : endTime;
    return (
      <Modal transparent animationType="slide" visible={picker.show}>
        <Pressable style={styles.modalOverlay} onPress={() => setPicker({ ...picker, show: false })}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <View style={styles.modalHeader}>
              <Pressable onPress={() => setPicker({ ...picker, show: false })}>
                <Text style={{ color: theme.tint, fontWeight: '700', fontSize: 16 }}>Done</Text>
              </Pressable>
            </View>
            <DateTimePicker
              value={currentValue}
              mode={picker.mode}
              is24Hour={true}
              display="spinner"
              onChange={onPickerChange}
              textColor={theme.text}
              style={{ width: '100%', height: 250 }}
            />
          </View>
        </Pressable>
      </Modal>
    );
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={theme.tint} /></View>;

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1, backgroundColor: theme.background }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.container}>
        <Text style={[styles.subtitle, { color: theme.text }]}>Modify the shift details</Text>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Cover Image</Text>
          <ShiftUploader initialUrl={imageUrl} onUpload={(url) => setImageUrl(url)} />
        </View>

        {/* INDUSTRY & SUGGESTIONS */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Industry *</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
            {INDUSTRIES.map((item) => (
              <Pressable
                key={item.id}
                onPress={() => setDepartment(item.id)}
                style={[styles.categoryChip, { backgroundColor: department === item.id ? theme.tint : theme.background, borderColor: theme.border }]}
              >
                <Ionicons name={item.icon as any} size={16} color={department === item.id ? "#FFF" : theme.text} />
                <Text style={[styles.categoryText, { color: department === item.id ? "#FFF" : theme.text }]}>{item.label}</Text>
              </Pressable>
            ))}
          </ScrollView>

          {department && (
            <View style={{ marginTop: 20 }}>
              <Text style={styles.miniLabel}>Suggested Job Titles</Text>
              <View style={styles.titleContainer}>
                {JOB_TITLES_BY_INDUSTRY[department]?.map((t) => (
                  <Pressable
                    key={t}
                    onPress={() => setTitle(t)}
                    style={[styles.titleChip, { backgroundColor: title === t ? theme.tint + "20" : "transparent", borderColor: title === t ? theme.tint : theme.border }]}
                  >
                    <Text style={[styles.titleChipText, { color: title === t ? theme.tint : theme.text }]}>{t}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Job Details</Text>
          
          <Text style={styles.label}>Shift Title</Text>
          <TextInput value={title} onChangeText={setTitle} placeholder="e.g. Waiter" style={styles.input} />

          <Text style={styles.label}>Rate (€/h)</Text>
          <View style={styles.rateRow}>
            <TextInput 
              value={hourlyRate} 
              onChangeText={setHourlyRate} 
              keyboardType="numeric" 
              placeholder="15.00" 
              style={[styles.input, { flex: 0.8, marginBottom: 0 }]} 
            />
            <View style={[styles.earningsBox, { backgroundColor: theme.tint + "10" }]}>
              <Text style={[styles.earningsLabel, { color: theme.tint }]}>WIN FOR WORKER</Text>
              <Text style={[styles.earningsValue, { color: theme.tint }]}>€{estimatedEarnings}</Text>
            </View>
          </View>

          <Text style={[styles.label, { marginTop: 16 }]}>Description</Text>
          <TextInput value={description} onChangeText={setDescription} multiline maxLength={300} placeholder="Describe tasks..." style={styles.textarea} />
          <Text style={styles.counter}>{description.length}/300</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Timing</Text>
          <Pressable style={styles.row} onPress={() => setPicker({ show: true, mode: 'date', target: 'date' })}>
            <Text style={styles.rowLabel}>Date</Text>
            <View style={styles.pickerTrigger}><Text>{shiftDate.toLocaleDateString()}</Text></View>
          </Pressable>
          <Pressable style={styles.row} onPress={() => setPicker({ show: true, mode: 'time', target: 'startTime' })}>
            <Text style={styles.rowLabel}>Starts</Text>
            <View style={styles.pickerTrigger}><Text>{startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text></View>
          </Pressable>
        </View>

        <Pressable onPress={handleSave} style={[styles.button, { backgroundColor: theme.text }]} disabled={saving}>
          {saving ? <ActivityIndicator color={theme.background} /> : <Text style={[styles.buttonText, { color: theme.background }]}>Update Shift</Text>}
        </Pressable>

        <Pressable onPress={handleDelete} style={styles.deleteButton}>
          <Ionicons name="trash-outline" size={18} color="#FF3B30" />
          <Text style={styles.deleteButtonText}>Delete Shift</Text>
        </Pressable>
      </ScrollView>
      {renderDatePicker()}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, paddingBottom: 60 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  subtitle: { fontSize: 15, opacity: 0.5, marginBottom: 25 },
  card: { borderRadius: 24, padding: 20, marginBottom: 20, backgroundColor: "#fff", shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 20, elevation: 3 },
  sectionTitle: { fontSize: 18, fontWeight: "700", marginBottom: 16 },
  miniLabel: { fontSize: 12, fontWeight: "600", marginBottom: 10, opacity: 0.5, textTransform: 'uppercase' },
  label: { fontSize: 11, fontWeight: "700", marginBottom: 8, opacity: 0.4, textTransform: 'uppercase', padding: 8 },
  rateRow: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  input: { height: 58, backgroundColor: 'rgba(0,0,0,0.02)', borderRadius: 16, paddingHorizontal: 16, fontSize: 15, borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)' },
  earningsBox: { flex: 1, height: 58, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  earningsLabel: { fontSize: 8, fontWeight: "800", marginBottom: 2 },
  earningsValue: { fontSize: 16, fontWeight: "900" },
  textarea: { backgroundColor: 'rgba(0,0,0,0.02)', borderRadius: 16, padding: 16, fontSize: 15, minHeight: 100, textAlignVertical: "top" },
  counter: { textAlign: "right", fontSize: 12, opacity: 0.3, marginTop: 4 },
  categoryScroll: { flexDirection: 'row' },
  categoryChip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 14, marginRight: 10, borderWidth: 1, gap: 8 },
  categoryText: { fontSize: 14, fontWeight: "600" },
  titleContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  titleChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, borderWidth: 1 },
  titleChipText: { fontSize: 13, fontWeight: "600" },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.03)' },
  rowLabel: { fontSize: 15, fontWeight: "600" },
  pickerTrigger: { backgroundColor: 'rgba(0,0,0,0.02)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  button: { padding: 20, borderRadius: 22, alignItems: "center", marginTop: 10 },
  buttonText: { fontWeight: "800", fontSize: 17 },
  deleteButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 25, padding: 15 },
  deleteButtonText: { color: "#FF3B30", fontWeight: "700", fontSize: 15 },
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' },
  modalContent: { height: 380, borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingBottom: 30, alignItems: 'center' },
  modalHeader: { width: '100%', height: 50, flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', paddingHorizontal: 20 },
});