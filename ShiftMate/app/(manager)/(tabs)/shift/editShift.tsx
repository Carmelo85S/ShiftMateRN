import React, { useState, useEffect, useMemo } from "react";
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
import { useRouter, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import DateTimePicker from "@react-native-community/datetimepicker";
import ShiftUploader from "@/components/imagePicker/imagePickerShift";
import { deleteShift, getShiftForEdit, updateShift } from "@/queries/managerQueries";

const DEPARTMENTS = [
  { id: 'kitchen', label: 'Kitchen', icon: 'restaurant-outline' },
  { id: 'bar', label: 'Bar', icon: 'wine-outline' },
  { id: 'service', label: 'Floor/Hall', icon: 'people-outline' },
  { id: 'reception', label: 'Front Desk', icon: 'key-outline' }, 
  { id: 'events', label: 'Events', icon: 'star-outline' },         
  { id: 'other', label: 'Other', icon: 'ellipsis-horizontal-outline' },
];

const TITLES_BY_DEPT: Record<string, string[]> = {
  kitchen: ['Chef', 'Sous Chef', 'Commis', 'Dishwasher', 'Pizza Chef', 'Kitchen Porter'],
  bar: ['Bartender', 'Barback', 'Mixologist', 'Bar Assistant'],
  service: ['Waiter/Waitress', 'Runner', 'Hostess', 'Maitre', 'Sommelier'],
  reception: ['Receptionist', 'Night Porter', 'Concierge', 'Office Assistant'],
  events: ['Event Staff', 'Security', 'Promoter', 'Host'],
  other: ['General Help', 'Maintenance'],
};

export default function EditShift() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  
  const [form, setForm] = useState({
    title: "",
    description: "",
    department: "", 
    industry: "hospitality", 
    hourly_rate: "",
    date: new Date(),
    startTime: new Date(),
    endTime: new Date(),
  });

  const [picker, setPicker] = useState({
    show: false,
    mode: 'date' as 'date' | 'time',
    target: '' as 'date' | 'startTime' | 'endTime'
  });

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

        // Mapping dei dati dal DB allo stato del form
        setForm({
          title: data.title,
          description: data.description ?? "",
          department: data.department ?? "",
          industry: "hospitality",
          hourly_rate: data.hourly_rate?.toString() ?? "",
          date: new Date(data.shift_date),
          // Creiamo oggetti Date validi per i picker partendo dalle stringhe TIME
          startTime: new Date(`1970-01-01T${data.start_time}`),
          endTime: new Date(`1970-01-01T${data.end_time}`),
        });
        setImageUrl(data.image_url ?? null);
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchShift();
  }, [id]);

  const estimatedEarnings = useMemo(() => {
    const rate = parseFloat(form.hourly_rate);
    if (isNaN(rate) || rate <= 0) return "0.00";
    const diffInMs = form.endTime.getTime() - form.startTime.getTime();
    let diffInHours = diffInMs / (1000 * 60 * 60);
    if (diffInHours < 0) diffInHours += 24;
    return (rate * diffInHours).toFixed(2);
  }, [form.hourly_rate, form.startTime, form.endTime]);

  const handleUpdate = async () => {
    if (!form.title || !form.department || !form.hourly_rate) {
      Alert.alert("Dati mancanti", "Dipartimento, Titolo e Tariffa Oraria sono obbligatori.");
      return;
    }

    setSaving(true);
    try {
      // Invia il form mappando correttamente i nomi per il DB se necessario nella query
      await updateShift(id!, { 
        ...form, 
        image_url: imageUrl,
        // Assicuriamoci di passare i valori corretti per le query
        shift_date: form.date,
        start_time: form.startTime,
        end_time: form.endTime 
      } as any);
      
      Alert.alert("Successo", "Turno aggiornato!", [{ text: "OK", onPress: () => router.back() }]);
    } catch (err: any) {
      Alert.alert("Errore", err.message || "Aggiornamento fallito.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    Alert.alert("Elimina Turno", "Sei sicuro? L'azione è irreversibile.", [
      { text: "Annulla", style: "cancel" },
      { 
        text: "Elimina", 
        style: "destructive", 
        onPress: async () => {
          setDeleting(true);
          try {
            await deleteShift(id!);
            router.replace("/(manager)/(tabs)/shift");
          } catch (err) {
            Alert.alert("Errore", "Impossibile eliminare il turno.");
          } finally { setDeleting(false); }
        }
      }
    ]);
  };

  const onPickerChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') setPicker({ ...picker, show: false });
    if (selectedDate) setForm({ ...form, [picker.target]: selectedDate });
  };

  const renderDatePicker = () => {
    if (!picker.show) return null;
    return (
      <Modal transparent animationType="fade" visible={picker.show}>
        <Pressable style={styles.modalOverlay} onPress={() => setPicker({ ...picker, show: false })}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <View style={styles.modalHeader}>
              <Pressable onPress={() => setPicker({ ...picker, show: false })}>
                <Text style={{ color: theme.tint, fontWeight: '700', fontSize: 16 }}>Fine</Text>
              </Pressable>
            </View>
            <DateTimePicker
              value={(form as any)[picker.target]}
              mode={picker.mode}
              is24Hour={true}
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={onPickerChange}
              textColor={theme.text}
              style={{ width: '100%', height: 250 }}
            />
          </View>
        </Pressable>
      </Modal>
    );
  };

  if (loading) return (
    <View style={[styles.center, { backgroundColor: theme.background }]}>
      <ActivityIndicator size="small" color={theme.tint} />
    </View>
  );

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1, backgroundColor: theme.background }}>
      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 10, paddingBottom: 120 }]} showsVerticalScrollIndicator={false}>
        
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.text }]}>Modifica Turno</Text>
          <Text style={[styles.subtitle, { color: theme.secondaryText }]}>Aggiorna i dettagli del turno hospitality.</Text>
        </View>

        <View style={styles.imageSection}>
           <ShiftUploader initialUrl={imageUrl} onUpload={(url) => setImageUrl(url)} />
        </View>

        {/* DEPARTMENT */}
        <View style={styles.inputWrapper}>
          <Text style={[styles.label, { color: theme.text }]}>Dipartimento *</Text>
          <View style={styles.deptGrid}>
            {DEPARTMENTS.map((dept) => (
              <Pressable
                key={dept.id}
                onPress={() => setForm({ ...form, department: dept.id, title: "" })}
                style={[
                  styles.deptChip,
                  { backgroundColor: form.department === dept.id ? theme.tint : theme.card, borderColor: theme.border }
                ]}
              >
                <Ionicons name={dept.icon as any} size={18} color={form.department === dept.id ? "#FFF" : theme.secondaryText} />
                <Text style={[styles.deptText, { color: form.department === dept.id ? "#FFF" : theme.text }]}>{dept.label}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* TITLES */}
        {form.department && (
          <View style={styles.inputWrapper}>
            <Text style={[styles.label, { color: theme.text }]}>Ruoli Suggeriti</Text>
            <View style={styles.titleContainer}>
              {TITLES_BY_DEPT[form.department]?.map((title) => (
                <Pressable
                  key={title}
                  onPress={() => setForm({ ...form, title })}
                  style={[
                    styles.titleChip,
                    { backgroundColor: form.title === title ? theme.tint : theme.card, borderColor: theme.border }
                  ]}
                >
                  <Text style={[styles.titleChipText, { color: form.title === title ? "#FFF" : theme.text }]}>{title}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}

        <View style={styles.inputWrapper}>
          <Text style={[styles.label, { color: theme.text }]}>Titolo Posizione *</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.card, color: theme.text, borderColor: theme.border }]}
            value={form.title}
            onChangeText={(text) => setForm({ ...form, title: text })}
            placeholder="es. Cameriere ai piani"
            placeholderTextColor={theme.secondaryText}
          />
        </View>

        <View style={styles.inputWrapper}>
          <Text style={[styles.label, { color: theme.text }]}>Tariffa Oraria (€/hr) *</Text>
          <View style={styles.rateRow}>
            <TextInput
              style={[styles.input, { flex: 1, backgroundColor: theme.card, color: theme.text, borderColor: theme.border }]}
              keyboardType="decimal-pad"
              value={form.hourly_rate}
              onChangeText={(text) => setForm({ ...form, hourly_rate: text })}
            />
            <View style={[styles.earningsBox, { backgroundColor: theme.tint + "10" }]}>
              <Text style={[styles.earningsLabel, { color: theme.tint }]}>TOTALE STIMATO</Text>
              <Text style={[styles.earningsValue, { color: theme.tint }]}>€{estimatedEarnings}</Text>
            </View>
          </View>
        </View>

        <View style={styles.inputWrapper}>
          <Text style={[styles.label, { color: theme.text }]}>Descrizione</Text>
          <TextInput
            style={[styles.input, styles.textArea, { backgroundColor: theme.card, color: theme.text, borderColor: theme.border }]}
            value={form.description}
            onChangeText={(text) => setForm({ ...form, description: text })}
            multiline
            placeholder="Dettagli extra, divisa, ecc."
            placeholderTextColor={theme.secondaryText}
          />
        </View>

        <View style={styles.row}>
          <View style={{ flex: 1.5 }}>
            <Text style={[styles.label, { color: theme.text }]}>Data</Text>
            <Pressable onPress={() => setPicker({ show: true, mode: 'date', target: 'date' })} style={[styles.input, styles.pickerButton, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <Text style={{ color: theme.text }}>{form.date.toLocaleDateString('en-GB')}</Text>
            </Pressable>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.label, { color: theme.text }]}>Inizio</Text>
            <Pressable onPress={() => setPicker({ show: true, mode: 'time', target: 'startTime' })} style={[styles.input, styles.pickerButton, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <Text style={{ color: theme.text, fontWeight: '700' }}>{form.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
            </Pressable>
          </View>
        </View>

        <Pressable
          style={({ pressed }) => [styles.submitButton, { backgroundColor: theme.text, opacity: pressed || saving ? 0.8 : 1 }]}
          onPress={handleUpdate}
          disabled={saving}
        >
          {saving ? <ActivityIndicator color={theme.background} /> : <Text style={[styles.submitText, { color: theme.background }]}>Aggiorna Turno</Text>}
        </Pressable>

        <Pressable onPress={handleDelete} style={styles.deleteButton} disabled={deleting}>
          {deleting ? <ActivityIndicator size="small" color="#FF3B30" /> : (
            <><Ionicons name="trash-outline" size={18} color="#FF3B30" /><Text style={styles.deleteButtonText}>Elimina Turno</Text></>
          )}
        </Pressable>

        {renderDatePicker()}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  scrollContent: { paddingHorizontal: 28 },
  header: { marginBottom: 30 },
  title: { fontSize: 32, fontWeight: "900", letterSpacing: -1 },
  subtitle: { fontSize: 14, fontWeight: "600", opacity: 0.5 },
  inputWrapper: { marginBottom: 25 },
  label: { fontSize: 11, fontWeight: "800", marginBottom: 12, textTransform: 'uppercase', opacity: 0.6 },
  input: { height: 60, paddingHorizontal: 18, borderRadius: 20, fontSize: 16, borderWidth: 1, fontWeight: '600' },
  pickerButton: { justifyContent: 'center' },
  textArea: { height: 120, textAlignVertical: "top", paddingTop: 16 },
  row: { flexDirection: "row", gap: 12, marginBottom: 20 },
  deptGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  deptChip: { flex: 1, minWidth: '45%', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderRadius: 18, borderWidth: 1, gap: 8 },
  deptText: { fontSize: 14, fontWeight: "700" },
  titleContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  titleChip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 14, borderWidth: 1 },
  titleChipText: { fontSize: 13, fontWeight: "600" },
  rateRow: { flexDirection: 'row', gap: 12 },
  earningsBox: { flex: 1, borderRadius: 20, paddingHorizontal: 15, justifyContent: 'center', alignItems: 'center' },
  earningsLabel: { fontSize: 8, fontWeight: "900", marginBottom: 2 },
  earningsValue: { fontSize: 18, fontWeight: "900" },
  submitButton: { height: 64, borderRadius: 24, justifyContent: "center", alignItems: "center", marginTop: 20 },
  submitText: { fontSize: 17, fontWeight: "800" },
  deleteButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 25, padding: 15 },
  deleteButtonText: { color: "#FF3B30", fontWeight: "700", fontSize: 15 },
  imageSection: { marginBottom: 30 },
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' },
  modalContent: { borderTopLeftRadius: 32, borderTopRightRadius: 32, paddingBottom: 40, alignItems: 'center' },
  modalHeader: { width: '100%', height: 60, flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', paddingHorizontal: 25 },
});