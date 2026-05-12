import { useState, useMemo } from "react";
import { Shift } from "./useLoadShiftsBoard";

export const useClientSideFiltering = (globalShifts: Shift[], myBusinessShifts: Shift[], myApplications: Shift[]) => {
  const [activeTab, setActiveTab] = useState<'all' | 'mine' | 'applications'>('all');

  const displayedShifts = useMemo(() => {
    if (activeTab === 'all') {
      return globalShifts;
    } else if (activeTab === 'mine') {
      return myBusinessShifts;
    } else if (activeTab === 'applications') {
      return myApplications;
    }
    return [];
  }, [activeTab, globalShifts, myBusinessShifts, myApplications]);

  return {
    activeTab,
    setActiveTab,
    displayedShifts,
    myShiftsCount: myBusinessShifts.length,
  };
};