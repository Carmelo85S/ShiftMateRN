import React, { useState, useCallback, useMemo, useEffect } from "react";
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
import { createShift, fetchUserProfile } from "@/queries/managerQueries";
import { DEPARTMENTS, TITLES_BY_DEPT } from "@/constants/departments-titles";
import { useShiftForm } from "@/hooks/useShiftForm";

export default function CreateShift() {
  const {form, setForm, picker, setPicker, estimatedEarnings, onPickerChange, openPicker} = useShiftForm()
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];

  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const profile = await fetchUserProfile(user.id);
        if (profile?.department) {
          setForm(prev => ({ ...prev, department: profile.department }));
        }
      }
    };
    loadProfile();
  }, []);

  const handleCreate = async () => {
  if (!form.title || !form.department || !form.hourly_rate) {
    Alert.alert("Missing Info", "Please fill in all required fields.");
    return;
  }
  setLoading(true);
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not found");

    const payload = {
      ...form,
      shift_date: form.date.toISOString().split('T')[0], // YYYY-MM-DD
      start_time: form.startTime.toLocaleTimeString('it-IT', { hour12: false }), // HH:mm:ss
      end_time: form.endTime.toLocaleTimeString('it-IT', { hour12: false }),
    };

    await createShift(user.id, imageUrl, payload as any);
    router.push("/(manager)/(tabs)/shift");
  } catch (err: any) {
    Alert.alert("Error", err.message);
  } finally {
    setLoading(false);
  }
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
          <Text style={[styles.subtitle, { color: theme.secondaryText }]}>Hospitality Focus</Text>
        </View>

        <View style={styles.imageSection}>
           <ShiftUploader initialUrl={imageUrl} onUpload={setImageUrl} />
        </View>

        {/* DEPARTMENT */}
        <View style={styles.inputWrapper}>
          <Text style={[styles.label, { color: theme.text }]}>Department *</Text>
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
            <Text style={[styles.label, { color: theme.text }]}>Suggested Roles</Text>
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
          <Text style={[styles.label, { color: theme.text }]}>Position Title *</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.card, color: theme.text, borderColor: theme.border }]}
            placeholder="e.g. Head Waiter"
            placeholderTextColor={theme.secondaryText}
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
              <Text style={[styles.earningsLabel, { color: theme.tint }]}>EST. TOTAL</Text>
              <Text style={[styles.earningsValue, { color: theme.tint }]}>€{estimatedEarnings}</Text>
            </View>
          </View>
        </View>

        {/* DESCRIZIONE (AGGIUNTO) */}
        <View style={styles.inputWrapper}>
          <Text style={[styles.label, { color: theme.text }]}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea, { backgroundColor: theme.card, color: theme.text, borderColor: theme.border }]}
            placeholder="Specify uniform requirements, specific tasks, etc."
            placeholderTextColor={theme.secondaryText}
            value={form.description}
            onChangeText={(text) => setForm({ ...form, description: text })}
            multiline
            numberOfLines={4}
          />
        </View>

        <View style={styles.row}>
          <View style={{ flex: 1.5 }}>
            <Text style={[styles.label, { color: theme.text }]}>Date</Text>
            <Pressable 
              onPress={() => openPicker('date', 'date')}
              style={[styles.input, styles.pickerButton, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <Text style={{ color: theme.text }}>{form.date.toLocaleDateString('en-GB')}</Text>
            </Pressable>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.label, { color: theme.text }]}>Start</Text>
            <Pressable 
              onPress={() => openPicker('time', 'startTime')}
              style={[styles.input, styles.pickerButton, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <Text style={{ color: theme.text, fontWeight: '700' }}>{form.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
            </Pressable>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.label, { color: theme.text }]}>End</Text>
            <Pressable 
              onPress={() => openPicker('time', 'endTime')}
              style={[styles.input, styles.pickerButton, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <Text style={{ color: theme.text, fontWeight: '700' }}>
                {form.endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
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

        {/* PICKER MODAL */}
        {picker.show && (
          <Modal transparent animationType="fade" visible={picker.show}>
            <Pressable style={styles.modalOverlay} onPress={() => setPicker({ ...picker, show: false })}>
              <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
                <View style={styles.modalHeader}>
                  <Pressable onPress={() => setPicker({ ...picker, show: false })}>
                    <Text style={{ color: theme.tint, fontWeight: '700', fontSize: 16 }}>Done</Text>
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
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scrollContent: { paddingHorizontal: 28 },
  header: { marginBottom: 30 },
  title: { fontSize: 32, fontWeight: "900", letterSpacing: -1 },
  subtitle: { fontSize: 14, fontWeight: "600", opacity: 0.5 },
  inputWrapper: { marginBottom: 25 },
  label: { fontSize: 11, fontWeight: "800", marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1, opacity: 0.6 },
  input: { height: 60, paddingHorizontal: 18, borderRadius: 20, fontSize: 16, borderWidth: 1, fontWeight: '600' },
  textArea: { height: 120, textAlignVertical: 'top', paddingTop: 15 },
  pickerButton: { justifyContent: 'center' },
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
  imageSection: { marginBottom: 30 },
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' },
  modalContent: { borderTopLeftRadius: 32, borderTopRightRadius: 32, paddingBottom: 40, alignItems: 'center' },
  modalHeader: { width: '100%', height: 60, flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', paddingHorizontal: 25 },
});