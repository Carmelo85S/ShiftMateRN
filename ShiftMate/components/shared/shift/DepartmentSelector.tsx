import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { DEPARTMENTS } from "@/constants/departments-titles";

interface Props {
  selectedId: string;
  onSelect: (id: string) => void;
  theme: any;
}

export const DepartmentSelector = ({ selectedId, onSelect, theme }: Props) => (
  <View style={styles.inputWrapper}>
    <Text style={[styles.label, { color: theme.text }]}>Department *</Text>
    <View style={styles.deptGrid}>
      {DEPARTMENTS.map((dept) => {
        const isSelected = selectedId === dept.id;
        return (
          <Pressable
            key={dept.id}
            onPress={() => onSelect(dept.id)}
            style={[
              styles.deptChip,
              { 
                backgroundColor: isSelected ? theme.tint : theme.card, 
                borderColor: theme.border 
              }
            ]}
          >
            <Ionicons 
              name={dept.icon as any} 
              size={18} 
              color={isSelected ? "#FFF" : theme.secondaryText} 
            />
            <Text style={[styles.deptText, { color: isSelected ? "#FFF" : theme.text }]}>
              {dept.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  </View>
);

const styles = StyleSheet.create({
  inputWrapper: { marginBottom: 25 },
  label: { fontSize: 11, fontWeight: "800", marginBottom: 12, textTransform: 'uppercase', opacity: 0.6 },
  deptGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  deptChip: { flex: 1, minWidth: '45%', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderRadius: 18, borderWidth: 1, gap: 8 },
  deptText: { fontSize: 14, fontWeight: "700" },
});