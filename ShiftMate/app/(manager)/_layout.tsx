import { Stack } from "expo-router";

export default function ManagerLayout() {
  return (
    <Stack screenOptions={{ headerBackTitle: "" }}>
        <Stack.Screen name="(tabs)" options={{ title: "", headerShown: false }} />
        <Stack.Screen name="candidate/[id]" 
          options={{ 
            title: "", 
            headerBackButtonDisplayMode: "minimal" 
          }}
        />
    </Stack>
  );
}