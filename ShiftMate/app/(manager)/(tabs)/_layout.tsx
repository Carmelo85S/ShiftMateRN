import { Tabs } from "expo-router";
import { IconSymbol } from "@/components/ui/icon-symbol"; 

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ 
      headerShown: false, // Lascialo false: l'header lo mettono gli Stack interni
      tabBarActiveTintColor: '#000' 
    }}>
      <Tabs.Screen 
        name="dashboard" // Deve esserci la cartella dashboard/ con _layout.tsx
        options={{ 
          title: "Home", 
          tabBarIcon: ({color}) => <IconSymbol name="speedometer" color={color} /> 
        }} 
      />
      <Tabs.Screen 
        name="shift" // Deve esserci la cartella shift/ con _layout.tsx
        options={{ 
          title: "Shifts", 
          tabBarIcon: ({color}) => <IconSymbol name="calendar" color={color} /> 
        }} 
      />
      <Tabs.Screen 
        name="createShift" // Deve esserci la cartella createShift/ con _layout.tsx
        options={{ 
          title: "Post", 
          tabBarIcon: ({color}) => <IconSymbol name="plus.circle" color={color} /> 
        }} 
      />
      <Tabs.Screen 
        name="profile" // Deve esserci la cartella profile/ con _layout.tsx
        options={{ 
          title: "Account", 
          tabBarIcon: ({color}) => <IconSymbol name="person.fill" color={color} /> 
        }} 
      />
    </Tabs>
  );
}