import ShiftUploader from "@/components/imagePicker/imagePickerShift";
import { DepartmentSelector } from "@/components/shared/shift/DepartmentSelector";
import { Description } from "@/components/shared/shift/Description";
import { HourlyRate } from "@/components/shared/shift/HourlyRate";
import { ShiftDatePickerModal } from "@/components/shared/shift/ShiftDatePickerModal";
import { ShiftScheduling } from "@/components/shared/shift/ShiftScheduling";
import { TitleSuggestions } from "@/components/shared/shift/TitleSuggestion";
import { ScreenWrapper } from "@/components/shared/wrapper/layout-wrapper";
import { Colors } from "@/constants/theme";
import { useAuth } from "@/hooks/auth/useAuth";
import { useDashboardData } from "@/hooks/manager/useFetchDataDashboard";
import { useHandleCreateShift } from "@/hooks/manager/useHandleCreateShift";
import { useLoadProfile } from "@/hooks/manager/useLoadProfile";
import { useShiftForm } from "@/hooks/manager/useShiftForm";
import { useCheckActivation } from "@/hooks/stripe/onboarding/useCheckActivation";
import { FormShiftSchema } from "@/src/validation/formShift.schema";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  useColorScheme,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function CreateShift() {
  const {
    form,
    setForm,
    picker,
    setPicker,
    estimatedEarnings,
    onPickerChange,
    openPicker,
  } = useShiftForm();
  const { userRole } = useLocalSearchParams<{
    userRole: "owner" | "manager";
  }>();

  const { handleCreate, loading, imageUrl, setImageUrl } =
    useHandleCreateShift();
  const { businessType, stats } = useDashboardData();

  const { user, businessId } = useAuth();
  console.log("Stato Auth User:", user?.id);
  const {
    hasSubscription,
    onboardingCompleted,
    loading: checkLoading,
  } = useCheckActivation(businessId ?? undefined);

  // 🌟 Stati locali per agenzie di staffing
  const [clientName, setClientName] = useState<string>("");
  const [address, setAddress] = useState<string>("");
  const [city, setCity] = useState<string>("");
  const [workerCount, setWorkerCount] = useState<number>(1);

  const insets = useSafeAreaInsets();
  const theme = Colors[useColorScheme() ?? "light"];

  const incrementWorkers = () => setWorkerCount((prev) => prev + 1);
  const decrementWorkers = () =>
    setWorkerCount((prev) => (prev > 1 ? prev - 1 : 1));

  const onSubmit = async () => {
    if (!onboardingCompleted) {
      Alert.alert(
        "Action Required",
        "Complete your Stripe onboarding to start posting shifts and receiving payouts.",
      );
      router.push("/(manager)/stripe-onboarding");
      return;
    }

    // 2. Hybrid Access Check: Subscription OR Credits
    const hasActiveAccess =
      hasSubscription || (stats?.total_available_credits ?? 0) > 0;
    if (!hasActiveAccess) {
      Alert.alert(
        "No Access",
        "You need an active plan or available credits to post shifts. Please purchase a package.",
      );
      router.push("/subscription");
      return;
    }

    // Se è tutto ok, procediamo con la validazione e creazione dello shift
    const formToValidate = {
      ...form,
      required_workers: businessType === "staffing" ? workerCount : 1,
      department:
        businessType === "staffing"
          ? "staffing_agency_global"
          : form.department,
      address: businessType === "staffing" ? address : "",
      city: businessType === "staffing" ? city : "",
      client_name: businessType === "staffing" ? clientName : "",
    };

    const result = FormShiftSchema.safeParse(formToValidate);
    if (!result.success) {
      const error = result.error.issues[0].message;
      Alert.alert("Error", error);
      return;
    }

    // Se passa entrambi, crea lo shift
    await handleCreate(result.data);
  };

  useLoadProfile(setForm);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1, backgroundColor: theme.background }}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
      <ScreenWrapper scrollable={true} style={styles.wrapper}>
        <View style={[styles.header, { paddingTop: insets.top }]}>
          <Text style={[styles.title, { color: theme.text }]}>New Shift</Text>
          <Text style={[styles.subtitle, { color: theme.secondaryText }]}>
            {businessType === "staffing"
              ? "Request personnel for your clients"
              : "Create new shift"}
          </Text>
        </View>

        <View style={styles.imageSection}>
          <ShiftUploader initialUrl={imageUrl} onUpload={setImageUrl} />
        </View>

        {/* DEPARTMENT SELECTOR */}
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

        {/* UI SPECIFICA PER AGENZIE DI STAFFING */}
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
                <Text
                  style={[
                    styles.counterSubtitle,
                    { color: theme.secondaryText },
                  ]}
                >
                  How many people do you need?
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

              {/* Campo Nome Cliente 🌟 */}
              <View
                style={[
                  styles.inputGroup,
                  { backgroundColor: theme.card, borderColor: theme.border },
                ]}
              >
                <Text
                  style={[styles.inputLabel, { color: theme.secondaryText }]}
                >
                  CLIENT / VENUE NAME
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
                  WORKPLACE ADDRESS
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
                  CITY
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

        {/* HOURLY RATE */}
        <HourlyRate
          value={form.hourly_rate}
          onChange={(text) =>
            setForm((prev) => ({ ...prev, hourly_rate: text }))
          }
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
        <ShiftScheduling openPicker={openPicker} form={form} theme={theme} />

        <Pressable
          style={({ pressed }) => [
            styles.submitButton,
            {
              backgroundColor: theme.text,
              opacity: pressed || loading ? 0.8 : 1,
            },
          ]}
          onPress={onSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={theme.background} />
          ) : (
            <Text style={[styles.submitText, { color: theme.background }]}>
              Post Shift
            </Text>
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
    marginBottom: 40,
  },
  submitText: { fontSize: 17, fontWeight: "800" },
  imageSection: { marginBottom: 30 },

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
