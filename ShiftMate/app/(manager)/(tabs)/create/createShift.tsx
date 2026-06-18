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
import { router } from "expo-router";
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

  const { handleCreate, loading, imageUrl, setImageUrl } =
    useHandleCreateShift();

  const { businessType, stats } = useDashboardData();

  const { userId, businessId, userRole } = useAuth();

  const { hasSubscription, onboardingCompleted } = useCheckActivation(
    businessId ?? undefined,
    userRole ?? undefined,
    userId ?? undefined,
  );

  const [clientName, setClientName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [workerCount, setWorkerCount] = useState(1);

  const insets = useSafeAreaInsets();
  const theme = Colors[useColorScheme() ?? "light"];

  const incrementWorkers = () => setWorkerCount((p) => p + 1);
  const decrementWorkers = () => setWorkerCount((p) => (p > 1 ? p - 1 : 1));

  const onSubmit = async () => {
    // 1. Stripe onboarding check
    if (!onboardingCompleted) {
      Alert.alert("Action Required", "Complete Stripe onboarding first.");
      router.push("/(manager)/stripe-onboarding");
      return;
    }

    // 2. Access check (subscription OR credits)
    const hasAccess =
      hasSubscription || (stats?.total_available_credits ?? 0) > 0;

    if (!hasAccess) {
      Alert.alert("No Access", "Purchase a plan or credits to continue.");
      router.push("/subscription");
      return;
    }

    // 3. Build payload (CLEAN MODEL)
    const payload = {
      ...form,

      department_id: businessType === "staffing" ? null : form.department, // UUID reale

      business_type: businessType,

      required_workers: businessType === "staffing" ? workerCount : 1,

      address: businessType === "staffing" ? address : null,
      city: businessType === "staffing" ? city : null,
      client_name: businessType === "staffing" ? clientName : null,
    };

    // 4. validation
    const result = FormShiftSchema.safeParse(payload);

    if (!result.success) {
      Alert.alert("Error", result.error.issues[0].message);
      return;
    }

    // 5. create shift
    await handleCreate(result.data);
  };

  useLoadProfile(setForm);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1, backgroundColor: theme.background }}
    >
      <ScreenWrapper scrollable style={styles.wrapper}>
        <View style={[styles.header, { paddingTop: insets.top }]}>
          <Text style={[styles.title, { color: theme.text }]}>New Shift</Text>
          <Text style={[styles.subtitle, { color: theme.secondaryText }]}>
            {businessType === "staffing"
              ? "Request workers for clients"
              : "Create shift"}
          </Text>
        </View>

        <ShiftUploader initialUrl={imageUrl} onUpload={setImageUrl} />

        {businessType === "standard" && (
          <DepartmentSelector
            selectedId={form.department}
            onSelect={(id: string) =>
              setForm({ ...form, department: id, title: "" })
            }
            theme={theme}
          />
        )}

        <TitleSuggestions
          department={
            businessType === "staffing" ? "staffing" : form.department
          }
          titleValue={form.title}
          onTitleChange={(t) => setForm({ ...form, title: t })}
          theme={theme}
        />

        {/* STAFFING MODE */}
        {businessType === "staffing" && (
          <View style={styles.staffingContainer}>
            <View style={styles.counter}>
              <Text style={styles.label}>Workers Needed</Text>

              <View style={styles.row}>
                <Pressable style={styles.counterBtn} onPress={decrementWorkers}>
                  <Ionicons name="remove" size={20} color={theme.text} />
                </Pressable>

                <Text style={[styles.counterValue, { color: theme.text }]}>
                  {workerCount}
                </Text>

                <Pressable style={styles.counterBtn} onPress={incrementWorkers}>
                  <Ionicons name="add" size={20} color={theme.text} />
                </Pressable>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>CLIENT / VENUE</Text>

              <TextInput
                style={[styles.input, { color: theme.text }]}
                placeholder="Grand Hotel Stockholm"
                placeholderTextColor={theme.secondaryText}
                value={clientName}
                onChangeText={setClientName}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>WORKPLACE ADDRESS</Text>

              <TextInput
                style={[styles.input, { color: theme.text }]}
                placeholder="Vasagatan 12"
                placeholderTextColor={theme.secondaryText}
                value={address}
                onChangeText={setAddress}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>CITY</Text>

              <TextInput
                style={[styles.input, { color: theme.text }]}
                placeholder="Stockholm"
                placeholderTextColor={theme.secondaryText}
                value={city}
                onChangeText={setCity}
              />
            </View>
          </View>
        )}

        <HourlyRate
          value={form.hourly_rate}
          onChange={(t) => setForm((p) => ({ ...p, hourly_rate: t }))}
          estimatedEarnings={estimatedEarnings}
          theme={theme}
        />

        <Description
          value={form.description}
          onChange={(t) => setForm((p) => ({ ...p, description: t }))}
          theme={theme}
        />

        <ShiftScheduling openPicker={openPicker} form={form} theme={theme} />

        <Pressable
          style={[
            styles.button,
            {
              opacity: loading ? 0.8 : 1,
            },
          ]}
          onPress={onSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text
              style={{
                color: "#FFF",
                fontSize: 16,
                fontWeight: "800",
              }}
            >
              Post Shift
            </Text>
          )}
        </Pressable>

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
  wrapper: {
    paddingHorizontal: 28,
  },

  header: {
    marginBottom: 36,
  },

  title: {
    fontSize: 36,
    fontWeight: "900",
    letterSpacing: -1,
  },

  subtitle: {
    fontSize: 15,
    fontWeight: "600",
    opacity: 0.55,
    marginTop: 4,
  },

  staffingContainer: {
    gap: 16,
    marginTop: 12,
    marginBottom: 12,
  },

  counter: {
    backgroundColor: "#F5F6F7",
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: "#EAEAEA",
  },

  label: {
    fontSize: 15,
    fontWeight: "800",
    marginBottom: 12,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  counterBtn: {
    width: 42,
    height: 42,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#E5E5E5",
  },

  counterValue: {
    fontSize: 22,
    fontWeight: "900",
    minWidth: 40,
    textAlign: "center",
  },

  inputGroup: {
    backgroundColor: "#F5F6F7",
    borderRadius: 22,
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: "#ECECEC",
  },

  inputLabel: {
    fontSize: 11,
    fontWeight: "700",
    opacity: 0.55,
    marginBottom: 6,
    letterSpacing: 0.4,
  },

  input: {
    fontSize: 15,
    fontWeight: "600",
    paddingVertical: 4,
  },

  button: {
    height: 64,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 28,
    marginBottom: 40,
    backgroundColor: "#000",

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 6,
  },
});
