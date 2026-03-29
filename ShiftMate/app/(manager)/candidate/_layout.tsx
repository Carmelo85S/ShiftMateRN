import { Stack } from "expo-router";

export default function CandidateStackLayout() {
  return (
    <Stack screenOptions={{ 
      headerShown: true,
      headerShadowVisible: false,
    }}>
      <Stack.Screen name="index" options={{ title: "Candidate" }} />
    </Stack>
  );
}