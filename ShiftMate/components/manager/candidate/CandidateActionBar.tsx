import React from "react";
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
  const isBusy = processing !== null;

  // Se è già accettato, mostriamo solo lo stato
  if (applicationStatus === 'accepted') {
    return (
      <View style={[styles.actionBar, { backgroundColor: theme.background, paddingBottom: insets.bottom + 20, borderTopColor: theme.border }]}>
        <View style={[styles.statusBanner, { backgroundColor: '#4CAF5015' }]}>
          <Ionicons name="checkmark-circle" size={22} color="#4CAF50" />
          <Text style={[styles.statusBannerText, { color: '#4CAF50' }]}>Candidato Assunto</Text>
        </View>
      </View>
    );
  }

  // Se è già rifiutato, mostriamo solo lo stato
  if (applicationStatus === 'rejected') {
    return (
      <View style={[styles.actionBar, { backgroundColor: theme.background, paddingBottom: insets.bottom + 20, borderTopColor: theme.border }]}>
        <View style={[styles.statusBanner, { backgroundColor: '#F4433615' }]}>
          <Ionicons name="close-circle" size={22} color="#F44336" />
          <Text style={[styles.statusBannerText, { color: '#F44336' }]}>Candidatura Rifiutata</Text>
        </View>
      </View>
    );
  }

  // Se il turno è pieno (ma non da questo candidato), blocchiamo le azioni
  if (shiftStatus === 'filled' || shiftStatus === 'assigned') {
    return (
      <View style={[styles.actionBar, { backgroundColor: theme.background, paddingBottom: insets.bottom + 20, borderTopColor: theme.border }]}>
        <View style={[styles.statusBanner, { backgroundColor: theme.card }]}>
          <Ionicons name="lock-closed" size={20} color={theme.text + "40"} />
          <Text style={[styles.statusBannerText, { color: theme.text + "40" }]}>Turno già completato</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.actionBar, { backgroundColor: theme.background, paddingBottom: insets.bottom + 20, borderTopColor: theme.border }]}>
      <View style={styles.actionRow}>
        <Pressable 
          style={({ pressed }) => [styles.button, styles.buttonSecondary, { borderColor: theme.text, opacity: (isBusy || pressed) ? 0.5 : 1 }]} 
          onPress={() => handleUpdateStatus('rejected')}
          disabled={isBusy}
        >
          {processing === 'rejected' ? <ActivityIndicator size="small" color={theme.text} /> : <Text style={[styles.buttonTextSecondary, { color: theme.text }]}>Rifiuta</Text>}
        </Pressable>

        <Pressable 
          style={({ pressed }) => [styles.button, styles.buttonPrimary, { backgroundColor: theme.text, opacity: (isBusy || pressed) ? 0.8 : 1 }]} 
          onPress={() => handleUpdateStatus('accepted')}
          disabled={isBusy}
        >
          {processing === 'accepted' ? <ActivityIndicator size="small" color={theme.background} /> : <Text style={[styles.buttonTextPrimary, { color: theme.background }]}>Accetta Candidato</Text>}
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  actionBar: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: 20, paddingTop: 15, borderTopWidth: 1, zIndex: 10 },
  actionRow: { flexDirection: 'row', gap: 12 },
  button: { flex: 1, height: 58, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  buttonPrimary: { elevation: 2 },
  buttonSecondary: { borderWidth: 1.5 },
  buttonTextPrimary: { fontWeight: "800", fontSize: 16 },
  buttonTextSecondary: { fontWeight: "800", fontSize: 16 },
  statusBanner: { height: 58, borderRadius: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  statusBannerText: { fontSize: 16, fontWeight: '800' },
});