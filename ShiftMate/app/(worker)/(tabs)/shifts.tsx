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

  // Recuperiamo i dati dall'hook
  const { shifts, myBusinessShifts, loading, refreshing, isGuest, refresh, myApplications } = useLoadShiftsBoard();
  const { activeTab, setActiveTab, displayedShifts, myShiftsCount } = useClientSideFiltering(shifts, myBusinessShifts, myApplications);

  // Un utente è un "Candidate" (esterno) se è loggato (!isGuest) MA non ha turni aziendali/collegamenti ad aziende
  // Puoi anche passare direttamente una variabile 'role' dal tuo hook se preferisci
  const isCandidate = !isGuest && myBusinessShifts.length === 0;

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
            
            {/* Se è un Guest o un Candidate esterno, nascondiamo la TabSelector o la limitiamo */}
            {!isGuest && !isCandidate && (
              <TabSelector 
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                totalGlobal={shifts.length}
                totalMine={myShiftsCount} // Turni della sua azienda (Worker)
                totalApplications={myApplications.length} // Le sue candidature
              />
            )}

            {/* Opzionale: Se è un Candidate, puoi mostrare una TabSelector semplificata senza la Tab aziendale */}
            {isCandidate && (
              <TabSelector 
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                totalGlobal={shifts.length}
                totalMine={0} // Sarà nascosto o disattivato dentro il componente TabSelector
                totalApplications={myApplications.length}
                hideWorkplaceTab={true} // Se il tuo TabSelector accetta questa prop per nascondere il bottone
              />
            )}
          </>
        )}
        renderItem={({ item }) => {
          // Cerchiamo la candidatura controllando l'ID del turno relazionato in modo sicuro
          const application = myApplications.find(
            (app: any) => String(app.shift_id || app.shifts?.id) === String(item.id)
          );          
          
          // Estraiamo lo status normalizzato dal DB
          const appStatus = application?.status?.toLowerCase();

          const isConfirmed = appStatus === 'accepted';
          const isPending = appStatus === 'applied';
          const isRejected = appStatus === 'rejected';

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
  container: { flex: 1, backgroundColor: '#FFFFFF', paddingTop: 50 },
  listContent: { paddingHorizontal: 24 },
  columnWrapper: {
    justifyContent: "space-between",
    marginBottom: 16,
  }
});