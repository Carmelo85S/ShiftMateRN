import ShiftUploader from "@/components/imagePicker/imagePickerShift";
import { DepartmentSelector } from "@/components/shared/shift/DepartmentSelector";
import { Description } from "@/components/shared/shift/Description";
import { HourlyRate } from "@/components/shared/shift/HourlyRate";
import { ShiftDatePickerModal } from "@/components/shared/shift/ShiftDatePickerModal";
import { ShiftScheduling } from "@/components/shared/shift/ShiftScheduling";
import { TitleSuggestions } from "@/components/shared/shift/TitleSuggestion";
import { Colors } from "@/constants/theme";
import { useEditShiftActions } from "@/hooks/manager/useEditShiftAction";
import { useDashboardData } from "@/hooks/manager/useFetchDataDashboard"; // 🌟 Importato per rilevare il business
import { useFetchShift } from "@/hooks/manager/useFetchShift";
import { useShiftForm } from "@/hooks/manager/useShiftForm";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useColorScheme,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function EditShift() {
  console.log("DEBUG: EditShift in fase di render...");

  const { id } = useLocalSearchParams<{ id: string }>();
  console.log("DEBUG: ID ricevuto:", id);

  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];

  const { businessType } = useDashboardData();
  const {
    form,
    setForm,
    picker,
    setPicker,
    estimatedEarnings,
    onPickerChange,
    openPicker,
  } = useShiftForm();

  // Recuperiamo i dati del turno (passando setForm per popolarlo)
  const { loading, imageUrl, setImageUrl, shiftData } = useFetchShift(
    id,
    setForm,
  );

  // 🌟 Stati locali per agenzie di staffing
  const [clientName, setClientName] = useState<string>();
  const [address, setAddress] = useState<string>("");
  const [city, setCity] = useState<string>("");
  const [workerCount, setWorkerCount] = useState<number>(1);

  // 🌟 Sincronizza gli stati locali quando i dati del turno vengono caricati dal DB
  useEffect(() => {
    if (shiftData) {
      // Il form standard è già gestito da useFetchShift

      // Inizializza gli stati locali solo una volta
      setClientName(shiftData.client_name ?? "");
      setAddress(shiftData.address ?? "");
      setCity(shiftData.city ?? "");
      setWorkerCount(Number(shiftData.required_workers) || 1);
    }
  }, [shiftData]);

  // Intercettiamo l'update per iniettare i campi staffing
  const { saving, deleting, handleUpdate, handleDelete } = useEditShiftActions({
    id,
    imageUrl,
  });

  const incrementWorkers = () => setWorkerCount((prev) => prev + 1);
  const decrementWorkers = () =>
    setWorkerCount((prev) => (prev > 1 ? prev - 1 : 1));

  const onUpdateSubmit = () => {
    const formToUpdate: any = {
      ...form,
      required_workers: businessType === "staffing" ? workerCount : 1,
      department_id: businessType === "staffing" ? null : form.department,

      // 🌟 TRUCCO: Se il valore è vuoto, usa il valore originale (shiftData)
      address:
        businessType === "staffing"
          ? address || shiftData?.address || null
          : null,
      city:
        businessType === "staffing" ? city || shiftData?.city || null : null,
      client_name:
        businessType === "staffing"
          ? clientName || shiftData?.client_name || null
          : null,

      // Assicurati che anche la descrizione non venga piallata
      description: form.description || shiftData?.description || "",
    };

    handleUpdate(formToUpdate as any);
  };

  if (loading)
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="small" color={theme.tint} />
      </View>
    );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1, backgroundColor: theme.background }}
    >
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 10, paddingBottom: 120 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.text }]}>Edit Shift</Text>
          <Text style={[styles.subtitle, { color: theme.secondaryText }]}>
            {businessType === "staffing"
              ? "Update personnel request details."
              : "Update your hospitality shift details."}
          </Text>
        </View>

        <View style={styles.imageSection}>
          <ShiftUploader
            initialUrl={imageUrl}
            onUpload={(url) => setImageUrl(url)}
          />
        </View>

        {/* DEPARTMENT SELECTOR (Solo se standard) */}
        {businessType === "standard" && (
          <DepartmentSelector
            selectedId={form.department}
            onSelect={(id: string) =>
              setForm({ ...form, department: id, title: "" })
            }
            theme={theme}
          />
        )}

        {/* TITLES */}
        <TitleSuggestions
          department={
            businessType === "staffing" ? "staffing" : form.department
          }
          titleValue={form.title}
          onTitleChange={(text) => setForm({ ...form, title: text })}
          theme={theme}
        />

        {/* UI SPECIFICA PER AGENZIE DI STAFFING (EDIT MODE) 🌟 */}
        {businessType === "staffing" && (
          <View style={styles.staffingContainer}>
            {/* COUNTER LAVORATORI */}
            <View
              style={[
                styles.workerCounterContainer,
                { backgroundColor: theme.card, borderColor: theme.border },
              ]}
            >
              <View>
                <Text style={[styles.counterLabel, { color: theme.text }]}>
                  Workers Needed
                </Text>
              </View>
              <View style={styles.counterRow}>
                <Pressable
                  style={[
                    styles.counterBtn,
                    { backgroundColor: theme.background },
                  ]}
                  onPress={decrementWorkers}
                >
                  <Ionicons name="remove" size={20} color={theme.text} />
                </Pressable>
                <Text style={[styles.counterValue, { color: theme.text }]}>
                  {workerCount}
                </Text>
                <Pressable
                  style={[
                    styles.counterBtn,
                    { backgroundColor: theme.background },
                  ]}
                  onPress={incrementWorkers}
                >
                  <Ionicons name="add" size={20} color={theme.text} />
                </Pressable>
              </View>
            </View>

            {/* CAMPI DI LOCALIZZAZIONE E DETTAGLI CLIENTE */}
            <View style={styles.staffingFieldsBlock}>
              <Text style={[styles.fieldBlockTitle, { color: theme.text }]}>
                Location & Client Details
              </Text>

              {/* Campo Nome Cliente */}
              <View
                style={[
                  styles.inputGroup,
                  { backgroundColor: theme.card, borderColor: theme.border },
                ]}
              >
                <Text
                  style={[styles.inputLabel, { color: theme.secondaryText }]}
                >
                  {shiftData?.client_name ?? "CLIENT / VENUE NAME"}
                </Text>
                <TextInput
                  style={[styles.textInput, { color: theme.text }]}
                  placeholder="e.g. Grand Hotel Executive"
                  placeholderTextColor={theme.secondaryText + "80"}
                  value={clientName}
                  onChangeText={setClientName}
                />
              </View>

              {/* Campo Indirizzo */}
              <View
                style={[
                  styles.inputGroup,
                  { backgroundColor: theme.card, borderColor: theme.border },
                ]}
              >
                <Text
                  style={[styles.inputLabel, { color: theme.secondaryText }]}
                >
                  {shiftData?.address ?? "ADDRESS"}
                </Text>
                <TextInput
                  style={[styles.textInput, { color: theme.text }]}
                  placeholder="e.g. Vasagatan 12"
                  placeholderTextColor={theme.secondaryText + "80"}
                  value={address}
                  onChangeText={setAddress}
                />
              </View>

              {/* Campo Città */}
              <View
                style={[
                  styles.inputGroup,
                  { backgroundColor: theme.card, borderColor: theme.border },
                ]}
              >
                <Text
                  style={[styles.inputLabel, { color: theme.secondaryText }]}
                >
                  {shiftData?.city ?? "CITY"}
                </Text>
                <TextInput
                  style={[styles.textInput, { color: theme.text }]}
                  placeholder="e.g. Stockholm"
                  placeholderTextColor={theme.secondaryText + "80"}
                  value={city}
                  onChangeText={setCity}
                />
              </View>
            </View>
          </View>
        )}

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

        <ShiftScheduling openPicker={openPicker} form={form} theme={theme} />

        <Pressable
          style={({ pressed }) => [
            styles.submitButton,
            {
              backgroundColor: theme.text,
              opacity: pressed || saving ? 0.8 : 1,
            },
          ]}
          onPress={onUpdateSubmit}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color={theme.background} />
          ) : (
            <Text style={[styles.submitText, { color: theme.background }]}>
              Update Shift
            </Text>
          )}
        </Pressable>

        <Pressable
          onPress={handleDelete}
          style={styles.deleteButton}
          disabled={deleting}
        >
          {deleting ? (
            <ActivityIndicator size="small" color="#FF3B30" />
          ) : (
            <>
              <Ionicons name="trash-outline" size={18} color="#FF3B30" />
              <Text style={styles.deleteButtonText}>Delete Shift</Text>
            </>
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
  submitButton: {
    height: 64,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  submitText: { fontSize: 17, fontWeight: "800" },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 25,
    padding: 15,
  },
  deleteButtonText: { color: "#FF3B30", fontWeight: "700", fontSize: 15 },

  // Stili Staffing duplicati correttamente da CreateShift
  staffingContainer: { marginBottom: 24 },
  workerCounterContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 20,
  },
  counterLabel: { fontSize: 15, fontWeight: "700" },
  counterSubtitle: {
    fontSize: 12,
    fontWeight: "500",
    opacity: 0.6,
    marginTop: 2,
  },
  counterRow: { flexDirection: "row", alignItems: "center", gap: 16 },
  counterBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  counterValue: {
    fontSize: 16,
    fontWeight: "800",
    minWidth: 20,
    textAlign: "center",
  },
  staffingFieldsBlock: { gap: 12 },
  fieldBlockTitle: {
    fontSize: 13,
    fontWeight: "800",
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    opacity: 0.7,
  },
  inputGroup: { padding: 14, borderRadius: 20, borderWidth: 1 },
  inputLabel: {
    fontSize: 8,
    fontWeight: "700",
    marginBottom: 4,
    letterSpacing: 0.5,
    opacity: 0.6,
  },
  textInput: { fontSize: 14, fontWeight: "600", padding: 0 },
});
