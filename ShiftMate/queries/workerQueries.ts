import { supabase } from "@/lib/supabase";

// --- BOARD & SHIFTS ---

/**
 * Fetch worker profile and associated business details
 */
export const getWorkerBusinessData = async (userId: string) => {
  const { data, error } = await supabase
    .from("profiles")
    .select(`
      business_id, 
      businesses (
        name
      )
    `)
    .eq("id", userId)
    .single();

  if (error) throw error;
  return data;
};

/**
 * Fetch available shifts specifically for the worker's assigned business
 */
export const fetchAvailableShifts = async (businessId: string) => {
  const { data, error } = await supabase
    .from("shifts")
    .select("*")
    .eq("status", "open")
    .eq("business_id", businessId)
    .gte("shift_date", new Date().toISOString().split("T")[0])
    .order("shift_date", { ascending: true });

  if (error) throw error;
  return data || [];
};

/**
 * Fetch ALL open shifts (Global Marketplace View for Guests & Workers)
 */
export const fetchGlobalShifts = async () => {
  const { data, error } = await supabase
    .from("shifts")
    .select(`
      id, 
      title, 
      shift_date, 
      start_time, 
      end_time, 
      image_url, 
      hourly_rate, 
      total_pay,
      department,
      businesses (
        name
      )
    `)
    .eq("status", "open")
    .gte("shift_date", new Date().toISOString().split("T")[0])
    .order("shift_date", { ascending: true });

  if (error) throw error;
  return data || [];
};

/**
 * Fetch single shift details with business info
 * Public access (Guest friendly)
 */
export const fetchShiftDetails = async (shiftId: string) => {
  const { data, error } = await supabase
    .from("shifts")
    .select(`
      *,
      businesses (
        name
      )
    `)
    .eq("id", shiftId)
    .single();

  if (error) throw error;
  return data;
};

// --- APPLICATIONS ---

/**
 * Submit a new application for a shift
 */
export const applyForShift = async (userId: string, shiftId: string) => {
  const { error } = await supabase
    .from("applications")
    .insert([
      {
        profile_id: userId,
        shift_id: shiftId,
        status: "applied", // Matching your DB check constraint
      },
    ]);

  if (error) throw error;
  return true;
};

/**
 * Check if a worker has already applied for a specific shift
 */
export const checkApplicationStatus = async (userId: string, shiftId: string) => {
  const { data, error } = await supabase
    .from("applications")
    .select("status")
    .eq("profile_id", userId)
    .eq("shift_id", shiftId)
    .maybeSingle();

  if (error) throw error;
  return data;
};

/**
 * Fetch all shifts the worker has applied for
 */
export const fetchMyApplications = async (userId: string) => {
  const { data, error } = await supabase
    .from("applications")
    .select(`
      id,
      status,
      created_at,
      shifts (
        id,
        title,
        shift_date,
        start_time,
        end_time,
        image_url
      )
    `)
    .eq("profile_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
};

// --- PROFILES ---

export const fetchWorkerProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, name, surname, job_role, bio, avatar_url")
    .eq("id", userId)
    .single();

  if (error) throw error;
  return data;
};

// --- NOTIFICATIONS ---

export const fetchWorkerNotifications = async (userId: string) => {
  const { data, error } = await supabase
    .from('notifications')
    .select('id, title, message, type, created_at, is_read, shift_id')
    .eq('profile_id', userId)
    .eq("is_archived", false)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
};

export const markNotificationAsRead = async (notificationId: string) => {
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', notificationId);

  if (error) throw error;
  return true;
};

export const markAllNotificationsAsRead = async (userId: string) => {
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('profile_id', userId)
    .eq('is_read', false);

  if (error) throw error;
  return true;
};

export const archiveNotification = async (notificationId: string) => {
  const { error } = await supabase
    .from("notifications")
    .update({ is_archived: true })
    .eq("id", notificationId);

  if (error) throw error;
  return true;
};