import { Stack } from "expo-router";
import { useColorScheme } from "react-native";
import { Colors } from "@/constants/theme";

export default function ShiftStackLayout() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];

  return (
    <Stack
      screenOptions={{
        // ✅ Abilita la barra in alto su tutte le pagine della cartella
        headerShown: true, 

        headerBackButtonDisplayMode: "minimal",

        // ✅ Colore della freccia e dei testi nell'header
        headerTintColor: theme.tint, 
        
        // ✅ Stile della barra (sfondo)
        headerStyle: {
          backgroundColor: theme.background,
        },
        
        // ✅ Stile del titolo (Grassetto)
        headerTitleStyle: {
          fontWeight: "bold",
          color: theme.text,
        },
        
        // ✅ Toglie la linea di separazione per un look più moderno
        headerShadowVisible: false, 
      }}
    >
      {/* 1. La pagina principale (Lista dei Turni) */}
      <Stack.Screen 
        name="index" 
        options={{ 
          title: "My shifts",
          headerStyle: {
          backgroundColor: theme.background,
        },
        }} 
      />

      {/* 2. La pagina di Dettaglio (Dinamica) */}
      <Stack.Screen 
        name="[id]" 
        options={{ 
          title: "Shift Details",
          headerStyle: {
            backgroundColor: theme.background,
          },
          
        }} 
      />

      {/* 3. La pagina di Modifica */}
      <Stack.Screen 
        name="editShift" 
        options={{ 
          title: "Edit shift",
          presentation: "card",
          headerStyle: {
          backgroundColor: theme.background,
        },
        }} 
      />
    </Stack>
  );
}