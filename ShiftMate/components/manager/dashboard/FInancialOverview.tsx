import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  FlatList,
  LayoutAnimation,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  UIManager,
  View,
} from "react-native";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// Interfacce
interface DepartmentStat {
  id: string;
  name: string;
  plannedBudget: number;
  effectiveSpent: number;
  availableBudget: number;
}
interface ClientStat {
  id: string;
  name: string;
  payroll: number;
}

interface Props {
  stats: {
    departments?: DepartmentStat[];
    clients?: ClientStat[];
    pendingCount?: number;
    totalMonthlyPayroll?: number;
  };
  theme: any;
  refreshDashboard: () => Promise<void> | void;
  isHistory?: boolean;
  businessType?: "standard" | "staffing";
}

export const FinancialOverview = ({
  stats,
  theme,
  refreshDashboard,
  isHistory = false,
  businessType = "standard",
}: Props) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // LOGICA STAFFING
  if (businessType === "staffing") {
    console.log(
      "FinancialOverview stats ricevute:",
      JSON.stringify(stats, null, 2),
    );

    const clients = (stats.clients || []).filter((c) => c.name?.trim());
    const filteredClients = clients.filter((c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()),
    );
    const totalPayroll =
      stats.totalMonthlyPayroll ||
      clients.reduce((acc, c) => acc + c.payroll, 0);

    return (
      <View style={styles.container}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          Monthly Payroll
        </Text>
        <View
          style={[styles.staffingTotalCard, { backgroundColor: theme.text }]}
        >
          <Text
            style={[styles.staffingTotalLabel, { color: theme.background }]}
          >
            TOTAL PAYROLL
          </Text>
          <Text
            style={[styles.staffingTotalValue, { color: theme.background }]}
          >
            {totalPayroll.toLocaleString("sv-SE")} SEK
          </Text>
        </View>

        <Text style={[styles.sectionSubtitle, { color: theme.text }]}>
          Payroll by Client
        </Text>

        {/* Bottone che apre il Modal */}
        <Pressable
          style={[
            styles.clientRowCard,
            {
              backgroundColor: theme.card,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            },
          ]}
          onPress={() => setIsModalVisible(true)}
        >
          <View style={styles.headerLeft}>
            <View
              style={[styles.iconBadge, { backgroundColor: theme.tint + "10" }]}
            >
              <Ionicons name="list-outline" size={18} color={theme.tint} />
            </View>
            <Text style={[styles.deptName, { color: theme.text }]}>
              View all {clients.length} clients
            </Text>
          </View>
          <Ionicons
            name="chevron-forward"
            size={20}
            color={theme.secondaryText}
          />
        </Pressable>

        {/* Modal Lista Clienti */}
        <Modal
          visible={isModalVisible}
          animationType="slide"
          presentationStyle="pageSheet"
        >
          <View
            style={[
              styles.modalContainer,
              { backgroundColor: theme.background },
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>
                All Clients
              </Text>
              <Pressable onPress={() => setIsModalVisible(false)}>
                <Text style={{ color: theme.tint, fontWeight: "700" }}>
                  Close
                </Text>
              </Pressable>
            </View>

            <View style={[styles.searchBar, { backgroundColor: theme.card }]}>
              <Ionicons name="search" size={18} color={theme.secondaryText} />
              <TextInput
                style={[styles.searchInput, { color: theme.text }]}
                placeholder="Search..."
                placeholderTextColor={theme.secondaryText}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>

            <FlatList
              data={filteredClients}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View
                  style={[
                    styles.clientRowCard,
                    { backgroundColor: theme.card, marginBottom: 10 },
                  ]}
                >
                  <Text style={[styles.deptName, { color: theme.text }]}>
                    {item.name}
                  </Text>
                  <Text
                    style={[styles.clientPayrollValue, { color: theme.text }]}
                  >
                    {item.payroll.toLocaleString("sv-SE")} SEK
                  </Text>
                </View>
              )}
              ListEmptyComponent={
                <Text
                  style={{
                    textAlign: "center",
                    marginTop: 20,
                    color: theme.secondaryText,
                  }}
                >
                  No clients found.
                </Text>
              }
            />
          </View>
        </Modal>
      </View>
    );
  }

  // LOGICA STANDARD (Budget Dipartimenti)
  const departments = stats.departments || [];
  return (
    <View style={styles.container}>
      <Text style={[styles.sectionTitle, { color: theme.text }]}>
        Department Budgets
      </Text>
      {departments.map((dept) => (
        <View
          key={dept.id}
          style={[styles.mainCard, { backgroundColor: theme.card }]}
        >
          <Pressable
            style={styles.accordionHeader}
            onPress={() => {
              LayoutAnimation.configureNext(
                LayoutAnimation.Presets.easeInEaseOut,
              );
              setExpandedId(expandedId === dept.id ? null : dept.id);
            }}
          >
            <View style={styles.headerLeft}>
              <View
                style={[
                  styles.iconBadge,
                  { backgroundColor: theme.tint + "10" },
                ]}
              >
                <Ionicons name="business" size={14} color={theme.tint} />
              </View>
              <Text style={[styles.deptName, { color: theme.text }]}>
                {dept.name}
              </Text>
            </View>
            <Text
              style={{
                color: dept.availableBudget < 0 ? "#FF3B30" : "#34C759",
                fontWeight: "800",
              }}
            >
              €{dept.availableBudget.toLocaleString("it-IT")}
            </Text>
          </Pressable>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  // ─────────────────────────────
  // CONTAINER
  // ─────────────────────────────

  container: {
    marginBottom: 20,
  },

  // ─────────────────────────────
  // SECTION TITLES
  // ─────────────────────────────

  sectionTitle: {
    fontSize: 13,
    fontWeight: "800",
    marginBottom: 9,
    letterSpacing: 0.4,
    opacity: 0.65,
  },

  sectionSubtitle: {
    fontSize: 11,
    fontWeight: "800",
    marginTop: 14,
    marginBottom: 7,
    letterSpacing: 0.3,
    opacity: 0.5,
  },

  // ─────────────────────────────
  // DEPARTMENT BUDGETS
  // ─────────────────────────────

  mainCard: {
    borderRadius: 13,
    marginBottom: 6,
    overflow: "hidden",
  },

  accordionHeader: {
    minHeight: 52,
    paddingHorizontal: 11,
    paddingVertical: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  iconBadge: {
    width: 30,
    height: 30,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 9,
  },

  deptName: {
    fontSize: 12,
    fontWeight: "700",
  },

  // ─────────────────────────────
  // CLIENT ROW
  // ─────────────────────────────

  clientRowCard: {
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 11,
    paddingVertical: 8,
    borderRadius: 13,
    marginBottom: 6,
  },

  clientPayrollValue: {
    fontSize: 12,
    fontWeight: "800",
  },

  // ─────────────────────────────
  // STAFFING TOTAL REVENUE
  // ─────────────────────────────

  staffingTotalCard: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 14,
    marginBottom: 12,
  },

  staffingTotalLabel: {
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 0.8,
    opacity: 0.55,
  },

  staffingTotalValue: {
    fontSize: 24,
    fontWeight: "900",
    marginTop: 2,
  },

  // ─────────────────────────────
  // MODAL
  // ─────────────────────────────

  modalContainer: {
    flex: 1,
    paddingHorizontal: 18,
    paddingTop: 40,
  },

  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },

  modalTitle: {
    fontSize: 21,
    fontWeight: "800",
  },

  searchBar: {
    height: 42,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 11,
    borderRadius: 11,
    marginBottom: 12,
  },

  searchInput: {
    flex: 1,
    marginLeft: 7,
    fontSize: 13,
  },
});
