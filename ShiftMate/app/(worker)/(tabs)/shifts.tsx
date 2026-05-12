import React from "react";
import { 
  FlatList, 
  StyleSheet, 
  View, 
  RefreshControl,
  StatusBar,
  Dimensions
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "@/constants/theme";

// Componenti Custom
import { ShiftCard } from "@/components/shared/shiftCard/ShiftCard";
import { ShiftsHeader } from "@/components/worker/shifts/ShiftsHeader";
import { EmptyShifts } from "@/components/worker/shifts/EmptyShifts";
import { TabSelector } from "@/components/worker/shifts/TabSelector";

// Hooks
import { useLoadShiftsBoard } from "@/hooks/worker/shifts/useLoadShiftsBoard";
import { useClientSideFiltering } from "@/hooks/worker/shifts/useClientSideFiltering";

const { width } = Dimensions.get("window");

export default function WorkerShifts() {
  const theme = Colors.light;
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const { shifts, myBusinessShifts, loading, refreshing, isGuest, refresh, myApplications } = useLoadShiftsBoard();
  const { activeTab, setActiveTab, displayedShifts, myShiftsCount } = useClientSideFiltering(shifts, myBusinessShifts, myApplications);
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />      
      <FlatList
        data={displayedShifts}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.listContent, 
          { paddingTop: insets.top + 20, paddingBottom: 120 }
        ]}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={() => refresh?.()} 
            tintColor={theme.tint} 
          />
        }
        ListHeaderComponent={() => (
          <>
            <ShiftsHeader 
              isGuest={isGuest} 
              theme={theme} 
              router={router} 
              totalAvailable={displayedShifts.length}
            />
            
            {/* Solo gli utenti loggati (Worker/Candidate) vedono il selettore Tab */}
            {!isGuest && (
              <TabSelector 
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                totalGlobal={shifts.length}
                totalMine={myShiftsCount} // Turni della tua azienda
                totalApplications={myApplications.length} // Le tue candidature
              />
            )}
          </>
        )}

renderItem={({ item }) => {
  // Cerchiamo l'applicazione corrispondente
  const application = myApplications.find(app => String(app.id) === String(item.id));
  
  // Confirmed se lo status dell'APPLICAZIONE è accepted
  const isConfirmed = application?.application_status === 'accepted';
  
  // Pending se lo status dell'APPLICAZIONE è applied
  const isPending = application?.application_status === 'applied';

  // Rejected if status is rejected
  const isRejected = application?.application_status === 'rejected'

  const isMyBusiness = myBusinessShifts.some(s => s.id === item.id);

  return (
      <ShiftCard 
        item={item} 
        variant="worker"
        isApplied={isConfirmed} 
        isPending={isPending}
        isRejected={isRejected}
        onPress={() => router.push(`/(worker)/shift/${item.id}`)} 
      />
        );
      }}
        ListEmptyComponent={() => (
          <EmptyShifts loading={loading} activeTab={activeTab} theme={theme} />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  bgCircle: {
    position: 'absolute',
    width: width * 0.7,
    height: width * 0.7,
    borderRadius: width * 0.35,
    backgroundColor: '#F8FAFC',
    zIndex: -1,
  },
  listContent: { paddingHorizontal: 24 },
  columnWrapper: {
    justifyContent: "space-between",
    marginBottom: 16,
  }
});