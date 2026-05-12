import React from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface EmptyShiftsProps {
  loading: boolean;
  activeTab: 'all' | 'mine' | 'applications';
  theme: {
    tint: string;
    [key: string]: any;
  };
}

export const EmptyShifts = ({ loading, activeTab, theme }: EmptyShiftsProps) => {
  if (loading) {
    return (
      <ActivityIndicator 
        size="large" 
        color={theme.tint} 
        style={styles.loader} 
      />
    );
  }

  return (
    <View style={styles.emptyBox}>
      <View style={styles.emptyIconCircle}>
        <Ionicons name="calendar-clear-outline" size={32} color="#94A3B8" />
      </View>
      <Text style={styles.emptyTitle}>No shifts found</Text>
      <Text style={styles.emptySubtitle}>
        {activeTab === 'mine' 
          ? "There are no extra shifts currently posted for your specific hotel." 
          : "The global marketplace is currently empty. Check back later!"}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  loader: {marginTop: 50 },
  emptyBox: { marginTop: 60, alignItems: 'center', paddingHorizontal: 40 },
  emptyIconCircle: {width: 70,height: 70,borderRadius: 35,backgroundColor: '#F8FAFC',justifyContent: 'center',alignItems: 'center',marginBottom: 16,borderWidth: 1,borderColor: '#E2E8F0'},
  emptyTitle: { fontSize: 18, fontWeight: '800', color: '#1E293B' },
  emptySubtitle: { fontSize: 14, color: '#64748B', textAlign: 'center', marginTop: 8,lineHeight: 20 }
});