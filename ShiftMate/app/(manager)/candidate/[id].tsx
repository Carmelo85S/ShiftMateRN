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

const handleUpdateStatus = async (status: "accepted" | "rejected") => {
  if (!shiftId || !id) {
    Alert.alert("Errore", "Dati del turno o del candidato mancanti.");
    return;
  }

  setProcessing(true);
  try {
    const { error } = await supabase
      .from("applications")
      .update({ status: status })
      .eq("shift_id", shiftId)
      .eq("profile_id", id);  

    if (error) throw error;

    Alert.alert(
      status === "accepted" ? "Accepted" : "Rejected",
      "Stato aggiornato con successo.",
      [{ text: "OK", onPress: () => router.back() }]
    );
  } catch (err) {
    console.error("Update Error:", err);
    Alert.alert("Errore", "Non ho trovato la candidatura da aggiornare.");
  } finally {
    setProcessing(false);
  }
};

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={theme.tint} /></View>;
  if (!profile) return <View style={styles.center}><Text>Profilo non trovato</Text></View>;

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <Stack.Screen options={{ title: `${profile.name} ${profile.surname}`, headerBackTitle: "Indietro" }} />
      
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        <View style={styles.avatarContainer}>
          {profile.avatar_url ? (
            <Image source={{ uri: profile.avatar_url }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, { backgroundColor: '#EEE', justifyContent: 'center', alignItems: 'center' }]}>
              <Ionicons name="person" size={50} color="#CCC" />
            </View>
          )}
        </View>

        <Text style={[styles.name, { color: theme.text }]}>{profile.name} {profile.surname}</Text>
        <Text style={styles.role}>{profile.job_role || "Candidato"}</Text>

        <View style={styles.section}>
          <Text style={[styles.label, { color: theme.text }]}>Bio</Text>
          <Text style={[styles.text, { color: theme.text }]}>{profile.bio || "Nessuna bio fornita."}</Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.label, { color: theme.text }]}>Esperienza</Text>
          <Text style={[styles.text, { color: theme.text }]}>{profile.experience || "Non specificata."}</Text>
        </View>

        <View style={styles.actionContainer}>
          {processing ? (
            <ActivityIndicator color={theme.tint} />
          ) : (
            <>
              <Pressable 
                style={[styles.button, { backgroundColor: '#4CAF50' }]} 
                onPress={() => handleUpdateStatus('accepted')}
              >
                <Text style={styles.buttonText}>Accetta</Text>
              </Pressable>
              <Pressable 
                style={[styles.button, { backgroundColor: '#F44336' }]} 
                onPress={() => handleUpdateStatus('rejected')}
              >
                <Text style={styles.buttonText}>Rifiuta</Text>
              </Pressable>
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  avatarContainer: { alignItems: "center", marginVertical: 20 },
  avatar: { width: 120, height: 120, borderRadius: 60 },
  name: { fontSize: 24, fontWeight: "800", textAlign: "center" },
  role: { fontSize: 16, textAlign: "center", opacity: 0.6, marginBottom: 20 },
  section: { marginBottom: 20 },
  label: { fontSize: 18, fontWeight: "700", marginBottom: 5 },
  text: { fontSize: 16, lineHeight: 22, opacity: 0.8 },
  actionContainer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 30 },
  button: { flex: 0.48, padding: 15, borderRadius: 12, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: 16 }
});