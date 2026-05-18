// Esempio di logica interna a `@/components/shared/shift/DepartmentSelector`
import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { View, Text, Pressable } from "react-native";
// ... tuoi import di componenti grafici (Pressable, Text, View, ecc.)

export function DepartmentSelector({ selectedId, onSelect, theme }: any) {
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
      async function loadDepartments() {
        try {
          console.log("--- DEBUG DEPARTMENTS FETCH START ---");
          
          // 1. Verifichiamo se l'utente è davvero autenticato lato client
          const { data: { session } } = await supabase.auth.getSession();
          console.log("User logged authenticated UID:", session?.user?.id);

          // 2. Chiamata a Supabase
          const { data, error } = await supabase
            .from("departments")
            .select("id, name")
            .order("name", { ascending: true });

          if (error) {
            console.error("Supabase Error Object:", error);
            throw error;
          }

          console.log("Departments raw data from DB:", data);
          setDepartments(data || []);
        } catch (error) {
          console.error("Catch Block Error:", error);
        } finally {
          setLoading(false);
          console.log("--- DEBUG DEPARTMENTS FETCH END ---");
        }
      }

      loadDepartments();
  }, []);

  if (loading) return <Text style={{ color: theme.secondaryText }}>Loading departments...</Text>;

  return (
    <View style={{ gap: 10, marginBottom: 20 }}>
      <Text style={{ fontSize: 14, fontWeight: "600", color: theme.text, opacity: 0.7 }}>
        SELECT DEPARTMENT
      </Text>
      {/* Qui mappi i dipartimenti generando la tua UI custom (es. Chips o bottoni orizzontali) */}
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
        {departments.map((dept) => {
          const isSelected = selectedId === dept.id;
          return (
            <Pressable
              key={dept.id}
              onPress={() => onSelect(dept.id)}
              style={{
                paddingVertical: 12,
                paddingHorizontal: 18,
                borderRadius: 20,
                backgroundColor: isSelected ? theme.text : "#F1F3F5",
                borderWidth: 1,
                borderColor: "rgba(0,0,0,0.05)",
              }}
            >
              <Text style={{ 
                color: isSelected ? theme.background : theme.text, 
                fontWeight: "700",
                fontSize: 14 
              }}>
                {dept.name.toUpperCase()}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}