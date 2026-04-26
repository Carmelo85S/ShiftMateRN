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
  Modal,
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

export default function CreateShift() {
  const {form, setForm, picker, setPicker, estimatedEarnings, onPickerChange, openPicker} = useShiftForm()
  const { handleCreate, loading, imageUrl, setImageUrl } = useHandleCreateShift();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];

  useLoadProfile(setForm);

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

        {/*HOURLY RATE */}
        <HourlyRate 
          value={form.hourly_rate}
          onChange={(text) => setForm({ ...form, hourly_rate: text })}
          estimatedEarnings={estimatedEarnings}
          theme={theme}
        />

        {/* DESCRIPTION */}
        <Description 
          value={form.description}
          onChange={(text) => setForm({ ...form, description: text })}
          theme={theme}
        />

        {/**SHIFT SCHEDULING */}
        <ShiftScheduling 
          openPicker={openPicker}
          form={form}
          theme={theme}
        />

        <Pressable
          style={({ pressed }) => [styles.submitButton, { backgroundColor: theme.text, opacity: pressed || loading ? 0.8 : 1 }]}
          onPress={() => handleCreate(form)}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color={theme.background} /> : <Text style={[styles.submitText, { color: theme.background }]}>Post Shift</Text>}
        </Pressable>

        {/* PICKER MODAL */}
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
  scrollContent: { paddingHorizontal: 28 },
  header: { marginBottom: 30 },
  title: { fontSize: 32, fontWeight: "900", letterSpacing: -1 },
  subtitle: { fontSize: 14, fontWeight: "600", opacity: 0.5 },
  submitButton: { height: 64, borderRadius: 24, justifyContent: "center", alignItems: "center", marginTop: 20 },
  submitText: { fontSize: 17, fontWeight: "800" },
  imageSection: { marginBottom: 30 },
});