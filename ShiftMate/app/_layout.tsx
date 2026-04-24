import { Stack, useRouter } from "expo-router"; // Usa l'hook useRouter
import { ThemeProvider, DefaultTheme } from "@react-navigation/native";
import { useAssets } from "expo-asset";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState, useRef } from "react";
import { Pressable, StyleSheet, View, Platform, Animated, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "@/lib/supabase";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Session } from "@supabase/supabase-js";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const navigationRouter = useRouter();
  const insets = useSafeAreaInsets();
  
  const [session, setSession] = useState<Session | null>(null);
  const [isAppReady, setIsAppReady] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const [assets, error] = useAssets([
    require("../assets/images/hero.webp"),
  ]);

  useEffect(() => {
    // Recupera sessione iniziale
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // Ascolta i cambiamenti. Se l'utente esce, resettiamo lo stato
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      if (event === 'SIGNED_OUT') {
        navigationRouter.replace("/"); // Reindirizzamento immediato al logout
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (assets || error) {
      const timer = setTimeout(async () => {
        await SplashScreen.hideAsync();
        setIsAppReady(true);
      }, 400); 
      return () => clearTimeout(timer);
    }
  }, [assets, error]);

  useEffect(() => {
    if (isAppReady && session) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 900,
        useNativeDriver: true,
      }).start();
    } else {
      // Scomparsa immediata o fade-out se preferisci
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [isAppReady, session]);

  const handleLogout = async () => {
    try {
      // signOut() scatenerà onAuthStateChange che farà il replace("/")
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (err) {
      console.error("Errore durante il logout:", err);
      Alert.alert("Errore", "Impossibile disconnettersi.");
    }
  };

  if (!assets && !error) return null;

  return (
    <ThemeProvider value={DefaultTheme}>
      <View style={{ flex: 1 }}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          {/* Aggiungi qui altre rotte se necessario */}
        </Stack>

        {session && isAppReady && (
          <Animated.View 
            style={[
              styles.logoutContainer,
              { 
                top: insets.top + (Platform.OS === 'ios' ? 0 : 10),
                opacity: fadeAnim,
                transform: [{
                  scale: fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.9, 1]
                  })
                }]
              }
            ]}
          >
            <Pressable 
              onPress={handleLogout} 
              style={({ pressed }) => [
                styles.logoutButton,
                { opacity: pressed ? 0.7 : 1 }
              ]}
            >
              <Ionicons name="log-out-outline" size={20} color="white" />
            </Pressable>
          </Animated.View>
        )}
      </View>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  logoutContainer: {
    position: 'absolute',
    right: 20,
    zIndex: 9999, // Mantieni lo zIndex alto
  },
  logoutButton: {
    backgroundColor: '#111827',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
});