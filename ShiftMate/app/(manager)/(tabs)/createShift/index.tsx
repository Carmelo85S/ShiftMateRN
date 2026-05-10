import React from "react";
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  useColorScheme,
} from "react-native";
import { Colors } from "@/constants/theme";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ShiftUploader from "@/components/imagePicker/imagePickerShift";
import { useShiftForm } from "@/hooks/manager/useShiftForm";
import { useLoadProfile } from "@/hooks/manager/useLoadProfile";
import { useHandleCreateShift } from "@/hooks/manager/useHandleCreateShift";
import { DepartmentSelector } from "@/components/shared/shift/DepartmentSelector";
import { TitleSuggestions } from "@/components/shared/shift/TitleSuggestion";
import { HourlyRate } from "@/components/shared/shift/HourlyRate";
import { Description } from "@/components/shared/shift/Description";
import { ShiftScheduling } from "@/components/shared/shift/ShiftScheduling";
import { ShiftDatePickerModal } from "@/components/shared/shift/ShiftDatePickerModal";
import { ScreenWrapper } from "@/components/shared/wrapper/layout-wrapper";
import { FormShiftSchema } from "@/src/validation/formShift.schema";

export default function CreateShift() {
  const { form, setForm, picker, setPicker, estimatedEarnings, onPickerChange, openPicker } = useShiftForm();
  const { handleCreate, loading, imageUrl, setImageUrl } = useHandleCreateShift();
  
  const insets = useSafeAreaInsets();
  const theme = Colors[useColorScheme() ?? "light"];

  const onSubmit = async () => {
    const result = FormShiftSchema.safeParse(form);
    if (!result.success) {
      // Handle validation errors
      const error = result.error.issues[0].message; // Get the first error message
      alert(`Error: ${error}`);
      return;
    }

      await handleCreate(result.data);
  };

  useLoadProfile(setForm);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1, backgroundColor: theme.background }}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20} 
    >
      <ScreenWrapper 
        scrollable={true} 
        style={styles.wrapper}
      >
        <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
          <Text style={[styles.title, { color: theme.text }]}>New Shift</Text>
          <Text style={[styles.subtitle, { color: theme.secondaryText }]}>Hospitality Focus</Text>
        </View>

        <View style={styles.imageSection}>
          <ShiftUploader initialUrl={imageUrl} onUpload={setImageUrl} />
        </View>

        {/* DEPARTMENT */}
        <DepartmentSelector 
          selectedId={form.department} 
          onSelect={(id) => setForm({ ...form, department: id, title: "" })} 
          theme={theme} 
        />

        {/* TITLES */}
        <TitleSuggestions 
          department={form.department} 
          titleValue={form.title} 
          onTitleChange={(text) => setForm({ ...form, title: text })} 
          theme={theme} 
        />

        {/* HOURLY RATE */}
        <HourlyRate 
          value={form.hourly_rate}
          onChange={(text) => setForm(prev => ({ ...prev, hourly_rate: text }))}
          estimatedEarnings={estimatedEarnings}
          theme={theme}
        />

        {/* DESCRIPTION */}
        <Description 
          value={form.description}
          onChange={(text) => setForm({ ...form, description: text })}
          theme={theme}
        />

        {/** SHIFT SCHEDULING */}
        <ShiftScheduling 
          openPicker={openPicker}
          form={form}
          theme={theme}
        />

        <Pressable
          style={({ pressed }) => [
            styles.submitButton, 
            { backgroundColor: theme.text, opacity: pressed || loading ? 0.8 : 1 }
          ]}
          onPress={onSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={theme.background} />
          ) : (
            <Text style={[styles.submitText, { color: theme.background }]}>Post Shift</Text>
          )}
        </Pressable>

        {/* PICKER MODAL */}
        <ShiftDatePickerModal 
          picker={picker}
          form={form}
          onClose={() => setPicker({ ...picker, show: false })}
          onChange={onPickerChange}
          theme={theme}
        />
      </ScreenWrapper>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  wrapper: { paddingHorizontal: 28 },
  header: { marginBottom: 30 },
  title: { fontSize: 32, fontWeight: "900", letterSpacing: -1 },
  subtitle: { fontSize: 14, fontWeight: "600", opacity: 0.5 },
  submitButton: { 
    height: 64, 
    borderRadius: 24, 
    justifyContent: "center", 
    alignItems: "center", 
    marginTop: 20,
    marginBottom: 40
  },
  submitText: { fontSize: 17, fontWeight: "800" },
  imageSection: { marginBottom: 30 },
});