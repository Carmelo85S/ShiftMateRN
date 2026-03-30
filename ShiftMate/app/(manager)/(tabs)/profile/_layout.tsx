import { Stack } from "expo-router";

export default function ProfileStackLayout() {
  return (
    <Stack screenOptions={{ 
      headerShown: true,
      headerShadowVisible: false,
    }}>
      <Stack.Screen name="index" options={{ title: "Profile" }} />
        <Stack.Screen name="editProfile" options={{title: "Edit account", headerBackVisible: true, headerBackButtonDisplayMode: "minimal"}} />
     </Stack>
  );
}