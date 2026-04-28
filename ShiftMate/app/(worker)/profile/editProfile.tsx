import React from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Colors } from "@/constants/theme";
import AvatarUploader from "@/components/imagePicker/imagePicker";
import { useEditProfile } from "@/hooks/worker/profile/useEditProfile";
import { ScreenHeader } from "@/components/shared/Header";
import { DepartmentPicker } from "@/components/worker/profile/EditDepartmentPicker";
import { BioInput } from "@/components/worker/profile/EditBioInput";
import { SaveButton } from "@/components/worker/profile/EditSaveButton";
import { EditCustomInput } from "@/components/worker/profile/EditCustomInput";

export default function EditProfileScreen() {
  const theme = Colors.light;
  const { form, setForm, loading, saving, handleSave, selectDepartment } = useEditProfile();

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.tint} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <ScrollView 
        style={{ backgroundColor: theme.background }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* HEADER */}
        <ScreenHeader 
          kpi="My Identity" 
          title="Edit Profile" 
          theme={theme} 
        />

        {/* AVATAR UPLOADER */}
        <View style={styles.uploaderWrapper}>
          <AvatarUploader
            initialUrl={form.avatar_url}
            onUpload={(url) => setForm({ ...form, avatar_url: `${url}?t=${Date.now()}` })}
          />
          <Text style={[styles.uploaderHint, { color: theme.secondaryText }]}>
            Tap to change photo
          </Text>
        </View>

        {/* FORM FIELDS */}
        <View style={styles.form}>
          <EditCustomInput 
            label="FIRST NAME" 
            value={form.name} 
            onChange={(v: string) => setForm({ ...form, name: v })} 
            theme={theme} 
          />
          
          <EditCustomInput 
            label="LAST NAME" 
            value={form.surname} 
            onChange={(v: string) => setForm({ ...form, surname: v })} 
            theme={theme} 
          />
          
          <EditCustomInput 
            label="PHONE" 
            value={form.phone} 
            onChange={(v: string) => setForm({ ...form, phone: v })} 
            placeholder="+46..." 
            keyboardType="phone-pad"
            theme={theme} 
          />
          
          {/* DEPARTMENT SELECTOR */}
         <DepartmentPicker 
            value={form.department}
            onSelect={selectDepartment}
            setFormValue={(dept) => setForm({ ...form, department: dept })}
            theme={theme}
          />

          <EditCustomInput 
            label="JOB ROLE" 
            value={form.job_role} 
            onChange={(v: string) => setForm({ ...form, job_role: v })} 
            placeholder="e.g. Sous Chef" 
            theme={theme} 
          />

          <EditCustomInput 
            label="EXPERIENCE" 
            value={form.experience} 
            onChange={(v: string) => setForm({ ...form, experience: v })} 
            placeholder="e.g. 5 years in fine dining" 
            theme={theme} 
          />
          
          {/* BIO TEXTAREA */}
          <BioInput 
            value={form.bio}
            onChange={(v) => setForm({ ...form, bio: v })}
            theme={theme}
          />
        </View>

        {/* FOOTER / SAVE BUTTON */}
        <SaveButton onPress={handleSave} saving={saving} theme={theme} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scrollContent: { paddingTop: 100, paddingHorizontal: 25, paddingBottom: 60 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  uploaderWrapper: { alignItems: 'center', marginBottom: 30 },
  uploaderHint: { fontSize: 12, fontWeight: "600", marginTop: 10, opacity: 0.6 },
  form: { gap: 20 },
  inputWrapper: { gap: 8 },
  label: { fontSize: 10, fontWeight: "800", letterSpacing: 1.5 },
  input: {height: 56,borderWidth: 1,borderRadius: 16,paddingHorizontal: 16,fontSize: 16,fontWeight: "600",},
});