import { supabase } from "@/lib/supabase";

// --- HELPERS ---
// Genera una stringa YYYY-MM-DD basata sul fuso orario locale del telefono, non UTC!
const getLocalTodayDate = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

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
    .select(`
      *,
      departments ( name ),
      businesses ( name )
    `)
    .eq("status", "open")
    .eq("business_id", businessId)
    .gte("shift_date", getLocalTodayDate()) // FIX: Usa la data locale corretta
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
      business_id,
      title, 
      shift_date, 
      start_time, 
      end_time, 
      image_url, 
      hourly_rate, 
      total_pay,
      department_id,
      businesses (
        id,
        name
      ),
      departments (
        name
      )
    `) // FIX: Sostituito 'department' con 'department_id' e aggiunta la relazione 'departments'
    .eq("status", "open")
    .gte("shift_date", getLocalTodayDate()) // FIX: Data locale stabile
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
      ),
      departments (
        name
      )
    `) // FIX: Estrae anche il nome del reparto invece dell'UUID grezzo per la UI del worker
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
        status: "applied", // Coerente con il check constraint del DB
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
        image_url,
        businesses ( name )
      )
    `) // Ottimizzato: Estrae anche il nome del locale direttamente per la lista "I miei turni"
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

export const deleteWorkerAccount = async () => {
  const { data, error } = await supabase.functions.invoke('delete-self');
  
  if (error) throw error;
  
  await supabase.auth.signOut();
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
    .update({ 
      is_archived: true,
      is_read: true
    })
    .eq("id", notificationId);

  if (error) throw error;
  return true;
};

export const cancelApplication = async (applicationId: string) => {
  const { error } = await supabase
    .from("applications")
    .delete()
    .eq("id", applicationId);

  if (error) throw error;
  return true;
};