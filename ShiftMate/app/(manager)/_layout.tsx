import { Stack } from "expo-router";

export default function ManagerLayout() {
  return (
    <Stack screenOptions={{ headerBackTitle: "Back" }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="candidate/[id]" options={{ title: "Candidate Profile" }} />
    </Stack>
  );
}