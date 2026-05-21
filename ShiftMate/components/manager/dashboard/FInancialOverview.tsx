import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable, LayoutAnimation, Platform, UIManager, TextInput, ActivityIndicator, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
// Importiamo la vera query di Supabase dal tuo file delle query
import { updateBudget } from "@/queries/managerQueries";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface DepartmentStat {
  id: string;
  name: string;
  plannedBudget: number;
  effectiveSpent: number;
  availableBudget: number;
}

interface Props {
  stats: {
    departments: DepartmentStat[];
  };
  theme: {
    card: string;
    text: string;
    secondaryText: string;
    background: string;
    tint: string;
  };
  refreshDashboard: () => Promise<void> | void; // Sostituito il nome della prop per evitare conflitti di scope
}

export const FinancialOverview = ({ stats, theme, refreshDashboard }: Props) => {
  const [expandedId, setExpandedId] = useState<string | null>(
    stats.departments?.[0]?.id || null
  );

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

// Sotto-componente isolato per gestire lo stato del TextInput di ogni reparto senza interferenze
interface CardProps {
  dept: DepartmentStat;
  theme: any;
  isExpanded: boolean;
  onPressHeader: () => void;
  onBudgetUpdated: () => Promise<void> | void;
}

const DepartmentCard = ({ dept, theme, isExpanded, onPressHeader, onBudgetUpdated }: CardProps) => {
  const [budgetInput, setBudgetInput] = useState<string>(dept.plannedBudget.toString());
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const isNegative = dept.availableBudget < 0;
  const statusColor = isNegative ? "#FF3B30" : "#34C759";

  const handleSaveBudget = async () => {
    const parsedBudget = parseFloat(budgetInput);
    if (isNaN(parsedBudget) || parsedBudget < 0) {
      Alert.alert("Errore", "Inserisci un numero valido e maggiore o uguale a 0");
      return;
    }

    try {
      setIsSaving(true);
      // Esegue la query su Supabase
      await updateBudget(dept.id, parsedBudget);
      // Ricarica la Dashboard con i nuovi valori aggiornati
      await onBudgetUpdated();
      Alert.alert("Successo", "Budget modificato con successo!");
    } catch (error: any) {
      console.error("Errore salvataggio budget:", error);
      Alert.alert("Errore", "Impossibile aggiornare il database. Controlla le policy RLS.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={[styles.mainCard, { backgroundColor: theme.card }]}>
      
      {/* Header dell'accordion */}
      <Pressable style={styles.accordionHeader} onPress={onPressHeader}>
        <View style={styles.headerLeft}>
          <View style={[styles.iconBadge, { backgroundColor: theme.tint + "10" }]}>
            <Ionicons name="business" size={14} color={theme.tint} />
          </View>
          <Text style={[styles.deptName, { color: theme.text }]}>{dept.name}</Text>
        </View>

        <View style={styles.headerRight}>
          <Text style={[styles.headerAvailableValue, { color: statusColor }]}>
            €{dept.availableBudget.toLocaleString('it-IT', { minimumFractionDigits: 0 })}
          </Text>
          <Ionicons 
            name={isExpanded ? "chevron-up" : "chevron-down"} 
            size={16} 
            color={theme.secondaryText} 
          />
        </View>
      </Pressable>

      {/* Contenuto espandibile */}
      {isExpanded && (
        <View style={styles.dropdownContent}>
          
          <View style={[styles.availableContainer, { backgroundColor: statusColor + "10", borderColor: statusColor + "30" }]}>
            <Text style={[styles.availableLabel, { color: theme.secondaryText }]}>AVAILABLE BUDGET</Text>
            <Text style={[styles.availableValue, { color: statusColor }]}>
              €{dept.availableBudget.toLocaleString('it-IT', { minimumFractionDigits: 0 })}
            </Text>
          </View>

          <View style={styles.spendingGrid}>
            <View style={[styles.spendingItem, { backgroundColor: theme.background }]}>
              <Text style={[styles.spendingLabel, { color: theme.secondaryText }]}>PLANNED (LIMIT)</Text>
              <Text style={[styles.spendingValue, { color: theme.text }]}>
                €{dept.plannedBudget.toLocaleString('it-IT', { minimumFractionDigits: 0 })}
              </Text>
            </View>
            
            <View style={[styles.spendingItem, { backgroundColor: theme.background }]}>
              <Text style={[styles.spendingLabel, { color: theme.secondaryText }]}>EFFECTIVE (SPENT)</Text>
              <Text style={[styles.spendingValue, { color: theme.text }]}>
                €{dept.effectiveSpent.toLocaleString('it-IT', { minimumFractionDigits: 0 })}
              </Text>
            </View>
          </View>

          {/* Form per la modifica del budget aziendale */}
          <View style={[styles.editBudgetForm, { borderTopColor: theme.background }]}>
            <TextInput
              style={[styles.budgetTextInput, { backgroundColor: theme.background, color: theme.text, borderColor: theme.background }]}
              value={budgetInput}
              onChangeText={setBudgetInput}
              keyboardType="numeric"
              placeholder="Nuovo Budget €"
              placeholderTextColor={theme.secondaryText}
            />
            <Pressable 
              style={[styles.saveButton, { backgroundColor: theme.tint }]} 
              onPress={handleSaveBudget}
              disabled={isSaving}
            >
              {isSaving ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <Text style={styles.saveButtonText}>Aggiorna</Text>
              )}
            </Pressable>
          </View>

        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginBottom: 8 },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "800",
    marginBottom: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    opacity: 0.7
  },
  mainCard: { 
    borderRadius: 20, 
    marginBottom: 10, 
    shadowColor: "#000", 
    shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.03, 
    shadowRadius: 10, 
    elevation: 2,
    overflow: "hidden" 
  },
  emptyCard: { borderRadius: 20, padding: 20, alignItems: 'center', marginBottom: 12 },
  accordionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 14 },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconBadge: { padding: 6, borderRadius: 8 },
  deptName: { fontSize: 14, fontWeight: '800' },
  headerAvailableValue: { fontSize: 14, fontWeight: '800' },
  dropdownContent: {
    paddingHorizontal: 14,
    paddingBottom: 14,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: '#00000005'
  },
  availableContainer: { padding: 12, borderRadius: 14, borderWidth: 1, marginBottom: 10, alignItems: 'center' },
  availableLabel: { fontSize: 8, fontWeight: '800', letterSpacing: 0.5, marginBottom: 2 },
  availableValue: { fontSize: 20, fontWeight: '900' },
  spendingGrid: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  spendingItem: { flex: 1, padding: 10, borderRadius: 12, alignItems: 'center' },
  spendingLabel: { fontSize: 8, fontWeight: '700', marginBottom: 4, opacity: 0.6 },
  spendingValue: { fontSize: 13, fontWeight: '800' },
  
  // Stili del form input
  editBudgetForm: { flexDirection: 'row', gap: 8, borderTopWidth: 1, paddingTop: 12, alignItems: 'center' },
  budgetTextInput: { flex: 1, height: 40, borderRadius: 10, borderWidth: 1, paddingHorizontal: 12, fontSize: 14, fontWeight: '600' },
  saveButton: { height: 40, paddingHorizontal: 16, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  saveButtonText: { color: '#FFF', fontSize: 13, fontWeight: '700' }
});