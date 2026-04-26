import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  useColorScheme,
  StatusBar,
  Linking,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import { Colors } from "@/constants/theme";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFetchCandidateProfile } from "@/hooks/manager/useFetchCandidateProfile";
import { useHandleUpdateStatusCandidate } from "@/hooks/manager/useHandleUpdateStatusCandidate";
import { ScreenWrapper } from "@/components/shared/wrapper/layout-wrapper";
import { CandidateActionBar } from "@/components/manager/CandidateActionBar";
import { HeaderCandidateProfile } from "@/components/manager/HeaderCandidateProfile";
import { ShiftInfoContextCard } from "@/components/manager/ShiftInfoContextCard";
import { CandidateInfoSection } from "@/components/manager/CandidateInfoSection";

export default function CandidateProfile() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];
  const insets = useSafeAreaInsets();

  const { 
    profile, loading, applicationStatus, shiftStatus, 
    shiftInfo, setApplicationStatus, setShiftsStatus 
  } = useFetchCandidateProfile();

  const { processing, handleUpdateStatus } = useHandleUpdateStatusCandidate(
    setApplicationStatus, 
    setShiftsStatus
  );

  const makeCall = (phoneNumber: string) => {
    const url = `tel:${phoneNumber}`;
    Linking.canOpenURL(url).then((supported) => {
      if (supported) Linking.openURL(url);
      else Alert.alert("Error", "Calls not supported.");
    });
  };

  if (loading) return (
    <View style={[styles.center, { backgroundColor: theme.background }]}>
      <ActivityIndicator size="small" color={theme.text} />
    </View>
  );

  if (!profile) return (
    <View style={[styles.center, { backgroundColor: theme.background }]}>
      <Text style={{ color: theme.text, opacity: 0.6 }}>Profile not found.</Text>
    </View>
  );

  const fullName = `${profile.name ?? ""} ${profile.surname ?? ""}`.trim() || "Candidate";

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <StatusBar barStyle={colorScheme === "dark" ? "light-content" : "dark-content"} />
      <Stack.Screen 
        options={{ 
          title: fullName, 
          headerStyle: { backgroundColor: theme.background }, 
          headerTintColor: theme.text,
          headerShadowVisible: false 
        }} 
      />

      <ScreenWrapper scrollable={true} style={{ paddingHorizontal: 0 }}>
        <View style={styles.scrollContent}>
          {/* HEADER CANDIDATE AND PROFILO */}
          <HeaderCandidateProfile profile={profile} theme={theme} />

          {/* SHIFT CONTEXT CARD */}
          {shiftInfo && (
            <ShiftInfoContextCard shiftInfo={shiftInfo} theme={theme} />
          )}

          <View style={styles.infoContainer}>
            <CandidateInfoSection 
              label="EXPERIENCE" 
              value={profile.experience} 
              isHighlight 
              theme={theme} 
            />

            <CandidateInfoSection 
              label="ABOUT" 
              value={profile.bio} 
              theme={theme} 
            />

            {profile.phone && (
              <CandidateInfoSection 
                label="PHONE"
                value={profile.phone}
                icon="call"
                onPress={() => makeCall(profile.phone!)}
                theme={theme}
              />
            )}
          </View>
        </View>
      </ScreenWrapper>

      {/*ACTION BAR */}
      <CandidateActionBar 
        applicationStatus={applicationStatus}
        shiftStatus={shiftStatus}
        processing={processing}
        onUpdateStatus={handleUpdateStatus}
        theme={theme}
        insets={insets}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  scrollContent: { padding: 20, paddingBottom: 150 },
  profileHeader: { alignItems: "center", marginBottom: 25 },
  avatarWrapper: { width: 120, height: 120, borderRadius: 60, overflow: 'hidden', marginBottom: 15 },
  avatar: { width: '100%', height: '100%' },
  deptBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 8, marginBottom: 8 },
  deptText: { fontSize: 10, fontWeight: "900", letterSpacing: 1 },
  jobRole: { fontSize: 22, fontWeight: "700" },
  shiftContextCard: { flexDirection: 'row', padding: 16, borderRadius: 20, marginBottom: 25, alignItems: 'center', gap: 15, borderWidth: 1, borderColor: 'rgba(0,0,0,0.03)' },
  shiftIconContainer: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  shiftLabel: { fontSize: 9, fontWeight: "900", letterSpacing: 0.5, marginBottom: 2 },
  shiftTitle: { fontSize: 15, fontWeight: "800" },
  shiftDate: { fontSize: 13, fontWeight: "600", marginTop: 2 },
  infoContainer: { gap: 16 },
  sectionCard: { padding: 20, borderRadius: 20 },
  sectionLabel: { fontSize: 10, fontWeight: "800", marginBottom: 8, opacity: 0.4 },
  experienceText: { fontSize: 16, fontWeight: "700", lineHeight: 22 },
  sectionText: { fontSize: 15, lineHeight: 22, opacity: 0.8 },
  contactCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  contactText: { fontSize: 17, fontWeight: "700" },
  actionBar: { 
    position: 'absolute', 
    bottom: 0, 
    left: 0, 
    right: 0, 
    paddingHorizontal: 20, 
    paddingTop: 15, 
    borderTopWidth: 1, 
    borderTopColor: 'rgba(0,0,0,0.05)',
    zIndex: 10
  },
  actionRow: { flexDirection: 'row', gap: 12 },
  button: { flex: 1, height: 60, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  buttonPrimary: { elevation: 2 },
  buttonSecondary: { borderWidth: 1.5 },
  buttonTextPrimary: { fontWeight: "800", fontSize: 16 },
  buttonTextSecondary: { fontWeight: "800", fontSize: 16 },
  statusBanner: { height: 60, borderRadius: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, width: '100%' },
  statusBannerText: { fontSize: 16, fontWeight: '800' },
});