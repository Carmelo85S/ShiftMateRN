import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, SafeAreaView, Dimensions } from 'react-native';
import { useSetupBusiness } from '@/hooks/manager/useSetupBusiness';
import { useLocalSearchParams } from 'expo-router';

const { width } = Dimensions.get('window');

const PLANS = [
  // ONE-TIME (Pagamenti Singoli)
  { id: 'price_1TdRUfPf9BDNyCap2gvWBsOm', name: 'Quick Start', price: '390 SEK', mode: 'payment', color: '#4F46E5', desc: '1 job / 14 days' },
  { id: 'price_1TdpSEPf9BDNyCapTpA1yPPY', name: 'Flexi Pack', price: '1500 SEK', mode: 'payment', color: '#4F46E5', desc: '2 jobs / 30 days' },
  { id: 'price_1TdpTlPf9BDNyCapsKtthz8K', name: 'Business Flow', price: '3000 SEK', mode: 'payment', color: '#4F46E5', desc: '3 jobs / 30 days' },
  // SUBSCRIPTION (Abbonamenti)
  { id: 'price_1TdRTrPf9BDNyCapNvDt0Cxt', name: 'Essential', price: '1490 SEK', mode: 'subscription', color: '#8B5CF6', desc: 'Up to 3 managers' },
  { id: 'price_1TdpUqPf9BDNyCaphUprM3xC', name: 'Growth', price: '2990 SEK', mode: 'subscription', color: '#8B5CF6', desc: 'Advanced features' },
  { id: 'price_1TdpVXPf9BDNyCapRO9apxU0', name: 'Scale', price: '5990 SEK', mode: 'subscription', color: '#8B5CF6', desc: 'Unlimited access' },
];

export default function SubscriptionScreen() {
  const { businessId } = useLocalSearchParams<{ businessId: string }>();
  const { handlePayment, loading, businessName } = useSetupBusiness();

  const renderCard = (plan: typeof PLANS[0]) => (
    <TouchableOpacity 
      key={plan.id}
      style={[styles.card, { borderColor: plan.color }]}
      onPress={() => handlePayment(plan.id, businessId, plan.mode as 'payment' | 'subscription')}
      disabled={loading}
    >
      <Text style={[styles.planName, { color: plan.color }]}>{plan.name}</Text>
      <Text style={styles.priceText}>{plan.price}</Text>
      <Text style={styles.descText}>{plan.desc}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Complete your setup</Text>
          <Text style={styles.subtitle}>Plan for {businessName || 'your business'}</Text>
        </View>

        <Text style={styles.sectionHeader}>Pagamenti Singoli</Text>
        <View style={styles.grid}>{PLANS.filter(p => p.mode === 'payment').map(renderCard)}</View>

        <Text style={styles.sectionHeader}>Abbonamenti Mensili</Text>
        <View style={styles.grid}>{PLANS.filter(p => p.mode === 'subscription').map(renderCard)}</View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  scrollContent: { padding: 20 },
  header: { marginBottom: 20, alignItems: 'center' },
  title: { fontSize: 24, fontWeight: 'bold' },
  subtitle: { color: '#666' },
  sectionHeader: { fontSize: 16, fontWeight: '700', marginTop: 20, marginBottom: 10, color: '#333' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 10 },
  card: { width: (width / 2) - 25, padding: 15, borderRadius: 12, borderWidth: 2, backgroundColor: '#FFF', alignItems: 'center' },
  planName: { fontSize: 14, fontWeight: '700', marginBottom: 5 },
  priceText: { fontSize: 16, fontWeight: '800' },
  descText: { fontSize: 11, color: '#666', marginTop: 5, textAlign: 'center' }
});