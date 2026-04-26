import { View, Text, StyleSheet, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface HeaderProps {
  profile: any;
  theme: any;
}

export const HeaderCandidateProfile = ({ profile, theme }: HeaderProps) => {
  if (!profile) return null;

  return (
    <View style={styles.profileHeader}>
      <View style={styles.avatarWrapper}>
        {profile.avatar_url ? (
          <Image source={{ uri: profile.avatar_url }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, { backgroundColor: theme.card, justifyContent: 'center', alignItems: 'center' }]}>
            <Ionicons name="person" size={50} color={theme.text} style={{ opacity: 0.1 }} />
          </View>
        )}
      </View>
      <View style={[styles.deptBadge, { backgroundColor: theme.tint + "15" }]}>
        <Text style={[styles.deptText, { color: theme.tint }]}>
          {profile.department?.toUpperCase() || "STAFF"}
        </Text>
      </View>
      <Text style={[styles.jobRole, { color: theme.text }]}>
        {profile.job_role || "Staff Member"}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  profileHeader: { alignItems: "center", marginBottom: 25 },
  avatarWrapper: { width: 120, height: 120, borderRadius: 60, overflow: 'hidden', marginBottom: 15 },
  avatar: { width: '100%', height: '100%' },
  deptBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 8, marginBottom: 8 },
  deptText: { fontSize: 10, fontWeight: "900", letterSpacing: 1 },
  jobRole: { fontSize: 22, fontWeight: "700" },
});