import React, { useState } from "react";
import { View, Text, ActivityIndicator, StyleSheet, useColorScheme, Pressable, Alert } from "react-native";
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

  // 🌟 MODIFICATO: Lo shift può essere completato solo se è attivo/assegnato ('assigned').
  // Se è 'filled' (appena riempito) o 'open' (senza lavoratori), o già 'completed', il pulsante sparisce.
  const isValidStatus = currentStatus === "assigned";
  const hasAcceptedWorker = applications?.some(app => app.status?.toLowerCase() === "accepted");

  const showCompleteButton = isManager && isOwner && isValidStatus && hasAcceptedWorker;

  /**
   * Dynamically adds minutes to a "HH:MM:SS" time string safely
   */
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
      `The scheduled end time was ${shift.end_time.substring(0, 5)}. Did the worker finish on time or complete overtime?`,
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
        },
        {
          text: "+2 Hour",
          onPress: () => processCompletion(calculateOvertime(shift.end_time, 120))
        }
      ]
    );
  };

  const processCompletion = async (endTimeToSave: string) => {
    setIsSubmitting(true);
    try {
      await completeShift(endTimeToSave);
      Alert.alert("Success", "Shift completed! The effective budget has been updated on your Dashboard.");
    } catch (err: any) {
      Alert.alert("Error", err.message || "Could not complete the shift.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={{ flex: 1 }}>
        <ScreenWrapper 
          scrollable={true} 
          onRefresh={onRefresh}
          refreshing={refreshing}
        >
          <View style={{ flex: 1 }}>
            <ShiftHero shift={shift} theme={theme} />
            <View style={[styles.mainContent, { backgroundColor: theme.background }]}>
              <ShiftInfo shift={shift} theme={theme} />
              <CandidatesCard shiftId={shift?.id} applications={applications} theme={theme} />
            </View>
          </View>
        </ScreenWrapper>

        {/* 🌟 SPOSTATO QUI: Il pulsante ora è fuori dallo scroll ed è ancorato rigidamente in basso */}
        {showCompleteButton && (
          <View style={[styles.actionContainer, { backgroundColor: theme.background, borderTopColor: theme.border }]}>
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
    paddingTop: 50, 
    paddingBottom: 30 
  },
  actionContainer: { 
    paddingHorizontal: 24, 
    paddingTop: 16, 
    paddingBottom: 36, 
    borderTopWidth: 1,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  btnComplete: { 
    height: 58, 
    borderRadius: 16, 
    justifyContent: "center", 
    alignItems: "center",
  },
  btnText: { 
    fontWeight: "800", 
    fontSize: 16 
  },
});