import { Colors } from "@/constants/theme";
import { useRouter } from "expo-router";
import { 
  FlatList, 
  StyleSheet, 
  View, 
  ActivityIndicator, 
  RefreshControl,
  StatusBar,
  Dimensions
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ShiftCard } from "@/components/shared/shiftCard/ShiftCard";
import { useLoadShiftsBoard } from "@/hooks/worker/shifts/useLoadShiftsBoard";
import { useClientSideFiltering } from "@/hooks/worker/shifts/useClientSideFiltering";
import { ShiftsHeader } from "@/components/worker/shifts/ShiftsHeader";
import { EmptyShifts } from "@/components/worker/shifts/EmptyShifts";
import { TabSelector } from "@/components/worker/shifts/TabSelector";

const { width } = Dimensions.get("window");

export default function WorkerShifts() {
  const theme = Colors.light;
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const { shifts, loading, refreshing, isGuest, myBusinessId, refresh } = useLoadShiftsBoard();
  const { activeTab, setActiveTab, displayedShifts, myShiftsCount } = useClientSideFiltering(shifts, myBusinessId);

  const handleRefresh = () => {
    if (refresh) refresh();
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <View style={[styles.bgCircle, { top: -width * 0.1, right: -width * 0.1 }]} />
      
      <FlatList
        data={displayedShifts}
        keyExtractor={(item) => item.id}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.listContent, 
          { paddingTop: insets.top + 20, paddingBottom: 120 }
        ]}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={handleRefresh} 
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
            {!isGuest && myBusinessId && (
              <TabSelector 
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                totalGlobal={shifts.length}
                totalMine={myShiftsCount}
              />
            )}
          </>
        )}
        renderItem={({ item }) => (
          <View style={styles.cardContainer}>
            <ShiftCard 
              item={item} 
              variant="worker" 
              onPress={() => router.push(`/(worker)/shift/${item.id}`)} 
            />
          </View>
        )}
        ListEmptyComponent={() => (
          <EmptyShifts loading={loading} activeTab={activeTab} theme={theme} />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF', paddingTop: 50 },
  bgCircle: {
    position: 'absolute',
    width: width * 0.7,
    height: width * 0.7,
    borderRadius: width * 0.35,
    backgroundColor: '#F8FAFC',
    zIndex: -1,
  },
  listContent: { paddingHorizontal: 24 },
  cardContainer: { marginBottom: 16 },
});