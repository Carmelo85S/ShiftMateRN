import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Alert } from 'react-native';
import { Ionicons } from "@expo/vector-icons";
import { useSetupBusiness } from '@/hooks/manager/useSetupBusiness';
import { router, Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Colors } from "@/constants/theme";

const PLANS = [
  { id: 'price_1TdRTrPf9BDNyCapNvDt0Cxt', name: 'Essential', price: '1490 SEK', mode: 'subscription', desc: 'Up to 3 managers', kpi: 'ESSENTIAL', icon: 'infinite-outline', isBest: false },
  { id: 'price_1TdpUqPf9BDNyCaphUprM3xC', name: 'Growth', price: '2990 SEK', mode: 'subscription', desc: 'Advanced features', kpi: 'GROWTH', icon: 'trending-up-outline', isBest: true },
  { id: 'price_1TdpVXPf9BDNyCapRO9apxU0', name: 'Scale', price: '5990 SEK', mode: 'subscription', desc: 'Unlimited access', kpi: 'SCALE', icon: 'rocket-outline', isBest: false },
  { id: 'price_1TdRUfPf9BDNyCap2gvWBsOm', name: 'Quick Start', price: '390 SEK', mode: 'payment', desc: '1 job / 14 days', kpi: 'STARTER', icon: 'wallet-outline', isBest: false },
  { id: 'price_1TdpSEPf9BDNyCapTpA1yPPY', name: 'Flexi Pack', price: '1500 SEK', mode: 'payment', desc: '2 jobs / 30 days', kpi: 'FLEXI', icon: 'wallet-outline', isBest: false },
  { id: 'price_1TdpTlPf9BDNyCapsKtthz8K', name: 'Business Flow', price: '3000 SEK', mode: 'payment', desc: '3 jobs / 30 days', kpi: 'FLOW', icon: 'wallet-outline', isBest: false },
];

export default function SubscriptionScreen() {
  const { businessId } = useLocalSearchParams<{ businessId: string }>();
  const { handlePayment, loading } = useSetupBusiness();
  const theme = Colors.light;

  const handlePress = (plan: typeof PLANS[0]) => {
    if (!businessId) {
      Alert.alert("Errore", "Business ID non trovato. Torna indietro e riprova.");
      return;
    }
    handlePayment(plan.id, businessId, plan.mode as 'payment' | 'subscription');
  };

  return (
    <>
    <Stack.Screen 
      options={{ 
        headerShown: true, 
        title: "Upgrade",
        headerLeft: () => (
          <Pressable onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={28} color={theme.text} />
          </Pressable>
        )
      }} 
    />
    <ScrollView style={{ flex: 1, backgroundColor: theme.background }} contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.kpiHeader, { color: theme.tint }]}>UPGRADE YOUR BUSINESS</Text>
        <Text style={[styles.title, { color: theme.text }]}>Choose your power</Text>
      </View>

      {PLANS.map((plan) => (
        <Pressable 
          key={plan.id} 
          style={[styles.card, plan.isBest && { backgroundColor: theme.tint }]}
          onPress={() => handlePress(plan)}
          disabled={loading}
        >
          {plan.isBest && (
            <View style={styles.badgeBest}>
              <Text style={styles.badgeBestText}>MOST POPULAR</Text>
            </View>
          )}
          
          <View style={styles.cardHeader}>
            <Text style={[styles.kpi, { color: plan.isBest ? '#FFF' : theme.tint }]}>{plan.kpi}</Text>
            <Ionicons name={plan.icon as any} size={22} color={plan.isBest ? '#FFF' : theme.text} />
          </View>
          
          <Text style={[styles.cardTitle, { color: plan.isBest ? '#FFF' : theme.text }]}>{plan.name}</Text>
          <Text style={[styles.priceText, { color: plan.isBest ? '#FFF' : theme.tint }]}>{plan.price}</Text>
          <Text style={[styles.cardSubtitle, { color: plan.isBest ? 'rgba(255,255,255,0.8)' : theme.secondaryText }]}>{plan.desc}</Text>
          
          <View style={[styles.button, { backgroundColor: plan.isBest ? '#FFF' : theme.tint }]}>
            <Text style={[styles.buttonText, { color: plan.isBest ? theme.tint : '#FFF' }]}>
              {plan.isBest ? 'ACTIVATE NOW' : 'SELECT PLAN'}
            </Text>
          </View>
        </Pressable>
      ))}
      
      <Text style={styles.footer}>🔒 256-bit SSL Secure Payment</Text>
    </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { padding: 32, paddingVertical: 100 },
  header: { marginBottom: 30 },
  kpiHeader: { fontSize: 13, fontWeight: "800", letterSpacing: 1, marginBottom: 8 },
  title: { fontSize: 38, fontWeight: "800", letterSpacing: -1 },
  card: { 
    borderRadius: 32, padding: 28, marginBottom: 20, borderWidth: 1, borderColor: "rgba(0,0,0,0.05)",
    backgroundColor: '#FFF', elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 20
  },
  badgeBest: { position: 'absolute', top: -12, right: 24, backgroundColor: '#FFD700', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  badgeBestText: { fontSize: 10, fontWeight: '900', color: '#000' },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 16 },
  kpi: { fontSize: 11, fontWeight: "800", letterSpacing: 1 },
  cardTitle: { fontSize: 24, fontWeight: "800", marginBottom: 8 },
  priceText: { fontSize: 32, fontWeight: "900", marginBottom: 12 },
  cardSubtitle: { fontSize: 16, marginBottom: 24, opacity: 0.8 },
  button: { paddingVertical: 18, borderRadius: 16, alignItems: 'center' },
  buttonText: { fontSize: 15, fontWeight: "800", letterSpacing: 0.5 },
  footer: { textAlign: 'center', marginTop: 20, marginBottom: 40, color: '#9CA3AF', fontSize: 12 }
});