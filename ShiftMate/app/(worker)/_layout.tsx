import { Stack } from "expo-router";
import { Colors } from "@/constants/theme";

export default function WorkerLayout() {
  const theme = Colors.light;

  return (
    <Stack
      screenOptions={{
        headerTransparent: true,
        headerTitle: "",
        headerBackTitle: "", 
        headerTintColor: theme.text,
        headerShadowVisible: false,
      }}
    >
      {/* Opzionale: puoi personalizzare singole rotte qui */}
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="shift/[id]" options={{ 
        headerTitle: "",
      }} />
    </Stack>
  );
}