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
  View
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
  revenue: number;
}

interface Props {
  stats: {
    departments?: DepartmentStat[];
    clients?: ClientStat[];
    pendingCount?: number;
    totalMonthlyRevenue?: number;
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
    const clients = (stats.clients || []).filter((c) => c.name?.trim());
    const filteredClients = clients.filter((c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()),
    );
    const totalRevenue =
      stats.totalMonthlyRevenue ||
      clients.reduce((acc, c) => acc + c.revenue, 0);

    return (
      <View style={styles.container}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          Monthly Revenue
        </Text>
        <View
          style={[styles.staffingTotalCard, { backgroundColor: theme.text }]}
        >
          <Text
            style={[styles.staffingTotalLabel, { color: theme.background }]}
          >
            TOTAL REVENUE
          </Text>
          <Text
            style={[styles.staffingTotalValue, { color: theme.background }]}
          >
            {totalRevenue.toLocaleString("sv-SE")} SEK
          </Text>
        </View>

        <Text style={[styles.sectionSubtitle, { color: theme.text }]}>
          Clients Overview
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
                    style={[styles.clientRevenueValue, { color: theme.text }]}
                  >
                    {item.revenue.toLocaleString("sv-SE")} SEK
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
  container: { marginBottom: 20 },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "800",
    marginBottom: 12,
    opacity: 0.6,
    letterSpacing: 0.5,
  },
  sectionSubtitle: {
    fontSize: 11,
    fontWeight: "800",
    marginTop: 14,
    marginBottom: 8,
    opacity: 0.5,
  },
  mainCard: { borderRadius: 20, marginBottom: 10, padding: 4 },
  accordionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 14,
    alignItems: "center",
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  iconBadge: { padding: 8, borderRadius: 10 },
  deptName: { fontSize: 14, fontWeight: "800" },
  clientRowCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 16,
    marginBottom: 8,
  },
  clientRevenueValue: { fontWeight: "800" },
  staffingTotalCard: { padding: 20, borderRadius: 20, marginBottom: 15 },
  staffingTotalLabel: { fontSize: 10, fontWeight: "700", opacity: 0.6 },
  staffingTotalValue: { fontSize: 28, fontWeight: "900", marginTop: 4 },
  modalContainer: { flex: 1, padding: 20, paddingTop: 40 },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  modalTitle: { fontSize: 22, fontWeight: "800" },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    marginBottom: 15,
  },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 14 },
});
