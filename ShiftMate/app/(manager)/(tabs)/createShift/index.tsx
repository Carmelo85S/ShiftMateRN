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
import DateTimePicker from "@react-native-community/datetimepicker";
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