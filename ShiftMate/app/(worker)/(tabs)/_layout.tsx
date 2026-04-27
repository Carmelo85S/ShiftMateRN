import { Tabs, useRouter } from "expo-router";
import { useColorScheme } from "react-native";
import { Colors } from "@/constants/theme";
import { useTabBadge } from "@/hooks/worker/layout/useTabBadge";
import { OrbitTabBar } from "@/components/worker/layout/OrbitTabBar";

export default function TabLayout() {
  const theme = Colors[useColorScheme() ?? "light"];
  const router = useRouter();
  const { unreadCount, isGuest } = useTabBadge();

  return (
    <Tabs
      tabBar={(props) => (
        <OrbitTabBar 
          {...props} 
          badgeCount={unreadCount} 
          theme={theme} 
          isGuest={isGuest} 
          router={router} 
        />
      )}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="shifts" options={{ title: "Explore" }} />
      <Tabs.Screen name="profile" options={{ title: "Me" }} />
      <Tabs.Screen name="notifications" options={{ title: "Alerts" }} />
    </Tabs>
  );
}