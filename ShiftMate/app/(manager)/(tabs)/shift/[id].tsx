import React, { useState } from "react";
import { View, Text, ActivityIndicator, StyleSheet, useColorScheme, Pressable, Alert } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { Colors } from "@/constants/theme";
import { ScreenWrapper } from "@/components/shared/wrapper/layout-wrapper";
import { useShiftDetail } from "@/hooks/manager/useShiftDetail";
import { ShiftHero } from "@/components/manager/shift/ShiftHero";
import { ShiftInfo } from "@/components/manager/shift/ShiftInfo";
import { CandidatesCard } from "@/components/manager/candidate/CandidatesCard";
import { useDashboardData } from "@/hooks/manager/useFetchDataDashboard";
import { Ionicons } from "@expo/vector-icons";

export default function ShiftDetailPage() {
  const { id } = useLocalSearchParams();
  const theme = Colors[useColorScheme() ?? "light"];
  
  const { businessType } = useDashboardData();
  const { shift, applications, loading, refreshing, onRefresh, completeShift, user } = useShiftDetail(id);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if ((loading || !user) && !refreshing) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="small" color={theme.text} />
      </View>
    );
  }

  const isManager = user?.role?.toLowerCase() === "manager";
  const isOwner = shift?.manager_id === user?.id;
  const currentStatus = shift?.status?.toLowerCase();

  const acceptedWorkersCount = applications?.filter(app => app.status?.toLowerCase() === "accepted").length || 0;
  const requiredWorkersCount = Number(shift?.required_workers) || 1;

  const isValidStatus = ["open", "assigned", "filled"].includes(currentStatus);
  const hasAcceptedWorker = acceptedWorkersCount > 0;
  const showCompleteButton = isManager && isOwner && isValidStatus && hasAcceptedWorker;

  const calculateOvertime = (endTime: string, minutesToAdd: number): string => {
    const [hours, minutes, seconds] = endTime.split(":").map(Number);
    
    const date = new Date();
    date.setHours(hours);
    date.setMinutes(minutes + minutesToAdd);
    date.setSeconds(seconds || 0);

    const newHour = String(date.getHours()).padStart(2, "0");
    const newMinute = String(date.getMinutes()).padStart(2, "0");
    const newSecond = String(date.getSeconds()).padStart(2, "0");

    return `${newHour}:${newMinute}:${newSecond}`;
  };

  const handleCompletePress = () => {
    if (!shift?.end_time) return;

    Alert.alert(
      "Close Shift",
      `The scheduled end time was ${shift.end_time.substring(0, 5)}. Did the staff finish on time or complete overtime?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "On Time (Standard)",
          onPress: () => processCompletion(shift.end_time)
        },
        {
          text: "+15 Minutes",
          onPress: () => processCompletion(calculateOvertime(shift.end_time, 15))
        },
        {
          text: "+30 Minutes",
          onPress: () => processCompletion(calculateOvertime(shift.end_time, 30))
        },
        {
          text: "+1 Hour",
          onPress: () => processCompletion(calculateOvertime(shift.end_time, 60))
        }
      ]
    );
  };

  const processCompletion = async (endTimeToSave: string) => {
    setIsSubmitting(true);
    try {
      await completeShift(endTimeToSave);
      Alert.alert("Success", "Shift completed! The financial overview has been updated.");
    } catch (err: any) {
      Alert.alert("Error", err.message || "Could not complete the shift.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScreenWrapper 
        scrollable={true} 
        onRefresh={onRefresh}
        refreshing={refreshing}
        // Azzeriamo l'extra padding visto che il bottone ora scorre con la pagina
        extraPaddingBottom={0}
      >
        <View style={{ flex: 1 }}>
          <ShiftHero shift={shift} theme={theme} />
          
          <View style={[styles.mainContent, { backgroundColor: theme.background }]}>
            
            {/* BADGE ROW */}
            <View style={styles.badgeRow}>
              <View style={[styles.typeBadge, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <Ionicons 
                  name={businessType === "staffing" ? "briefcase-outline" : "restaurant-outline"} 
                  size={14} 
                  color={theme.text} 
                />
                <Text style={[styles.typeBadgeText, { color: theme.text }]}>
                  {businessType === "staffing" ? "Staffing Request" : "Hospitality Shift"}
                </Text>
              </View>

              {businessType === "staffing" && (
                <View style={[styles.typeBadge, { backgroundColor: theme.card, borderColor: theme.border }]}>
                  <Ionicons name="people-outline" size={14} color={theme.text} />
                  <Text style={[styles.typeBadgeText, { color: theme.text }]}>
                    Staff: {acceptedWorkersCount} / {requiredWorkersCount}
                  </Text>
                </View>
              )}
            </View>

            {/* INFO EXTRA GEOLOCALIZZAZIONE */}
            {businessType === "staffing" && (shift?.client_name || shift?.address) && (
              <View style={[styles.staffingInfoCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <Text style={[styles.staffingSectionTitle, { color: theme.secondaryText }]}>
                  ASSIGNED CLIENT & LOCATION
                </Text>
                
                {shift?.client_name && (
                  <View style={styles.infoDetailRow}>
                    <Ionicons name="business" size={18} color={theme.text} style={styles.infoIcon} />
                    <Text style={[styles.infoDetailText, { color: theme.text, fontWeight: "700" }]}>
                      {shift.client_name}
                    </Text>
                  </View>
                )}

                {shift?.address && (
                  <View style={styles.infoDetailRow}>
                    <Ionicons name="location" size={18} color={theme.text} style={styles.infoIcon} />
                    <Text style={[styles.infoDetailText, { color: theme.text }]}>
                      {shift.address}{shift?.city ? `, ${shift.city}` : ""}
                    </Text>
                  </View>
                )}
              </View>
            )}

            <ShiftInfo shift={shift} theme={theme} />
            <CandidatesCard shiftId={shift?.id} applications={applications} theme={theme} />
            
            {/* 🌟 SPOSTATO QUI DENTRO: Ora scorre fluidamente sotto i candidati senza sovrapporsi */}
            {showCompleteButton && (
              <View style={styles.actionContainer}>
                <Pressable 
                  style={({ pressed }) => [
                    styles.btnComplete, 
                    { backgroundColor: theme.text }, 
                    pressed && { opacity: 0.8 }
                  ]}
                  onPress={handleCompletePress}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <ActivityIndicator color={theme.background} />
                  ) : (
                    <Text style={[styles.btnText, { color: theme.background }]}>Mark as Completed</Text>
                  )}
                </Pressable>
              </View>
            )}
            
          </View>
        </View>
      </ScreenWrapper>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1,
  },
  center: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center" 
  },
  mainContent: { 
    flex: 1, 
    borderTopLeftRadius: 32, 
    borderTopRightRadius: 32, 
    marginTop: -30, 
    paddingHorizontal: 24, 
    paddingTop: 40, 
    paddingBottom: 30 
  },
  badgeRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 20
  },
  typeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1
  },
  typeBadgeText: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.3
  },
  staffingInfoCard: {
    padding: 16,
    borderRadius: 24,
    borderWidth: 1,
    marginBottom: 20,
    gap: 10
  },
  staffingSectionTitle: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.6
  },
  infoDetailRow: {
    flexDirection: "row",
    alignItems: "center"
  },
  infoIcon: {
    marginRight: 10,
    opacity: 0.7
  },
  infoDetailText: {
    fontSize: 14,
    fontWeight: "500",
    flex: 1
  },
  actionContainer: { 
    // 🌟 Eliminati position absolute, insets, bordi ed elevation! Ora è un blocco nativo.
    marginTop: 32, 
    marginBottom: 20,
    width: "100%",
  },
  btnComplete: { 
    height: 56, 
    borderRadius: 16, 
    justifyContent: "center", 
    alignItems: "center",
  },
  btnText: { 
    fontWeight: "800", 
    fontSize: 16 
  },
});