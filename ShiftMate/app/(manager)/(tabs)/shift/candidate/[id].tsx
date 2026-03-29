import {
  View,
  Text,
  StyleSheet,
  Image,
  ActivityIndicator,
  ScrollView,
  Pressable,
  Alert,
} from "react-native";
import { useLocalSearchParams, Stack, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Colors } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";

type Profile = {
  id: string;
  name: string | null;
  surname: string | null;
  avatar_url: string | null;
  bio: string | null;
  experience: string | null;
  phone: string | null;
  job_role: string | null;
};

export default function CandidateProfile() {
  const { id, shiftId } = useLocalSearchParams();
  const router = useRouter();
  const theme = Colors.light;  

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", id)
          .single();

        if (error) throw error;
        setProfile(data);
      } catch (err) {
        console.error("Error fetching profile:", err);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchProfile();
  }, [id]);

  // Funzione per aggiornare lo stato della candidatura
  const handleUpdateStatus = async (status: "accepted" | "rejected") => {
    setProcessing(true);
    try {
      const { error } = await supabase
        .from("applications")
        .update({ status: status })
        .eq("shift_id", shiftId)
        .eq("profile_id", id);

      if (error) throw error;

      Alert.alert(
        status === "accepted" ? "Candidato Accettato" : "Candidato Rifiutato",
        `La candidatura è stata aggiornata con successo.`,
        [
          { 
            text: "OK", 
            onPress: () => router.navigate(`/(manager)/(tabs)/shift/${shiftId}`) 
          }
        ]
      );
    } catch (err) {
      console.error("Error updating status:", err);
      Alert.alert("Errore", "Impossibile aggiornare lo stato della candidatura.");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.tint} />
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <Text style={{ color: theme.text }}>Profile not found</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen 
        options={{ 
          title: "Candidate Profile",
          headerBackTitle: "", 
          headerLeft: () => (
            <Pressable 
              onPress={() => {
                if (shiftId) {
                  router.navigate(`/(manager)/(tabs)/shift/${shiftId}`);
                } else {
                  router.back();
                }
              }}
              style={{ paddingRight: 20, paddingVertical: 5, marginLeft: -5 }}
            >
              <Ionicons name="chevron-back" size={28} color={theme.tint} /> 
            </Pressable>
          )
        }} 
      />

      <ScrollView
        style={[styles.container, { backgroundColor: theme.background }]}
        contentContainerStyle={{ padding: 20 }}
      >
        {/* Avatar */}
        <View style={styles.avatarContainer}>
          {profile.avatar_url ? (
            <Image source={{ uri: profile.avatar_url }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <Text style={styles.avatarInitial}>
                {profile.name?.[0] || "?"}
              </Text>
            </View>
          )}
        </View>

        {/* Name */}
        <Text style={[styles.name, { color: theme.text }]}>
          {profile.name} {profile.surname}
        </Text>

        {/* Job Role */}
        {profile.job_role && (
          <Text style={[styles.role, { color: theme.text }]}>
            {profile.job_role}
          </Text>
        )}

        {/* Info Cards */}
        <View style={{ marginTop: 24 }}>
          {profile.bio && (
            <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <Text style={[styles.cardTitle, { color: theme.text }]}>About</Text>
              <Text style={[styles.cardText, { color: theme.text }]}>{profile.bio}</Text>
            </View>
          )}

          {profile.experience && (
            <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <Text style={[styles.cardTitle, { color: theme.text }]}>Experience</Text>
              <Text style={[styles.cardText, { color: theme.text }]}>{profile.experience}</Text>
            </View>
          )}

          {profile.phone && (
            <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <Text style={[styles.cardTitle, { color: theme.text }]}>Contact</Text>
              <Text style={[styles.cardText, { color: theme.text }]}>{profile.phone}</Text>
            </View>
          )}
        </View>

        {/* Actions */}
        <View style={{ marginTop: 32, marginBottom: 40 }}>
          {processing ? (
            <ActivityIndicator color={theme.tint} />
          ) : (
            <>
              <Pressable
                style={[styles.primaryBtn, { backgroundColor: "#4CAF50" }]}
                onPress={() => handleUpdateStatus("accepted")}
              >
                <Ionicons name="checkmark" size={18} color="#fff" />
                <Text style={styles.btnText}>Accept Candidate</Text>
              </Pressable>

              <Pressable
                style={[styles.primaryBtn, { backgroundColor: "#F44336", marginTop: 12 }]}
                onPress={() => handleUpdateStatus("rejected")}
              >
                <Ionicons name="close" size={18} color="#fff" />
                <Text style={styles.btnText}>Reject Candidate</Text>
              </Pressable>
            </>
          )}
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  avatarContainer: { alignItems: "center", marginBottom: 16 },
  avatar: { width: 110, height: 110, borderRadius: 55 },
  avatarPlaceholder: { backgroundColor: "#E1E1E1", justifyContent: "center", alignItems: "center" },
  avatarInitial: { fontSize: 36, fontWeight: "700", color: "#666" },
  name: { fontSize: 24, fontWeight: "800", textAlign: "center" },
  role: { fontSize: 14, opacity: 0.6, textAlign: "center", marginTop: 4 },
  card: { borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1 },
  cardTitle: { fontWeight: "700", marginBottom: 6 },
  cardText: { lineHeight: 20, opacity: 0.8 },
  primaryBtn: { flexDirection: "row", justifyContent: "center", alignItems: "center", padding: 14, borderRadius: 12, gap: 8 },
  btnText: { color: "#fff", fontWeight: "700" },
});