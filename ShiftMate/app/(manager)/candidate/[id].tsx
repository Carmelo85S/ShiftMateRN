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
  infoContainer: { gap: 16 },
  });