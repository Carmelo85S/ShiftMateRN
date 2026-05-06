import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";

interface TabSelectorProps {
  activeTab: 'all' | 'mine';
  setActiveTab: (tab: 'all' | 'mine') => void;
  totalGlobal: number;
  totalMine: number;
}

export const TabSelector = ({ 
  activeTab, 
  setActiveTab, 
  totalGlobal, 
  totalMine 
}: TabSelectorProps) => {
  return (
    <View style={styles.tabsContainer}>
      {/* Tab Global */}
      <Pressable 
        style={[styles.tabButton, activeTab === 'all' && styles.activeTab]}
        onPress={() => setActiveTab('all')}
      >
        <Text style={[styles.tabText, activeTab === 'all' && styles.activeTabText]}>
          Global ({totalGlobal})
        </Text>
      </Pressable>
      
      {/* Tab My Workplace */}
      <Pressable 
        style={[styles.tabButton, activeTab === 'mine' && styles.activeTab]}
        onPress={() => setActiveTab('mine')}
      >
        <Text style={[styles.tabText, activeTab === 'mine' && styles.activeTabText]}>
          My Workplace ({totalMine})
        </Text>
      </Pressable>
    </View>
  );
};


const styles = StyleSheet.create({
  tabsContainer: {flexDirection: 'row',gap: 12,marginBottom: 20,marginTop: 10, },
  tabButton: {paddingVertical: 10,paddingHorizontal: 20,borderRadius: 25,backgroundColor: '#F1F5F9',borderWidth: 1,borderColor: '#E2E8F0'},
  activeTab: {backgroundColor: '#0F172A', borderColor: '#0F172A'},
  tabText: {fontSize: 14,fontWeight: '700',color: '#64748B',},
  activeTabText: {color: '#FFFFFF'},
});