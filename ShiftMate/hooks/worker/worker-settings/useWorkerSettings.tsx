import { useState } from "react";

export const useWorkerSettings = () => {
  const [notifications, setNotifications] = useState(true);
  const [newShiftAlerts, setNewShiftAlerts] = useState(true);

  const toggleNotifications = () => setNotifications(prev => !prev);
  const toggleShiftAlerts = () => setNewShiftAlerts(prev => !prev);

  const contactSupport = () => {
    console.log("Contacting support...");
  };

  return {
    notifications,
    newShiftAlerts,
    toggleNotifications,
    toggleShiftAlerts,
    contactSupport,
  };
};