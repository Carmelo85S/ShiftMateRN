import { supabase } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import { DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Session } from "@supabase/supabase-js";
import { useAssets } from "expo-asset";
import { Stack, useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const navigationRouter = useRouter();
  const insets = useSafeAreaInsets();

  const [session, setSession] = useState<Session | null>(null);
  const [userRole, setUserRole] = useState<"manager" | "worker" | null>(null); // ◄ STATO RUOLO
  const [isAppReady, setIsAppReady] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const [assets, error] = useAssets([require("../assets/images/hero.webp")]);

  // 1. Gestione Sessione e Ruolo
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchUserRole(session.user.id);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      if (session) fetchUserRole(session.user.id);
      if (event === "SIGNED_OUT") {
        setUserRole(null);
        navigationRouter.replace("/");
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Funzione per recuperare il ruolo
  const fetchUserRole = async (userId: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("role") // Assicurati di avere questo campo o verifica su tabella 'businesses'
      .eq("id", userId)
      .single();

    setUserRole(data?.role === "manager" ? "manager" : "worker");
  };

  // 2. Notifiche (Filtro dinamico per ruolo)
  useEffect(() => {
    if (!session?.user?.id || !userRole) return;

    const fetchCount = async () => {
      // Nota: potresti dover filtrare le notifiche in base al ruolo se necessario
      const { count } = await supabase
        .from("notifications")
        .select("*", { count: "exact", head: true })
        .match({
          profile_id: session.user.id,
          is_read: false,
          is_archived: false,
        });
      setUnreadCount(count || 0);
    };

    fetchCount();
    const channel = supabase
      .channel("global-root-notifications")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "notifications" },
        fetchCount,
      )
      .subscribe();

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [session, userRole]);

  // 3. Splash Screen e Animazioni
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
    }
  }, [isAppReady, session]);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      Alert.alert("Error", "Unable to log out.");
    }
  };

  if (!assets && !error) return null;

  return (
    <ThemeProvider value={DefaultTheme}>
      <View style={{ flex: 1 }}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
        </Stack>

        {session && isAppReady && (
          <Animated.View
            style={[
              styles.floatingControlPanel,
              { top: insets.top + 10, opacity: fadeAnim },
            ]}
          >
            {/* 🔔 BOTTONE NOTIFICHE DINAMICO */}
            <Pressable
              onPress={() => {
                const route =
                  userRole === "manager"
                    ? "/(manager)/notifications/notificationsManager"
                    : "/(worker)/notifications";
                navigationRouter.push(route as any);
              }}
              style={styles.floatingButton}
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

            <Pressable
              onPress={handleLogout}
              style={[styles.floatingButton, styles.logoutBtnColor]}
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
    position: "absolute",
    right: 20,
    flexDirection: "row",
    gap: 10,
    zIndex: 9999,
  },
  floatingButton: {
    backgroundColor: "#111827",
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  logoutBtnColor: { borderColor: "rgba(239, 68, 68, 0.4)" },
  badge: {
    position: "absolute",
    top: -2,
    right: -2,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#EF4444",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#111827",
  },
  badgeText: { color: "#FFF", fontSize: 8, fontWeight: "900" },
});
