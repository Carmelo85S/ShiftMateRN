import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface TabSelectorProps {
  activeTab: 'all' | 'mine' | 'applications';
  setActiveTab: (tab: 'all' | 'mine' | 'applications') => void;
  totalGlobal: number;
  totalMine: number;
  totalApplications: number;
}

export const TabSelector = ({ 
  activeTab, 
  setActiveTab, 
  totalGlobal, 
  totalMine,
  totalApplications
}: TabSelectorProps) => {
  return (
    <View style={styles.tabsContainer}>
      {/* Tab Global */}
      <TabItem 
        label="Global" 
        icon="globe-outline"
        count={totalGlobal}
        active={activeTab === 'all'}
        onPress={() => setActiveTab('all')}
      />
      
      {/* Tab Workplace */}
      <TabItem 
        label="Work" 
        icon="business-outline"
        count={totalMine}
        active={activeTab === 'mine'}
        onPress={() => setActiveTab('mine')}
      />

      {/* Tab Applied */}
      <TabItem 
        label="Applied" 
        icon="checkmark-circle-outline"
        count={totalApplications}
        active={activeTab === 'applications'}
        onPress={() => setActiveTab('applications')}
      />
    </View>
  );
};

const TabItem = ({ label, icon, count, active, onPress }: any) => (
  <Pressable 
    style={[styles.tabButton, active && styles.activeTab]}
    onPress={onPress}
  >
    <Ionicons 
      name={icon} 
      size={16} 
      color={active ? "#FFF" : "#64748B"} 
      style={{ marginBottom: 2 }}
    />
    <Text style={[styles.tabText, active && styles.activeTabText]}>
      {label}
    </Text>
    <View style={[styles.badge, { backgroundColor: active ? 'rgba(255,255,255,0.2)' : '#E2E8F0' }]}>
      <Text style={[styles.badgeText, { color: active ? '#FFF' : '#64748B' }]}>
        {count}
      </Text>
    </View>
  </Pressable>
);

const styles = StyleSheet.create({
  tabsContainer: {flexDirection: 'row',backgroundColor: '#F1F5F9',borderRadius: 20,padding: 6,marginBottom: 20,marginTop: 10,gap: 4,},
  tabButton: {flex: 1,flexDirection: 'column',paddingVertical: 8,alignItems: 'center',justifyContent: 'center',borderRadius: 14,},
  activeTab: {backgroundColor: '#0F172A',elevation: 4,shadowColor: '#000',shadowOffset: { width: 0, height: 2 },shadowOpacity: 0.15,shadowRadius: 4,},
  tabText: {fontSize: 10,fontWeight: '800',color: '#64748B',textTransform: 'uppercase',},
  activeTabText: {color: '#FFFFFF',},
  badge: {position: 'absolute',top: 4,right: 4,paddingHorizontal: 5,paddingVertical: 1,borderRadius: 8,minWidth: 18,alignItems: 'center',},
  badgeText: {fontSize: 9,fontWeight: '900'}
});