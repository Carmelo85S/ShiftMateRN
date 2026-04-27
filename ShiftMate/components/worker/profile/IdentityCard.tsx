import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface IdentityCardProps {
  profile: {
    avatar_url?: string;
    name?: string;
    surname?: string;
    job_role?: string;
    bio?: string; // Aggiunto alla tipizzazione
  } | null;
  theme: {
    card: string;
    border: string;
    background: string;
    text: string;
  };
}

export const IdentityCard = ({ profile, theme }: IdentityCardProps) => {
  return (
    <View style={[styles.identityCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
      <View style={styles.avatarRow}>
        {/* Avatar Section */}
        <View style={[styles.avatarCircle, { backgroundColor: theme.background, borderColor: theme.border }]}>
          {profile?.avatar_url ? (
            <Image
              key={profile.avatar_url}
              source={{ uri: profile.avatar_url }}
              style={styles.avatarImage}
              resizeMode="cover"
            />
          ) : (
            <Ionicons name="person-sharp" size={40} color={theme.text} />
          )}
        </View>

        {/* Name & Role Section */}
        <View style={styles.nameSection}>
          <Text style={[styles.nameText, { color: theme.text }]} numberOfLines={1}>
            {profile?.name} {profile?.surname}
          </Text>
          <View style={[styles.roleBadge, { backgroundColor: theme.text }]}>
            <Text style={[styles.roleText, { color: theme.background }]}>
              {profile?.job_role?.toUpperCase() || "GENERAL WORKER"}
            </Text>
          </View>
        </View>
      </View>

      {/* Bio Section - Integrata correttamente */}
      {profile?.bio && (
        <View style={[styles.bioSection, { borderTopColor: theme.border }]}>
          <Text style={[styles.bioLabel, { color: theme.text + "60" }]}>
            BIO / EXPERIENCE
          </Text>
          <Text style={[styles.bioText, { color: theme.text }]}>
            {profile.bio}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  identityCard: {
    padding: 24,
    borderRadius: 28,
    borderWidth: 1,
    marginBottom: 40,
    shadowColor: "#000",
    shadowOpacity: 0.02,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  avatarRow: { 
    flexDirection: "row", 
    alignItems: "center", 
    gap: 20 
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 30,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  avatarImage: { width: "100%", height: "100%" },
  nameSection: { flex: 1, gap: 6 },
  nameText: { fontSize: 24, fontWeight: "800", letterSpacing: -0.5 },
  roleBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  roleText: { fontSize: 10, fontWeight: "900", letterSpacing: 0.5 },
  
  // Stili Bio aggiunti
  bioSection: { 
    marginTop: 20, 
    paddingTop: 20, 
    borderTopWidth: 1 
  },
  bioLabel: { 
    fontSize: 10, 
    fontWeight: "800", 
    marginBottom: 8, 
    letterSpacing: 1 
  },
  bioText: { 
    fontSize: 15, 
    lineHeight: 22, 
    fontWeight: "500" 
  },
});