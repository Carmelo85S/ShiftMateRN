import React, { useState, useCallback } from "react";
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
    department: "" as 'bar' | 'kitchen' | 'restaurant' | 'housekeeping' | 'reception' | 'maintenance' | '',
    date: new Date(),
    startTime: new Date(),
    endTime: new Date(new Date().setHours(new Date().getHours() + 8)),
  });

  const [picker, setPicker] = useState({
    show: false,
    mode: 'date' as 'date' | 'time',
    target: '' as 'date' | 'startTime' | 'endTime'
  });

  useFocusEffect(
    useCallback(() => {
      return () => setPicker(p => ({ ...p, show: false }));
    }, [])
  );

  const selectDepartment = () => {
    const deps = ['bar', 'kitchen', 'restaurant', 'housekeeping', 'reception', 'maintenance'];
    Alert.alert("Select Department", "Which department needs help?", [
      ...deps.map(d => ({ 
        text: d.toUpperCase(), 
        onPress: () => setForm({...form, department: d as any}) 
      })),
      { text: "Cancel", style: "cancel" }
    ]);
  };

  const handleCreate = async () => {
    if (!form.title || !form.department) {
      Alert.alert("Missing Info", "Please provide a job title and a department.");
      return;
    }

    setLoading(true);
    try {
      // 1. Ottieni l'utente corrente
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      // 2. Recupera l'hotel_id dal profilo del manager
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("hotel_id")
        .eq("id", user.id)
        .single();

      if (profileError || !profile?.hotel_id) {
        throw new Error("Your profile is not linked to an hotel. Contact admin.");
      }

      // 3. Inserisci il turno collegato all'hotel del manager
      const { error: shiftError } = await supabase.from("shifts").insert([
        {
          title: form.title,
          description: form.description,
          department: form.department,
          hotel_id: profile.hotel_id, // Link automatico all'hotel
          shift_date: form.date.toISOString().split("T")[0],
          start_time: form.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
          end_time: form.endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
          image_url: imageUrl,
          status: "open",
          created_by: user.id,
          manager_id: user.id,
        },
      ]);

      if (shiftError) throw shiftError;

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
    if (Platform.OS === 'android') {
      setPicker({ ...picker, show: false });
      if (selectedDate) setForm({ ...form, [picker.target]: selectedDate });
    } else {
      if (selectedDate) setForm({ ...form, [picker.target]: selectedDate });
    }
  };

  const showPickerMode = (mode: 'date' | 'time', target: 'date' | 'startTime' | 'endTime') => {
    setPicker({ show: true, mode, target });
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
          <Text style={[styles.subtitle, { color: theme.text }]}>Fill the info to post an emergency call.</Text>
        </View>

        <View style={styles.imageSection}>
           <ShiftUploader initialUrl={imageUrl} onUpload={(url) => setImageUrl(url)} />
        </View>

        <View style={styles.inputWrapper}>
          <Text style={[styles.label, { color: theme.text }]}>Department *</Text>
          <Pressable 
            onPress={selectDepartment}
            style={[styles.input, { backgroundColor: theme.card, borderColor: theme.text + "10", justifyContent: 'center' }]}
          >
            <Text style={{ color: form.department ? theme.text : theme.text + "40", fontSize: 16 }}>
              {form.department ? form.department.toUpperCase() : "Select Department"}
            </Text>
          </Pressable>
        </View>

        <View style={styles.inputWrapper}>
          <Text style={[styles.label, { color: theme.text }]}>Job Title *</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.card, color: theme.text, borderColor: theme.text + "10" }]}
            placeholder="e.g. Waiter"
            placeholderTextColor={theme.text + "40"}
            value={form.title}
            onChangeText={(text) => setForm({ ...form, title: text })}
          />
        </View>

        <View style={styles.inputWrapper}>
          <Text style={[styles.label, { color: theme.text }]}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea, { backgroundColor: theme.card, color: theme.text, borderColor: theme.text + "10" }]}
            placeholder="Task description..."
            placeholderTextColor={theme.text + "40"}
            value={form.description}
            onChangeText={(text) => setForm({ ...form, description: text })}
            multiline
          />
        </View>

        <View style={styles.inputWrapper}>
          <Text style={[styles.label, { color: theme.text }]}>Date *</Text>
          <Pressable 
            onPress={() => showPickerMode('date', 'date')}
            style={[styles.input, { backgroundColor: theme.card, borderColor: theme.text + "10", justifyContent: 'center' }]}
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
              onPress={() => showPickerMode('time', 'startTime')}
              style={[styles.input, { backgroundColor: theme.card, borderColor: theme.text + "10", justifyContent: 'center' }]}
            >
              <Text style={{ color: theme.text }}>
                {form.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </Pressable>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.label, { color: theme.text }]}>End *</Text>
            <Pressable 
              onPress={() => showPickerMode('time', 'endTime')}
              style={[styles.input, { backgroundColor: theme.card, borderColor: theme.text + "10", justifyContent: 'center' }]}
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
  title: { fontSize: 28, fontWeight: "700" },
  subtitle: { fontSize: 15, opacity: 0.5 },
  inputWrapper: { marginBottom: 20 },
  label: { fontSize: 13, fontWeight: "600", marginBottom: 8, opacity: 0.7 },
  input: {
    height: 56,
    paddingHorizontal: 16,
    borderRadius: 16,
    fontSize: 16,
    borderWidth: 1,
    backgroundColor: 'rgba(0,0,0,0.02)',
    borderColor: 'rgba(0,0,0,0.05)',
  },
  textArea: { height: 100, textAlignVertical: "top", paddingTop: 16 },
  row: { flexDirection: "row", gap: 12, marginBottom: 20 },
  submitButton: {
    marginTop: 10,
    height: 56,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  submitText: { fontSize: 16, fontWeight: "600" },
  imageSection: { marginBottom: 25 },
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' },
  modalContent: { height: 380, borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingBottom: 30 },
  modalHeader: { height: 50, flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', paddingHorizontal: 20, borderBottomWidth: 0.5, borderBottomColor: '#ccc' },
});