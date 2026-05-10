import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  useColorScheme,
} from "react-native";
import { Colors } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ShiftUploader from "@/components/imagePicker/imagePickerShift";
import { TitleSuggestions } from "@/components/shared/shift/TitleSuggestion";
import { DepartmentSelector } from "@/components/shared/shift/DepartmentSelector";
import { HourlyRate } from "@/components/shared/shift/HourlyRate";
import { Description } from "@/components/shared/shift/Description";
import { ShiftScheduling } from "@/components/shared/shift/ShiftScheduling";
import { useShiftForm } from "@/hooks/manager/useShiftForm";
import { ShiftDatePickerModal } from "@/components/shared/shift/ShiftDatePickerModal";
import { useFetchShift } from "@/hooks/manager/useFetchShift";
import { useEditShiftActions } from "@/hooks/manager/useEditShiftAction";

export default function EditShift() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];

  const { form, setForm, picker, setPicker, estimatedEarnings, onPickerChange, openPicker } = useShiftForm();
  const { loading, imageUrl, setImageUrl } = useFetchShift(id, setForm);
  const { saving, deleting, handleUpdate, handleDelete } = useEditShiftActions({id, form, imageUrl});

  if (loading) return (
    <View style={[styles.center, { backgroundColor: theme.background }]}>
      <ActivityIndicator size="small" color={theme.tint} />
    </View>
  );

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1, backgroundColor: theme.background }}>
      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 10, paddingBottom: 120 }]} showsVerticalScrollIndicator={false}>
        
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.text }]}>Edit Shift</Text>
          <Text style={[styles.subtitle, { color: theme.secondaryText }]}>Update your hospitality shift details.</Text>
        </View>

        <View style={styles.imageSection}>
           <ShiftUploader initialUrl={imageUrl} onUpload={(url) => setImageUrl(url)} />
        </View>

        <DepartmentSelector 
          selectedId={form.department} 
          onSelect={(id) => setForm({ ...form, department: id, title: "" })} 
          theme={theme} 
        />
        
        <TitleSuggestions 
          department={form.department} 
          titleValue={form.title} 
          onTitleChange={(text) => setForm({ ...form, title: text })} 
          theme={theme} 
        />

        <HourlyRate 
          value={form.hourly_rate}
          onChange={(text) => setForm({ ...form, hourly_rate: text })}
          estimatedEarnings={estimatedEarnings}
          theme={theme}
        />

        <Description 
          value={form.description}
          onChange={(text) => setForm({ ...form, description: text })}
          theme={theme}
        />

        <ShiftScheduling 
          openPicker={openPicker}
          form={form}
          theme={theme}
        />

        <Pressable
          style={({ pressed }) => [styles.submitButton, { backgroundColor: theme.text, opacity: pressed || saving ? 0.8 : 1 }]}
          onPress={handleUpdate}
          disabled={saving}
        >
          {saving ? <ActivityIndicator color={theme.background} /> : <Text style={[styles.submitText, { color: theme.background }]}>Update Shift</Text>}
        </Pressable>

        <Pressable onPress={handleDelete} style={styles.deleteButton} disabled={deleting}>
          {deleting ? <ActivityIndicator size="small" color="#FF3B30" /> : (
            <><Ionicons name="trash-outline" size={18} color="#FF3B30" /><Text style={styles.deleteButtonText}>Delete Shift</Text></>
          )}
        </Pressable>

        {/** DATE/TIME PICKER MODAL */}
        <ShiftDatePickerModal 
          picker={picker}
          form={form}
          onClose={() => setPicker({ ...picker, show: false })}
          onChange={onPickerChange}
          theme={theme}
        />
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
  imageSection: { marginBottom: 30 },
  submitButton: { height: 64, borderRadius: 24, justifyContent: "center", alignItems: "center", marginTop: 20 },
  submitText: { fontSize: 17, fontWeight: "800" },
  deleteButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 25, padding: 15 },
  deleteButtonText: { color: "#FF3B30", fontWeight: "700", fontSize: 15 },
});