import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { View, Text, Pressable, ActivityIndicator } from "react-native";

export function DepartmentSelector({ selectedId, onSelect, theme }: any) {
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDepartments() {
      try {
        setLoading(true);
        
        // 1. Fetch current active session
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
          console.warn("No active session discovered.");
          return;
        }

        // 2. Fetch the business identity tied to this specific manager profile
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("business_id")
          .eq("id", session.user.id)
          .single();

        if (profileError || !profile?.business_id) {
          console.error("Failed to tie profile back to a verified business:", profileError);
          return;
        }

        // 3. Query only the departments explicitly assigned to this business_id
        const { data, error } = await supabase
          .from("departments")
          .select("id, name")
          .eq("business_id", profile.business_id) // ◄ The isolated business filter
          .order("name", { ascending: true });

        if (error) throw error;

        setDepartments(data || []);
      } catch (error) {
        console.error("Department isolation lifecycle failure:", error);
      } finally {
        setLoading(false);
      }
    }

    loadDepartments();
  }, []);

  if (loading) {
    return (
      <View style={{ marginVertical: 10, flexDirection: "row", alignItems: "center", gap: 8 }}>
        <ActivityIndicator size="small" color={theme.text} />
        <Text style={{ color: theme.secondaryText, fontSize: 13, fontWeight: "500" }}>
          Synchronizing corporate departments...
        </Text>
      </View>
    );
  }

  return (
    <View style={{ gap: 12, marginBottom: 24 }}>
      <Text style={{ fontSize: 11, fontWeight: "800", color: theme.text, opacity: 0.4, letterSpacing: 1.5 }}>
        ASSIGNMENT DEPARTMENT
      </Text>
      
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
        {departments.map((dept) => {
          const isSelected = selectedId === dept.id;
          return (
            <Pressable
              key={dept.id}
              onPress={() => onSelect(dept.id)}
              style={({ pressed }) => [
                {
                  paddingVertical: 14,
                  paddingHorizontal: 20,
                  borderRadius: 22,
                  backgroundColor: isSelected ? theme.text : theme.card || "#F1F3F5",
                  borderWidth: 1,
                  borderColor: isSelected ? "transparent" : "rgba(0,0,0,0.04)",
                  opacity: pressed ? 0.9 : 1,
                  transform: [{ scale: pressed ? 0.97 : 1 }]
                }
              ]}
            >
              <Text style={{ 
                color: isSelected ? theme.background : theme.text, 
                fontWeight: "800",
                fontSize: 13,
                letterSpacing: 0.3
              }}>
                {dept.name.toUpperCase()}
              </Text>
            </Pressable>
          );
        })}
        
        {departments.length === 0 && (
          <Text style={{ color: theme.secondaryText, fontSize: 14, fontWeight: "500" }}>
            No specialized departments configured yet.
          </Text>
        )}
      </View>
    </View>
  );
}