import { Stack } from "expo-router";

export default function CreateShiftStack() {
  return (
    <Stack screenOptions={{ headerShown: true }}>
      <Stack.Screen name="index" options={{ title: "Post a New Shift" }} />
    </Stack>
  );
}