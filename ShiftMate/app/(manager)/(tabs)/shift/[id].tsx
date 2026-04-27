import React from "react";
import { View, Text, ActivityIndicator, RefreshControl, useColorScheme, StyleSheet } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { Colors } from "@/constants/theme";
import { ScreenWrapper } from "@/components/shared/wrapper/layout-wrapper";
import { useShiftDetail } from "@/hooks/manager/useShiftDetail";
import { ShiftHero } from "@/components/manager/shift/ShiftHero";
import { ShiftInfo } from "@/components/manager/shift/ShiftInfo";
import { CandidatesCard } from "@/components/manager/candidate/CandidatesCard";

export default function ShiftDetailPage() {
  const { id } = useLocalSearchParams();
  const theme = Colors[useColorScheme() ?? "light"];
  
  const { shift, applications, loading, refreshing, onRefresh } = useShiftDetail(id);

  if (loading && !refreshing) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: theme.background }}>
        <ActivityIndicator size="small" color={theme.text} />
      </View>
    );
  }

  return (
    <ScreenWrapper 
      scrollable={true} 
      onRefresh={onRefresh}
      refreshing={refreshing}
    >
      <View style={{ flex: 1 }}>
        <ShiftHero shift={shift} theme={theme} />
        <View style={styles.mainContent}>
          <ShiftInfo shift={shift} theme={theme} />
          <CandidatesCard shiftId={shift?.id} applications={applications} theme={theme} />
        </View>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  mainContent: { flex: 1, borderTopLeftRadius: 32, borderTopRightRadius: 32, marginTop: -30, paddingHorizontal: 24, paddingTop: 50 },
  section: { marginBottom: 32 },
  sectionTitle: { fontSize: 20, fontWeight: '800', marginBottom: 12 },
  description: { fontSize: 15, lineHeight: 24, opacity: 0.8 },
});