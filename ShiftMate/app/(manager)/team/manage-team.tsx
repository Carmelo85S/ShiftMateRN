import { Colors } from "@/constants/theme";
import { useAuth } from "@/hooks/auth/useAuth";
import { getInviteCode } from "@/queries/ownerQueries";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, Text, View } from "react-native";

export default function ManageTeam() {
  const { businessId } = useAuth();
  const [code, setCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const theme = Colors.light;

  useEffect(() => {
    const fetchCode = async () => {
      if (!businessId) return;
      try {
        const data = await getInviteCode(businessId);
        setCode(data?.invite_code || "N/A");
      } catch (err) {
        Alert.alert("Error", "Unable to retrieve invitation code.");
      } finally {
        setLoading(false);
      }
    };

    fetchCode();
  }, [businessId]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Team Access</Text>
      <Text style={styles.description}>
        Share this code with your team to invite them to your business.
      </Text>

      <View style={styles.codeCard}>
        <Text style={styles.label}>Invite Code</Text>
        <Text style={styles.code}>{code}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: "#fff" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 24, fontWeight: "800", marginBottom: 8 },
  description: { fontSize: 16, color: "#666", marginBottom: 24 },
  codeCard: {
    padding: 24,
    backgroundColor: "#F8F9FA",
    borderRadius: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E9ECEF",
  },
  label: { fontSize: 12, fontWeight: "700", color: "#888", marginBottom: 8 },
  code: { fontSize: 32, fontWeight: "800", letterSpacing: 2, color: "#000" },
});
