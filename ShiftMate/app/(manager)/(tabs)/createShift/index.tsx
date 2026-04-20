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
import { useRouter, useFocusEffect } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import DateTimePicker from "@react-native-community/datetimepicker";
import ShiftUploader from "@/components/imagePicker/imagePickerShift";
import { createShift } from "@/queries/managerQueries";

// Configuriamo le categorie per un'app "Open"
const INDUSTRIES = [
  { id: 'hospitality', label: 'Hospitality', icon: 'restaurant-outline' },
  { id: 'retail', label: 'Retail', icon: 'cart-outline' },
  { id: 'events', label: 'Events', icon: 'star-outline' },
  { id: 'logistics', label: 'Logistics', icon: 'bus-outline' },
  { id: 'admin', label: 'Admin', icon: 'briefcase-outline' },
];

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
    hourly_rate: "", // Nuovo campo
    date: new Date(),
    startTime: new Date(),
    endTime: new Date(new Date().setHours(new Date().getHours() + 8)),
  });

  const [picker, setPicker] = useState({
    show: false,
    mode: 'date' as 'date' | 'time',
    target: '' as 'date' | 'startTime' | 'endTime'
  });

  // Calcolo dinamico del guadagno stimato
  const estimatedEarnings = useMemo(() => {
    const rate = parseFloat(form.hourly_rate);
    if (isNaN(rate) || rate <= 0) return 0;

    const diffInMs = form.endTime.getTime() - form.startTime.getTime();
    const diffInHours = diffInMs / (1000 * 60 * 60);
    
    // Gestione turni che superano la mezzanotte
    const finalHours = diffInHours > 0 ? diffInHours : diffInHours + 24;
    return (rate * finalHours).toFixed(2);
  }, [form.hourly_rate, form.startTime, form.endTime]);

  const handleCreate = async () => {
    if (!form.title || !form.department || !form.hourly_rate) {
      Alert.alert("Missing Info", "Title, Industry and Hourly Rate are required.");
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      // Passiamo i nuovi dati alla query (assicurati che managerQueries gestisca hourly_rate)
      await createShift(user.id, imageUrl, {
        ...form,
        hourly_rate: form.hourly_rate // Inviato come stringa o numero a seconda della tua query
      } as any);

      Alert.alert("Success", "Shift posted successfully!", [
        { text: "OK", onPress: () => router.push("/(manager)/(tabs)/shift") },
      ]);
    } catch (err: any) {
      console.error(err);
      Alert.alert("Error", err.message || "Could not create shift.");
    } finally {
      setLoading(false);
    }
  };

  const onPickerChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') setPicker({ ...picker, show: false });
    if (selectedDate) setForm({ ...form, [picker.target]: selectedDate });
  };

  const renderDatePicker = () => {
    if (!picker.show) return null;
    const pickerElement = (
      <DateTimePicker
        value={(form as any)[picker.target]}
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
          <Text style={[styles.subtitle, { color: theme.text }]}>Attract workers by offering clear rates.</Text>
        </View>

        <View style={styles.imageSection}>
           <ShiftUploader initialUrl={imageUrl} onUpload={(url) => setImageUrl(url)} />
        </View>

        {/* INDUSTRY SELECTOR (OPEN APP) */}
        <View style={styles.inputWrapper}>
          <Text style={[styles.label, { color: theme.text }]}>Industry *</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
            {INDUSTRIES.map((item) => (
              <Pressable
                key={item.id}
                onPress={() => setForm({ ...form, department: item.id })}
                style={[
                  styles.categoryChip,
                  { 
                    backgroundColor: form.department === item.id ? theme.tint : theme.card,
                    borderColor: theme.border 
                  }
                ]}
              >
                <Ionicons 
                  name={item.icon as any} 
                  size={16} 
                  color={form.department === item.id ? "#FFF" : theme.secondaryText} 
                />
                <Text style={[styles.categoryText, { color: form.department === item.id ? "#FFF" : theme.text }]}>
                  {item.label}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

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

        {/* PAY RATE SECTION */}
        <View style={styles.inputWrapper}>
          <Text style={[styles.label, { color: theme.text }]}>Hourly Rate (€/hr) *</Text>
          <View style={styles.rateRow}>
            <TextInput
              style={[styles.input, { flex: 1, backgroundColor: theme.card, color: theme.text, borderColor: theme.border }]}
              placeholder="0.00"
              keyboardType="decimal-pad"
              placeholderTextColor={theme.text + "40"}
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
            placeholderTextColor={theme.text + "40"}
            value={form.description}
            onChangeText={(text) => setForm({ ...form, description: text })}
            multiline
          />
        </View>

        <View style={styles.inputWrapper}>
          <Text style={[styles.label, { color: theme.text }]}>Date *</Text>
          <Pressable 
            onPress={() => setPicker({ show: true, mode: 'date', target: 'date' })}
            style={[styles.input, { backgroundColor: theme.card, borderColor: theme.border, justifyContent: 'center' }]}
          >
            <Text style={{ color: theme.text, fontSize: 16 }}>
              {form.date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
            </Text>
          </Pressable>
        </View>

        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.label, { color: theme.text }]}>Start *</Text>
            <Pressable 
              onPress={() => setPicker({ show: true, mode: 'time', target: 'startTime' })}
              style={[styles.input, { backgroundColor: theme.card, borderColor: theme.border, justifyContent: 'center' }]}
            >
              <Text style={{ color: theme.text }}>
                {form.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </Pressable>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.label, { color: theme.text }]}>End *</Text>
            <Pressable 
              onPress={() => setPicker({ show: true, mode: 'time', target: 'endTime' })}
              style={[styles.input, { backgroundColor: theme.card, borderColor: theme.border, justifyContent: 'center' }]}
            >
              <Text style={{ color: theme.text }}>
                {form.endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </Pressable>
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
            <Text style={[styles.submitText, { color: theme.background }]}>Post Shift</Text>
          )}
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
  input: {
    height: 58,
    paddingHorizontal: 16,
    borderRadius: 18,
    fontSize: 16,
    borderWidth: 1,
  },
  textArea: { height: 100, textAlignVertical: "top", paddingTop: 16 },
  row: { flexDirection: "row", gap: 12, marginBottom: 20 },
  categoryScroll: { flexDirection: 'row', marginBottom: 5 },
  categoryChip: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 16, 
    paddingVertical: 10, 
    borderRadius: 14, 
    marginRight: 10, 
    borderWidth: 1, 
    gap: 8 
  },
  categoryText: { fontSize: 14, fontWeight: "600" },
  rateRow: { flexDirection: 'row', gap: 12 },
  earningsBox: { 
    flex: 1, 
    borderRadius: 18, 
    paddingHorizontal: 15, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  earningsLabel: { fontSize: 9, fontWeight: "800", marginBottom: 2 },
  earningsValue: { fontSize: 18, fontWeight: "900" },
  submitButton: {
    marginTop: 10,
    height: 60,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3
  },
  submitText: { fontSize: 16, fontWeight: "700" },
  imageSection: { marginBottom: 25 },
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' },
  modalContent: { height: 380, borderTopLeftRadius: 30, borderTopRightRadius: 30, paddingBottom: 30 },
  modalHeader: { 
    height: 60, 
    flexDirection: 'row', 
    justifyContent: 'flex-end', 
    alignItems: 'center', 
    paddingHorizontal: 25, 
    borderBottomWidth: 0.5, 
    borderBottomColor: 'rgba(0,0,0,0.1)' 
  },
});