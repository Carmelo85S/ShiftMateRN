import React from "react";
import { View, Text, Image, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export const ShiftHero = ({ shift, theme }: any) => {
  const router = useRouter();
  
  return (
    <View style={styles.heroContainer}>
      {shift?.image_url ? (
        <Image source={{ uri: shift.image_url }} style={styles.heroImage} />
      ) : (
        <View style={[styles.heroImage, { backgroundColor: theme.tint + "20" }]} />
      )}
      <View style={styles.heroGradientOverlay} />
      
      <View style={styles.heroContent}>
        <View style={[styles.statusBadge, { backgroundColor: shift?.status === 'open' ? theme.tint : '#4CAF50' }]}>
            <Text style={styles.statusBadgeText}>{shift?.status?.toUpperCase()}</Text>
        </View>
        <Text style={styles.heroTitle}>{shift?.title}</Text>
        <View style={styles.locationRow}>
            <Ionicons name="location" size={14} color="rgba(255,255,255,0.8)" />
            <Text style={styles.locationText}>{shift?.businesses?.name || "Main Structure"}</Text>
        </View>
      </View>
      <View style={{ position: 'absolute', right: 24, bottom: 24 }}>
      <Pressable 
        onPress={() => router.push({ pathname: "/(manager)/(tabs)/shift/editShift", params: { id: shift?.id } })}
        style={[styles.editFab, { backgroundColor: theme.text }]}
      >
        <Ionicons name="options-outline" size={24} color={theme.background} />
      </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  heroContainer: { height: 400, width: '100%' },
  heroImage: { width: '100%', height: '100%' },
  heroGradientOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.35)' },
  heroContent: { position: 'absolute', left: 24, bottom: 60, right: 24 },
  heroTitle: { color: '#FFF', fontSize: 32, fontWeight: '800', letterSpacing: -0.5, marginBottom: 8 },
  statusBadge: { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, marginBottom: 12 },
  statusBadgeText: { color: '#FFF', fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  locationText: { color: 'rgba(255,255,255,0.8)', fontSize: 13, fontWeight: '500' },
  editFab: { position: 'absolute', right: 24, bottom: -30, width: 60, height: 60, borderRadius: 20, justifyContent: "center", alignItems: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 5 },
});