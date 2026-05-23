import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Pressable, LayoutAnimation, Platform, UIManager, TextInput, ActivityIndicator, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { updateBudget } from "@/queries/managerQueries";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface DepartmentStat { id: string; name: string; plannedBudget: number; effectiveSpent: number; availableBudget: number; }
interface Props { stats: { departments: DepartmentStat[]; }; theme: any; refreshDashboard: () => Promise<void> | void; }

export const FinancialOverview = ({ stats, theme, refreshDashboard }: Props) => {
  const [expandedId, setExpandedId] = useState<string | null>(stats.departments?.[0]?.id || null);

  if (!stats.departments || stats.departments.length === 0) {
    return (
      <View style={[styles.emptyCard, { backgroundColor: theme.card }]}>
        <Text style={{ color: theme.secondaryText }}>No departments found.</Text>
      </View>
    );
  }

  const toggleExpand = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.sectionTitle, { color: theme.text }]}>Department Budgets</Text>
      {stats.departments.map((dept) => (
        <DepartmentCard 
          key={dept.id}
          dept={dept}
          theme={theme}
          isExpanded={expandedId === dept.id}
          onPressHeader={() => toggleExpand(dept.id)}
          onBudgetUpdated={refreshDashboard}
        />
      ))}
    </View>
  );
};

const DepartmentCard = ({ dept, theme, isExpanded, onPressHeader, onBudgetUpdated }: any) => {
  const [budgetInput, setBudgetInput] = useState<string>(Math.round(dept.plannedBudget).toString());
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false); // UX: Stato per mostrare/nascondere l'input

  useEffect(() => {
    setBudgetInput(Math.round(dept.plannedBudget).toString());
  }, [dept.plannedBudget]);

  const isNegative = dept.availableBudget < 0;
  
  // Calcolo della percentuale spesa per la progress bar
  const spentPercentage = dept.plannedBudget > 0 
    ? Math.min((dept.effectiveSpent / dept.plannedBudget) * 100, 100) 
    : 100;

  // Colore dinamico in base allo stato di usura del budget
  let statusColor = "#34C759"; // Verde (Tutto ok)
  if (spentPercentage >= 90 || isNegative) statusColor = "#FF3B30"; // Rosso (Pericolo/Finiti)
  else if (spentPercentage >= 70) statusColor = "#FF9500"; // Arancione (Attenzione)

  const handleSaveBudget = async () => {
    const parsedBudget = parseFloat(budgetInput);
    if (isNaN(parsedBudget) || parsedBudget < 0) {
      Alert.alert("Errore", "Inserisci un numero valido.");
      return;
    }
    try {
      setIsSaving(true);
      await updateBudget(dept.id, parsedBudget);
      await onBudgetUpdated();
      setIsEditing(false); // Chiude l'input dopo il successo
    } catch (error) {
      Alert.alert("Errore", "Impossibile aggiornare il database.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={[styles.mainCard, { backgroundColor: theme.card }]}>
      {/* HEADER */}
      <Pressable style={styles.accordionHeader} onPress={onPressHeader}>
        <View style={styles.headerLeft}>
          <View style={[styles.iconBadge, { backgroundColor: theme.tint + "10" }]}>
            <Ionicons name="business" size={14} color={theme.tint} />
          </View>
          <Text style={[styles.deptName, { color: theme.text }]}>{dept.name}</Text>
        </View>
        <View style={styles.headerRight}>
          <Text style={[styles.headerAvailableValue, { color: statusColor }]}>
            €{dept.availableBudget.toLocaleString('it-IT')}
          </Text>
          <Ionicons name={isExpanded ? "chevron-up" : "chevron-down"} size={16} color={theme.secondaryText} />
        </View>
      </Pressable>

      {/* CONTENUTO ESPANSO */}
      {isExpanded && (
        <View style={styles.dropdownContent}>
          
          {/* PROGRESS BAR VISIVA (Miglioramento UX chiave) */}
          <View style={styles.progressContainer}>
            <View style={styles.progressLabelRow}>
              <Text style={[styles.spendingLabel, { color: theme.secondaryText }]}>SPENDING PROGRESS</Text>
              <Text style={[styles.progressPercentText, { color: statusColor }]}>{Math.round(spentPercentage)}%</Text>
            </View>
            <View style={[styles.progressBarTrack, { backgroundColor: theme.background }]}>
              <View style={[styles.progressBarFill, { width: `${spentPercentage}%`, backgroundColor: statusColor }]} />
            </View>
          </View>

          {/* GRID DEI NUMERI */}
          <View style={styles.spendingGrid}>
            <View style={[styles.spendingItem, { backgroundColor: theme.background }]}>
              <View style={styles.labelWithIcon}>
                <Text style={[styles.spendingLabel, { color: theme.secondaryText }]}>PLANNED (LIMIT)</Text>
                <Pressable onPress={() => {
                  LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                  setIsEditing(!isEditing);
                }}>
                  <Ionicons name="create-outline" size={20} color={theme.tint} style={{ marginLeft: 4 }} />
                </Pressable>
              </View>
              <Text style={[styles.spendingValue, { color: theme.text }]}>
                €{dept.plannedBudget.toLocaleString('it-IT')}
              </Text>
            </View>
            
            <View style={[styles.spendingItem, { backgroundColor: theme.background }]}>
              <Text style={[styles.spendingLabel, { color: theme.secondaryText }]}>EFFECTIVE (SPENT)</Text>
              <Text style={[styles.spendingValue, { color: theme.text }]}>
                €{dept.effectiveSpent.toLocaleString('it-IT')}
              </Text>
            </View>
          </View>

          {/* EDIT BUDGET FORM*/}
          {isEditing && (
            <View style={[styles.editBudgetForm, { borderTopColor: theme.background }]}>
              <TextInput
                style={[styles.budgetTextInput, { backgroundColor: theme.background, color: theme.text, borderColor: theme.tint + "30" }]}
                value={budgetInput}
                onChangeText={setBudgetInput}
                keyboardType="numeric"
                placeholder="Nuovo Budget"
                placeholderTextColor={theme.secondaryText}
                returnKeyType="done"
                autoFocus
              />
              <Pressable style={[styles.saveButton, { backgroundColor: theme.tint }]} onPress={handleSaveBudget} disabled={isSaving}>
                {isSaving ? <ActivityIndicator size="small" color="#FFF" /> : <Text style={styles.saveButtonText}>Salva</Text>}
              </Pressable>
            </View>
          )}

        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginBottom: 8 },
  sectionTitle: { fontSize: 13, fontWeight: "800", marginBottom: 12, textTransform: "uppercase", letterSpacing: 0.5, opacity: 0.7 },
  mainCard: { borderRadius: 20, marginBottom: 10, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 10, elevation: 2, overflow: "hidden" },
  emptyCard: { borderRadius: 20, padding: 20, alignItems: 'center', marginBottom: 12 },
  accordionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 14 },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconBadge: { padding: 6, borderRadius: 8 },
  deptName: { fontSize: 14, fontWeight: '800' },
  headerAvailableValue: { fontSize: 14, fontWeight: '800' },
  dropdownContent: { paddingHorizontal: 14, paddingBottom: 14, paddingTop: 4 },
  
  // Stili Progress Bar
  progressContainer: { marginBottom: 14, marginTop: 4 },
  progressLabelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6, alignItems: 'center' },
  progressPercentText: { fontSize: 11, fontWeight: '800' },
  progressBarTrack: { height: 7, borderRadius: 4, width: '100%', overflow: 'hidden' },
  progressBarFill: { height: '100%', borderRadius: 4 },

  spendingGrid: { flexDirection: 'row', gap: 8 },
  spendingItem: { flex: 1, padding: 12, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  labelWithIcon: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  spendingLabel: { fontSize: 8, fontWeight: '700', opacity: 0.6 },
  spendingValue: { fontSize: 14, fontWeight: '800' },
  editBudgetForm: { flexDirection: 'row', gap: 8, borderTopWidth: 1, paddingTop: 12, marginTop: 12, alignItems: 'center' },
  budgetTextInput: { flex: 1, height: 38, borderRadius: 8, borderWidth: 1, paddingHorizontal: 12, fontSize: 13, fontWeight: '600' },
  saveButton: { height: 38, paddingHorizontal: 16, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  saveButtonText: { color: '#FFF', fontSize: 12, fontWeight: '700' }
});