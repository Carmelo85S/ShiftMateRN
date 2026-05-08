import { useState, useMemo } from "react";
import { Platform } from "react-native";

export const useShiftForm = (initialData?: any) => {
  const defaultDate = new Date();
  const defaultStart = new Date();
  defaultStart.setHours(9, 0, 0, 0); // Default 09:00
  const defaultEnd = new Date();
  defaultEnd.setHours(17, 0, 0, 0); // Default 17:00

  const [form, setForm] = useState({
    title: initialData?.title || "",
    description: initialData?.description || "",
    department: initialData?.department || "",
    industry: "hospitality",
    hourly_rate: initialData?.hourly_rate?.toString() || "",
    shift_date: initialData?.shift_date ? new Date(initialData.shift_date) : defaultDate,
    start_time: initialData?.start_time ? new Date(initialData.start_time) : defaultStart,
    end_time: initialData?.end_time ? new Date(initialData.end_time) : defaultEnd,
  });

  const [picker, setPicker] = useState({
    show: false,
    mode: 'date' as 'date' | 'time',
    target: '' as 'shift_date' | 'start_time' | 'end_time' 
  });

  
  const { hourly_rate, start_time, end_time } = form;

const estimatedEarnings = useMemo(() => {
  const cleanRate = hourly_rate.replace(',', '.');
  const rate = parseFloat(cleanRate);

  if (isNaN(rate) || rate <= 0 || !start_time || !end_time) {
    return "0.00";
  }

    // Extract hours and minutes from start and end times
    const startHours = form.start_time.getHours();
    const startMinutes = form.start_time.getMinutes();
    const endHours = form.end_time.getHours();
    const endMinutes = form.end_time.getMinutes();

    // Convert times to total minutes
    const startTotalMinutes = startHours * 60 + startMinutes;
    const endTotalMinutes = endHours * 60 + endMinutes;

    // Calculate difference in minutes
    let diffInMinutes = endTotalMinutes - startTotalMinutes;

    // Night shift handling
    if (diffInMinutes < 0) {
      diffInMinutes += 24 * 60; // Add a full day in minutes
    }

    const diffInHours = diffInMinutes / 60;
    
    return (rate * diffInHours).toFixed(2);
  }, [form.hourly_rate, form.start_time, form.end_time]);

  const onPickerChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') setPicker(prev => ({ ...prev, show: false }));
    if (selectedDate) {
      setForm(prev => ({ ...prev, [picker.target]: new Date(selectedDate) }));
    }
  };

  const openPicker = (mode: 'date' | 'time', target: 'shift_date' | 'start_time' | 'end_time') => {
    setPicker({ show: true, mode, target });
  };

  return { form, setForm, picker, setPicker, estimatedEarnings, onPickerChange, openPicker };
};