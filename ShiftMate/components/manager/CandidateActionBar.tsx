import { View, Text, Pressable, ActivityIndicator, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export const CandidateActionBar = ({ 
  applicationStatus, 
  shiftStatus, 
  processing, 
  handleUpdateStatus, 
  theme, 
  insets 
}: any) => {
  return (
    <View style={[styles.actionBar, { backgroundColor: theme.background, paddingBottom: insets.bottom + 20 }]}>
      {applicationStatus === 'accepted' ? (
        <View style={[styles.statusBanner, { backgroundColor: '#4CAF5015' }]}>
          <Ionicons name="checkmark-circle" size={22} color="#4CAF50" />
          <Text style={[styles.statusBannerText, { color: '#4CAF50' }]}>Candidate Accepted</Text>
        </View>
      ) : (shiftStatus === 'filled' || shiftStatus === 'assigned') ? (
        <View style={[styles.statusBanner, { backgroundColor: theme.card }]}>
          <Ionicons name="lock-closed" size={20} color={theme.text + "40"} />
          <Text style={[styles.statusBannerText, { color: theme.text + "40" }]}>Shift already filled</Text>
        </View>
      ) : (
        <View style={styles.actionRow}>
          <Pressable 
            style={[styles.button, styles.buttonSecondary, { borderColor: theme.text }]} 
            onPress={() => handleUpdateStatus('rejected')}
            disabled={processing !== null}
          >
            <Text style={[styles.buttonTextSecondary, { color: theme.text }]}>Reject</Text>
          </Pressable>

          <Pressable 
            style={[styles.button, styles.buttonPrimary, { backgroundColor: theme.text }]} 
            onPress={() => handleUpdateStatus('accepted')}
            disabled={processing !== null}
          >
            {processing === 'accepted' ? (
              <ActivityIndicator size="small" color={theme.background} />
            ) : (
              <Text style={[styles.buttonTextPrimary, { color: theme.background }]}>Accept Candidate</Text>
            )}
          </Pressable>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  actionBar: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: 20, paddingTop: 15, borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.05)', zIndex: 10 },
  actionRow: { flexDirection: 'row', gap: 12 },
  button: { flex: 1, height: 60, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  buttonPrimary: { elevation: 2 },
  buttonSecondary: { borderWidth: 1.5 },
  buttonTextPrimary: { fontWeight: "800", fontSize: 16 },
  buttonTextSecondary: { fontWeight: "800", fontSize: 16 },
  statusBanner: { height: 60, borderRadius: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  statusBannerText: { fontSize: 16, fontWeight: '800' },
});