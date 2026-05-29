import { Stack, useRouter } from "expo-router"; 
import { ThemeProvider, DefaultTheme } from "@react-navigation/native";
import { useAssets } from "expo-asset";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState, useRef } from "react";
import { Pressable, StyleSheet, View, Platform, Animated, Alert, Text } from "react-native";
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
  const [unreadCount, setUnreadCount] = useState(0);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const [assets, error] = useAssets([
    require("../assets/images/hero.webp"),
  ]);

  // 🔐 Gestione Sessione
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      if (event === 'SIGNED_OUT') {
        navigationRouter.replace("/");
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // 🔔 Query + Realtime Listener per il contatore Notifiche Globale
  useEffect(() => {
    if (!session?.user?.id) {
      setUnreadCount(0);
      return;
    }

    const fetchCount = async () => {
      const { count } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .match({ profile_id: session.user.id, is_read: false, is_archived: false });
      setUnreadCount(count || 0);
    };

    fetchCount();
    
    const channel = supabase.channel('global-root-notifications')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications' }, fetchCount)
      .subscribe();
      
    return () => { if (channel) supabase.removeChannel(channel); };
  }, [session]);

  // ⏳ Splash Screen Control
  useEffect(() => {
    if (assets || error) {
      const timer = setTimeout(async () => {
        await SplashScreen.hideAsync();
        setIsAppReady(true);
      }, 400); 
      return () => clearTimeout(timer);
    }
  }, [assets, error]);

  // 🎬 Animazione Pannello Controllo
  useEffect(() => {
    if (isAppReady && session) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 900,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [isAppReady, session]);

  const handleLogout = async () => {
    try {
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
        </Stack>

        {/* PANNELLO DI CONTROLLO GALLEGGIANTE IN ALTO A SINISTRA */}
        {session && isAppReady && (
          <Animated.View 
            style={[
              styles.floatingControlPanel,
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
            {/* 🔔 BOTTONE NOTIFICHE GALLEGIANTE */}
            <Pressable 
              onPress={() => navigationRouter.push("/(manager)/notifications/notificationsManager")} 
              style={({ pressed }) => [
                styles.floatingButton,
                { opacity: pressed ? 0.7 : 1 }
              ]}
            >
              <Ionicons name="notifications-outline" size={20} color="white" />
              {unreadCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </Text>
                </View>
              )}
            </Pressable>

            {/* 🚪 BOTTONE LOGOUT GALLEGGIANTE */}
            <Pressable 
              onPress={handleLogout} 
              style={({ pressed }) => [
                styles.floatingButton,
                styles.logoutBtnColor,
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
  floatingControlPanel: {
    position: 'absolute',
    right: 20,
    flexDirection: 'row', // Affianca i due bottoni orizzontalmente
    gap: 10,              // Spazio tra la campanella e il logout
    zIndex: 9999, 
  },
  floatingButton: {
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
    position: 'relative'
  },
  logoutBtnColor: {
    borderColor: 'rgba(239, 68, 68, 0.4)', // Un leggero bordo rosso per il logout
  },
  badge: {
    position: "absolute",
    top: -2,
    right: -2,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#EF4444", // Rosso vivo per il contatore
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#111827", // Bordo scuro per staccare dal bottone
    paddingHorizontal: 2,
  },
  badgeText: { 
    color: "#FFF", 
    fontSize: 8, 
    fontWeight: "900" 
  },
});