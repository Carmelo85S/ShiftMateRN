import { useState, useMemo } from "react";

// Define the shape to match what ShiftCard expects
interface Shift {
  id: string;
  business_id: string;
  title: string;
  shift_date: string;
  start_time: string;
  end_time: string;
  image_url: string | null;
  total_pay?: number;
  hourly_rate?: number;
  department?: string;
}


export const useClientSideFiltering = (shifts: Shift[], myBusinessId: string | null) => {
  const [activeTab, setActiveTab] = useState<'all' | 'mine'>('all');

  const displayedShifts = useMemo(() => {
    if (activeTab === 'mine' && myBusinessId) {
      return shifts.filter(shift => shift.business_id === myBusinessId);
    }
    return shifts;
  }, [shifts, activeTab, myBusinessId]);

  const myShiftsCount = useMemo(() => 
    shifts.filter(s => s.business_id === myBusinessId).length, 
  [shifts, myBusinessId]);

  return {
    activeTab,
    setActiveTab,
    displayedShifts,
    myShiftsCount
  };
};