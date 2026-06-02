import { View, Text, Pressable, StyleSheet } from "react-native";
import { useRouter } from "expo-router";

export default function Subscription() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Accesso Limitato</Text>
      <Text style={styles.subtitle}>
        Per continuare a gestire la tua attività, è necessario un abbonamento attivo.
      </Text>
      
      <Pressable 
        style={styles.button} 
        onPress={() => {
          // Qui potresti richiamare la logica di Stripe o rimandare al setup
          router.push("/(manager)/setupBusiness");
        }}
      >
        <Text style={styles.buttonText}>Procedi al Pagamento</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
  subtitle: { textAlign: 'center', marginBottom: 30, color: '#666' },
  button: { backgroundColor: '#111827', padding: 15, borderRadius: 20, width: '100%' },
  buttonText: { color: 'white', textAlign: 'center', fontWeight: 'bold' }
});