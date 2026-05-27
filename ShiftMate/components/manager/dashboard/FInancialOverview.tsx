import React, { useState, useEffect } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  Pressable, 
  LayoutAnimation, 
  Platform, 
  UIManager, 
  TextInput, 
  ActivityIndicator, 
  Alert 
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { updateBudget } from "@/queries/managerQueries";
import { router } from "expo-router";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// Interfacce dati per entrambi i modelli aziendali
interface DepartmentStat { id: string; name: string; plannedBudget: number; effectiveSpent: number; availableBudget: number; }
interface ClientStat { id: string; name: string; revenue: number; }

interface Props { 
  stats: { 
    departments?: DepartmentStat[]; 
    clients?: ClientStat[];        // Staffing
    pendingCount?: number;
    totalMonthlyRevenue?: number;  // Staffing
  }; 
  theme: any; 
  refreshDashboard: () => Promise<void> | void; 
  isHistory?: boolean; 
  businessType?: "standard" | "staffing"; // business type
}

interface DepartmentCardProps {
  dept: DepartmentStat;
  theme: any;
  isExpanded: boolean;
  isHistory?: boolean;
  onPressHeader: () => void;
  onBudgetUpdated: () => Promise<void> | void;
}

export const FinancialOverview = ({ 
  stats, 
  theme, 
  refreshDashboard, 
  isHistory = false, 
  businessType = "standard" 
}: Props) => {
  const [expandedId, setExpandedId] = useState<string | null>(stats.departments?.[0]?.id || null);

  // ==========================================
  // 🌟 RENDERING PER STAFFING AGENCY (STAFFING)
  // ==========================================
  if (businessType === "staffing") {
    const clients = stats.clients || [];
    const totalRevenue = stats.totalMonthlyRevenue || 0;

    if (isHistory && totalRevenue === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="analytics-outline" size={48} color={theme.text} style={{ opacity: 0.1 }} />
          <Text style={[styles.emptyText, { color: theme.text }]}>No revenue recorded for this month.</Text>
        </View>
      );
    }

    return (
      <View style={styles.container}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Monthly Revenue</Text>
        
        {/* KPI Card principale dell'agenzia */}
        <View style={[styles.staffingTotalCard, { backgroundColor: theme.text }]}>
          <Text style={[styles.staffingTotalLabel, { color: theme.background }]}>TOTAL REVENUE (THIS MONTH)</Text>
          <Text style={[styles.staffingTotalValue, { color: theme.background }]}>
            {totalRevenue.toLocaleString('sv-SE')} SEK
          </Text>
        </View>

        <Text style={[styles.sectionSubtitle, { color: theme.text }]}>Revenue per Client</Text>

        {clients.length === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Ionicons name="people-outline" size={32} color={theme.text} style={{ opacity: 0.2, marginBottom: 8 }} />
            <Text style={[styles.emptyText, { color: theme.secondaryText }]}>No active clients found this month.</Text>
          </View>
        ) : (
          clients.map((client) => (
            <View key={client.id} style={[styles.clientRowCard, { backgroundColor: theme.card }]}>
              <View style={styles.headerLeft}>
                <View style={[styles.iconBadge, { backgroundColor: theme.tint + "10" }]}>
                  <Ionicons name="briefcase-outline" size={16} color={theme.tint} />
                </View>
                <Text style={[styles.deptName, { color: theme.text }]}>{client.name}</Text>
              </View>
              <Text style={[styles.clientRevenueValue, { color: theme.text }]}>
                {client.revenue.toLocaleString('sv-SE')} SEK
              </Text>
            </View>
          ))
        )}
      </View>
    );
  }

  // ==========================================
  // 🌟 RENDERING PER RISTORANTE (STANDARD)
  // ==========================================
  const departments = stats.departments || [];
  const totalSpentInMonth = departments.reduce((acc, dept) => acc + (dept.effectiveSpent || 0), 0);

  if (isHistory && totalSpentInMonth === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="calendar-outline" size={48} color={theme.text} style={{ opacity: 0.1 }} />
        <Text style={[styles.emptyText, { color: theme.text }]}>No financial expanses recorded for this month.</Text>
      </View>
    );
  }

  if (departments.length === 0) {
    return (
      <View style={[styles.emptyCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <Ionicons name="home-outline" size={48} color={theme.text} style={{ opacity: 0.1 }} />
        <Text style={[styles.emptyText, { color: theme.secondaryText }]}>No departments found.</Text>
        {!isHistory && (
          <Pressable 
            style={({ pressed }) => [
              styles.btnComplete, 
              { backgroundColor: theme.text }, 
              pressed && { opacity: 0.8 }
            ]}
            onPress={() => router.replace('/(manager)/(tabs)/create/createDepartment')}
          >
            <Text style={[styles.btnText, { color: theme.background }]}>Create department</Text>
          </Pressable>
        )}
      </View>
    );
  }

  // ... da qui in poi il codice con la funzione toggleExpand e il return dei dipartimenti rimane identico

  const toggleExpand = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.sectionTitle, { color: theme.text }]}>Department Budgets</Text>
      {departments.map((dept) => (
        <DepartmentCard 
          key={dept.id}
          dept={dept}
          theme={theme}
          isExpanded={expandedId === dept.id}
          isHistory={isHistory}
          onPressHeader={() => toggleExpand(dept.id)}
          onBudgetUpdated={refreshDashboard}
        />
      ))}
    </View>
  );
};

// Componente Card Dipartimento per Ristoranti (Preservato intatto)
const DepartmentCard = ({ dept, theme, isExpanded, isHistory = false, onPressHeader, onBudgetUpdated }: DepartmentCardProps) => {
  const [budgetInput, setBudgetInput] = useState<string>(Math.round(dept.plannedBudget).toString());
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false); 

  useEffect(() => {
    setBudgetInput(Math.round(dept.plannedBudget).toString());
  }, [dept.plannedBudget]);

  const isNegative = dept.availableBudget < 0;
  const spentPercentage = dept.plannedBudget > 0 ? Math.min((dept.effectiveSpent / dept.plannedBudget) * 100, 100) : 100;

  let statusColor = "#34C759"; 
  if (spentPercentage >= 90 || isNegative) statusColor = "#FF3B30"; 
  else if (spentPercentage >= 70) statusColor = "#FF9500"; 

  const handleSaveBudget = async () => {
    const parsedBudget = parseFloat(budgetInput);
    if (isNaN(parsedBudget) || parsedBudget < 0) {
      Alert.alert("Errore", "Insert a valid number.");
      return;
    }
    try {
      setIsSaving(true);
      await updateBudget(dept.id, parsedBudget);
      await onBudgetUpdated();
      setIsEditing(false); 
    } catch (error) {
      Alert.alert("Errore", "Impossible update database.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={[styles.mainCard, { backgroundColor: theme.card }]}>
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

      {isExpanded && (
        <View style={styles.dropdownContent}>
          <View style={styles.progressContainer}>
            <View style={styles.progressLabelRow}>
              <Text style={[styles.spendingLabel, { color: theme.secondaryText }]}>SPENDING PROGRESS</Text>
              <Text style={[styles.progressPercentText, { color: statusColor }]}>{Math.round(spentPercentage)}%</Text>
            </View>
            <View style={[styles.progressBarTrack, { backgroundColor: theme.background }]}>
              <View style={[styles.progressBarFill, { width: `${spentPercentage}%`, backgroundColor: statusColor }]} />
            </View>
          </View>

          <View style={styles.spendingGrid}>
            <View style={[styles.spendingItem, { backgroundColor: theme.background }]}>
              <View style={styles.labelWithIcon}>
                <Text style={[styles.spendingLabel, { color: theme.secondaryText }]}>PLANNED (LIMIT)</Text>
                {!isHistory && (
                  <Pressable onPress={() => { LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut); setIsEditing(!isEditing); }}>
                    <Ionicons name="create-outline" size={20} color={theme.tint} style={{ marginLeft: 4 }} />
                  </Pressable>
                )}
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

          {isEditing && !isHistory && (
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

export default FinancialOverview;

const styles = StyleSheet.create({
  container: { marginBottom: 8 },
  sectionTitle: { fontSize: 13, fontWeight: "800", marginBottom: 12, textTransform: "uppercase", letterSpacing: 0.5, opacity: 0.7 },
  sectionSubtitle: { fontSize: 11, fontWeight: "800", marginTop: 14, marginBottom: 10, textTransform: "uppercase", letterSpacing: 0.5, opacity: 0.5 },
  mainCard: { borderRadius: 20, marginBottom: 10, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 10, elevation: 2, overflow: "hidden" },
  emptyCard: { marginVertical: 16, padding: 24, borderRadius: 16, alignItems: "center", justifyContent: "center", borderWidth: 1 },
  emptyText: { fontSize: 14, opacity: 0.4, marginVertical: 12, fontWeight: "600", textAlign: "center" },
  btnComplete: { height: 40, paddingHorizontal: 24, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  btnText: { fontSize: 13, fontWeight: '700' },
  accordionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 14 },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconBadge: { padding: 6, borderRadius: 8 },
  deptName: { fontSize: 14, fontWeight: '800' },
  headerAvailableValue: { fontSize: 14, fontWeight: '800' },
  dropdownContent: { paddingHorizontal: 14, paddingBottom: 14, paddingTop: 4 },
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
  emptyContainer: { marginTop: 60, alignItems: "center" },
  editBudgetForm: { flexDirection: 'row', gap: 8, borderTopWidth: 1, paddingTop: 12, marginTop: 12, alignItems: 'center' },
  budgetTextInput: { flex: 1, height: 38, borderRadius: 8, borderWidth: 1, paddingHorizontal: 12, fontSize: 13, fontWeight: '600' },
  saveButton: { height: 38, paddingHorizontal: 16, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  saveButtonText: { color: '#FFF', fontSize: 12, fontWeight: '700' },
  
  // 🌟 DESIGN DEDICATO ALLA STAFFING AGENCY
  staffingTotalCard: { padding: 20, borderRadius: 22, marginBottom: 10, shadowColor: "#000", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.05, shadowRadius: 12, elevation: 3 },
  staffingTotalLabel: { fontSize: 9, fontWeight: "700", letterSpacing: 0.5, opacity: 0.6, marginBottom: 4 },
  staffingTotalValue: { fontSize: 24, fontWeight: "800", letterSpacing: -0.5 },
  clientRowCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderRadius: 20, marginBottom: 8, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.01, shadowRadius: 5, elevation: 1 },
  clientRevenueValue: { fontSize: 14, fontWeight: '800' }
});