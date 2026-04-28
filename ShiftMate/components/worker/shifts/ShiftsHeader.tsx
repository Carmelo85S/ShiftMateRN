import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Router } from "expo-router";

interface ShiftsHeaderProps {
  isGuest: boolean;
  theme: {
    text: string;
    tint: string;
    [key: string]: any;
  };
  router: Router;
  totalAvailable: number;
}

export const ShiftsHeader = ({ 
  isGuest, 
  theme, 
  router, 
  totalAvailable 
}: ShiftsHeaderProps) => (
  <View style={styles.header}>
    <View style={styles.headerTop}>
      <View style={{ flex: 1 }}>
        <Text style={styles.businessBadge}>
          {isGuest ? "OPEN MARKETPLACE" : "WORKER DASHBOARD"}
        </Text>
        <Text style={styles.mainTitle} numberOfLines={1}>
          {isGuest ? "Opportunities" : "Job Board"}
        </Text>
      </View>
      <Pressable 
        style={styles.profileBtn} 
        onPress={() => isGuest ? router.push("/") : router.push("/(worker)/(tabs)/profile")}
      >
        <Ionicons 
          name={isGuest ? "log-in-outline" : "person-circle-outline"} 
          size={36} 
          color={theme.text} 
        />
      </Pressable>
    </View>
    
    <View style={[styles.infoBox, { backgroundColor: theme.tint + "08" }]}>
       <Ionicons name="flash" size={18} color={theme.tint} />
       <Text style={[styles.infoText, { color: theme.text }]}>
         {totalAvailable} {totalAvailable === 1 ? 'shift available' : 'shifts available'}
       </Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  header: { marginBottom: 28 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',marginBottom: 20 },
  businessBadge: { fontSize: 11, fontWeight: "800", color: '#94A3B8', letterSpacing: 1.5,marginBottom: 4 },
  mainTitle: { fontSize: 34, fontWeight: "900", color: '#0F172A', letterSpacing: -1.5 },
  profileBtn: { backgroundColor: '#FFF',borderRadius: 50,},
  infoBox: {flexDirection: 'row',borderRadius: 16,padding: 16,alignItems: 'center',gap: 10},
  infoText: {fontSize: 14,fontWeight: '700'},
});