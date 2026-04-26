import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export const ProfileHeader = ({ profile, theme }: any) => (
  <View style={styles.headerRow}>
    <View style={{ flex: 1 }}>
      <Text style={[styles.welcomeText, { color: theme.secondaryText }]}>Account</Text>
      <Text style={[styles.nameTitle, { color: theme.text }]}>
        {profile?.name} {profile?.surname}
      </Text>
    </View>
    <View style={[styles.avatarFrame, { backgroundColor: theme.card, borderColor: theme.border }]}>
      {profile?.avatar_url ? (
        <Image source={{ uri: profile.avatar_url }} style={styles.avatar} />
      ) : (
        <Ionicons name="person" size={30} color={theme.tint} />
      )}
    </View>
  </View>
);

const styles = StyleSheet.create({
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 40, marginTop: 10 },
  welcomeText: { fontSize: 14, fontWeight: "600", opacity: 0.5, letterSpacing: 0.5, textTransform: 'uppercase' },
  nameTitle: { fontSize: 32, fontWeight: "900", letterSpacing: -1 },
  avatarFrame: { width: 74, height: 74, borderRadius: 28, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },
  avatar: { width: '100%', height: '100%', borderRadius: 27 },
});