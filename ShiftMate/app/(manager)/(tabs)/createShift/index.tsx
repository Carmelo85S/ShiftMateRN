import React, { useState, useCallback, useMemo } from "react";
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
  Modal,
} from "react-native";
import { supabase } from "@/lib/supabase";
import { Colors } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import DateTimePicker from "@react-native-community/datetimepicker";
import ShiftUploader from "@/components/imagePicker/imagePickerShift";
import { createShift } from "@/queries/managerQueries";

// Configurazione Industrie e Job Titles
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

export default function CreateShift() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];

  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  
  const [form, setForm] = useState({
    title: "",
    description: "",
    department: "", 
    hourly_rate: "",
    date: new Date(),
    startTime: new Date(new Date().setHours(new Date().getHours() + 1, 0)),
    endTime: new Date(new Date().setHours(new Date().getHours() + 9, 0)),
  });

  const [picker, setPicker] = useState({
    show: false,
    mode: 'date' as 'date' | 'time',
    target: '' as 'date' | 'startTime' | 'endTime'
  });

  // Guadagno stimato in tempo reale
  const estimatedEarnings = useMemo(() => {
    const rate = parseFloat(form.hourly_rate);
    if (isNaN(rate) || rate <= 0) return 0;
    const diffInMs = form.endTime.getTime() - form.startTime.getTime();
    const diffInHours = diffInMs / (1000 * 60 * 60);
    const finalHours = diffInHours > 0 ? diffInHours : diffInHours + 24;
    return (rate * finalHours).toFixed(2);
  }, [form.hourly_rate, form.startTime, form.endTime]);

  const handleCreate = async () => {
    if (!form.title || !form.department || !form.hourly_rate) {
      Alert.alert("Missing Info", "Title, Industry and Hourly Rate are required.");
      return;
    }

    const now = new Date();
    const shiftStart = new Date(form.date);
    shiftStart.setHours(form.startTime.getHours(), form.startTime.getMinutes());

    if (shiftStart < now) {
      Alert.alert("Invalid Time", "You cannot post a shift that starts in the past!");
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");
      
      await createShift(user.id, imageUrl, {
        ...form,
        hourly_rate: form.hourly_rate 
      } as any);

      Alert.alert("Success", "Shift posted successfully!", [
        { text: "OK", onPress: () => router.push("/(manager)/(tabs)/shift") },
      ]);
    } catch (err: any) {
      Alert.alert("Error", err.message || "Could not create shift.");
    } finally {
      setLoading(false);
    }
  };

  const onPickerChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') setPicker({ ...picker, show: false });
    if (selectedDate) {
      const now = new Date();
      let validatedDate = selectedDate;

      // Logica Anti-Passato istantanea
      if (picker.target === 'startTime' || picker.target === 'date') {
        const isToday = (picker.target === 'date' ? selectedDate : form.date).toDateString() === now.toDateString();
        if (isToday && selectedDate.getTime() < now.getTime() && picker.mode === 'time') {
          validatedDate = new Date();
        }
      }
      setForm({ ...form, [picker.target]: validatedDate });
    }
  };

  const renderDatePicker = () => {
    if (!picker.show) return null;
    const now = new Date();
    const isToday = form.date.toDateString() === now.toDateString();
    const minDate = (picker.mode === 'time' && isToday) ? now : (picker.mode === 'date' ? now : undefined);

    const pickerElement = (
      <DateTimePicker
        value={(form as any)[picker.target]}
        mode={picker.mode}
        is24Hour={true}
        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
        onChange={onPickerChange}
        textColor={theme.text}
        minimumDate={minDate}
        style={{ width: '100%', height: 250 }}
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
          <Text style={[styles.title, { color: theme.text }]}>New Shift</Text>
          <Text style={[styles.subtitle, { color: theme.text }]}>Attract workers with clear rates and titles.</Text>
        </View>

        <View style={styles.imageSection}>
           <ShiftUploader initialUrl={imageUrl} onUpload={(url) => setImageUrl(url)} />
        </View>

        {/* INDUSTRY SELECTOR */}
        <View style={styles.inputWrapper}>
          <Text style={[styles.label, { color: theme.text }]}>Industry *</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
            {INDUSTRIES.map((item) => (
              <Pressable
                key={item.id}
                onPress={() => setForm({ ...form, department: item.id, title: "" })}
                style={[
                  styles.categoryChip,
                  { backgroundColor: form.department === item.id ? theme.tint : theme.card, borderColor: theme.border }
                ]}
              >
                <Ionicons name={item.icon as any} size={16} color={form.department === item.id ? "#FFF" : theme.secondaryText} />
                <Text style={[styles.categoryText, { color: form.department === item.id ? "#FFF" : theme.text }]}>{item.label}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* SUGGESTED JOB TITLES */}
        {form.department && (
  <View style={styles.inputWrapper}>
    <Text style={[styles.label, { color: theme.text }]}>Suggested Titles</Text>
    <View style={styles.titleContainer}>
      {JOB_TITLES_BY_INDUSTRY[form.department]?.map((title) => (
        <Pressable
          key={title}
          onPress={() => setForm({ ...form, title })}
          style={[
            styles.titleChip,
            { 
              backgroundColor: form.title === title ? theme.tint : theme.card,
              borderColor: form.title === title ? theme.tint : theme.border 
            }
          ]}
        >
          <Text style={[
            styles.titleChipText, 
            { color: form.title === title ? "#FFF" : theme.text }
          ]}>
            {title}
          </Text>
        </Pressable>
      ))}
    </View>
  </View>
)}

        <View style={styles.inputWrapper}>
          <Text style={[styles.label, { color: theme.text }]}>Job Title *</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.card, color: theme.text, borderColor: theme.border }]}
            placeholder="e.g. Senior Barman"
            placeholderTextColor={theme.text + "40"}
            value={form.title}
            onChangeText={(text) => setForm({ ...form, title: text })}
          />
        </View>

        <View style={styles.inputWrapper}>
          <Text style={[styles.label, { color: theme.text }]}>Hourly Rate (€/hr) *</Text>
          <View style={styles.rateRow}>
            <TextInput
              style={[styles.input, { flex: 1, backgroundColor: theme.card, color: theme.text, borderColor: theme.border }]}
              placeholder="0.00"
              keyboardType="decimal-pad"
              value={form.hourly_rate}
              onChangeText={(text) => setForm({ ...form, hourly_rate: text })}
            />
            <View style={[styles.earningsBox, { backgroundColor: theme.tint + "10" }]}>
              <Text style={[styles.earningsLabel, { color: theme.tint }]}>WIN FOR WORKER</Text>
              <Text style={[styles.earningsValue, { color: theme.tint }]}>€{estimatedEarnings}</Text>
            </View>
          </View>
        </View>

        <View style={styles.inputWrapper}>
          <Text style={[styles.label, { color: theme.text }]}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea, { backgroundColor: theme.card, color: theme.text, borderColor: theme.border }]}
            placeholder="Describe the main tasks..."
            value={form.description}
            onChangeText={(text) => setForm({ ...form, description: text })}
            multiline
          />
        </View>

        <View style={styles.inputWrapper}>
          <Text style={[styles.label, { color: theme.text }]}>Date *</Text>
          <Pressable onPress={() => setPicker({ show: true, mode: 'date', target: 'date' })} style={[styles.input, styles.pickerButton, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text style={{ color: theme.text }}>{form.date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</Text>
          </Pressable>
        </View>

        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.label, { color: theme.text }]}>Start *</Text>
            <Pressable onPress={() => setPicker({ show: true, mode: 'time', target: 'startTime' })} style={[styles.input, styles.pickerButton, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <Text style={{ color: theme.text }}>{form.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
            </Pressable>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.label, { color: theme.text }]}>End *</Text>
            <Pressable onPress={() => setPicker({ show: true, mode: 'time', target: 'endTime' })} style={[styles.input, styles.pickerButton, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <Text style={{ color: theme.text }}>{form.endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
            </Pressable>
          </View>
        </View>

        <Pressable
          style={({ pressed }) => [styles.submitButton, { backgroundColor: theme.text, opacity: pressed || loading ? 0.8 : 1 }]}
          onPress={handleCreate}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color={theme.background} /> : <Text style={[styles.submitText, { color: theme.background }]}>Post Shift</Text>}
        </Pressable>

        {renderDatePicker()}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scrollContent: { paddingHorizontal: 28 },
  header: { marginBottom: 30 },
  title: { fontSize: 28, fontWeight: "900", letterSpacing: -1 },
  subtitle: { fontSize: 15, opacity: 0.5, marginTop: 4 },
  inputWrapper: { marginBottom: 20 },
  label: { fontSize: 13, fontWeight: "700", marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: { height: 58, paddingHorizontal: 16, borderRadius: 18, fontSize: 16, borderWidth: 1 },
  pickerButton: { justifyContent: 'center' },
  textArea: { height: 100, textAlignVertical: "top", paddingTop: 16 },
  row: { flexDirection: "row", gap: 12, marginBottom: 20 },
  categoryScroll: { flexDirection: 'row', marginBottom: 5 },
  categoryChip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 14, marginRight: 10, borderWidth: 1, gap: 8 },
  categoryText: { fontSize: 14, fontWeight: "600" },
  titleContainer: {flexDirection: 'row',flexWrap: 'wrap', gap: 8,marginTop: 5,},
  titleChip: {paddingHorizontal: 16,paddingVertical: 10,borderRadius: 14,borderWidth: 1},
  titleChipText: {fontSize: 14,fontWeight: "600"},
  rateRow: { flexDirection: 'row', gap: 12 },
  earningsBox: { flex: 1, borderRadius: 18, paddingHorizontal: 15, justifyContent: 'center', alignItems: 'center' },
  earningsLabel: { fontSize: 9, fontWeight: "800", marginBottom: 2 },
  earningsValue: { fontSize: 18, fontWeight: "900" },
  submitButton: { marginTop: 10, height: 60, borderRadius: 20, justifyContent: "center", alignItems: "center" },
  submitText: { fontSize: 16, fontWeight: "700" },
  imageSection: { marginBottom: 25 },
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' },
  modalContent: { height: 380, borderTopLeftRadius: 30, borderTopRightRadius: 30, paddingBottom: 30, alignItems: 'center' },
  modalHeader: { width: '100%', height: 60, flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', paddingHorizontal: 25, borderBottomWidth: 0.5, borderBottomColor: 'rgba(0,0,0,0.1)' },
});