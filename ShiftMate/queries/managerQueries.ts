import { supabase } from "@/lib/supabase";

// --- HELPERS (Internals for earnings calculation) ---
const calculateTotalPay = (startTime: Date, endTime: Date, hourlyRate: string) => {
  const rate = parseFloat(hourlyRate) || 0;
  if (rate <= 0) return 0;

  let diffInMs = endTime.getTime() - startTime.getTime();
  
  // Night shift management (if it ends the next day)
  if (diffInMs < 0) {
    diffInMs += 24 * 60 * 60 * 1000; 
  }

  const diffInHours = diffInMs / (1000 * 60 * 60);
  return parseFloat((rate * diffInHours).toFixed(2));
};

// --- PROFILE & BUSINESS ---

export const getManagerProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from("profiles")
    .select("name, business_id")
    .eq("id", userId)
    .maybeSingle();
  
  if (error) throw error;
  return data;
};

export const countBusinessWorkers = async (businessId: string) => {
  const { count, error } = await supabase
    .from("profiles")
    .select("*", { count: 'exact', head: true })
    .eq("business_id", businessId)
    .eq("role", "worker");

  if (error) throw error;
  return count || 0;
};

export const createBusinessAndAssignOwner = async (userId: string, businessName: string, inviteCode: string, business_address: string, business_city: string) => {
  const { data: business, error: businessError } = await supabase
    .from("businesses")
    .insert([{ 
      name: businessName.trim(), 
      invite_code: inviteCode, 
      business_address: business_address.trim(),
      business_city: business_city.trim()
    }])
    .select()
    .single();

  if (businessError) throw businessError;

  const { error: profileError } = await supabase
    .from("profiles")
    .update({ business_id: business.id })
    .eq("id", userId);

  if (profileError) throw profileError;
  return { business, inviteCode };
};

// --- SHIFT MANAGEMENT ---

export const fetchManagerShifts = async (userId: string) => {
  const { data: shifts, error } = await supabase
    .from("shifts")
    .select(`
      id, title, shift_date, start_time, end_time, status, image_url, hourly_rate, total_pay, department_id,
      departments ( name )
    `) // AGGIORNATO: Prende il nome del reparto relazionato
    .eq("manager_id", userId)
    .order('shift_date', { ascending: true });

  if (error) throw error;
  return shifts || [];
};

export const createShift = async (
  userId: string, 
  imageUrl: string | null, 
  formData: {
    title: string;
    description: string;
    departmentId: string;
    date: string;         
    startTime: string;    
    endTime: string;      
    hourly_rate: number;  
  }
) => {
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("business_id")
    .eq("id", userId)
    .single();

  if (profileError || !profile?.business_id) {
    throw new Error("Your profile is not linked to a business.");
  }

  const { error: shiftError } = await supabase.from("shifts").insert([
    {
      title: formData.title,
      description: formData.description,
      department_id: formData.departmentId, 
      business_id: profile.business_id,
      shift_date: formData.date,
      start_time: formData.startTime,
      end_time: formData.endTime,
      image_url: imageUrl,
      hourly_rate: formData.hourly_rate,
      status: "open",
      created_by: userId,
      manager_id: userId,
    },
  ]);

  if (shiftError) throw shiftError;
  return true;
};

export const getShiftForEdit = async (shiftId: string) => {
  const {data, error} = await supabase
    .from("shifts")
    .select(`
      title, description, shift_date, start_time, end_time, image_url, hourly_rate, total_pay, department_id,
      departments ( name )
    `) // AGGIORNATO: Rimosso department text, aggiunto l'oggetto relazionato
    .eq("id", shiftId)
    .maybeSingle();

  if (error) throw error;
  return data;
};

export const updateShift = async (id: string, shiftData: {
  title: string;
  description: string;
  shift_date: string;     // AGGIORNATO: Riceve stringa formattata dall'hook per evitare crash TIME
  start_time: string;     // AGGIORNATO: Riceve stringa "HH:MM:SS"
  end_time: string;       // AGGIORNATO: Riceve stringa "HH:MM:SS"
  image_url: string | null;
  hourly_rate: number;    // AGGIORNATO: Riceve numero da Zod
  departmentId: string;   // AGGIORNATO: Accetta UUID reparto
}) => {
  const { error } = await supabase
    .from("shifts")
    .update({
      title: shiftData.title,
      description: shiftData.description,
      department_id: shiftData.departmentId, // AGGIORNATO: Mappa sulla colonna UUID reale
      shift_date: shiftData.shift_date,
      start_time: shiftData.start_time,
      end_time: shiftData.end_time,
      image_url: shiftData.image_url,
      hourly_rate: shiftData.hourly_rate,
      // Il total_pay si aggiornerà via trigger del DB dato che ascolta update di start_time/end_time/hourly_rate
    })
    .eq("id", id);

  if (error) throw error;
  return true;
};

/**
 * Chiude definitivamente un turno impostando l'orario reale di fine.
 * Questo sposterà il costo del turno dal budget "Planned" al budget "Effective".
 * * @param shiftId - L'UUID del turno da completare
 * @param actualEndTime - Stringa formattata come "HH:MM:SS" (es. "19:30:00")
 */
export const completeShiftWithActualTime = async (
  shiftId: string, 
  actualEndTime: string
) => {
  if (!shiftId) throw new Error("ID turno mancante nella query.");

  const { error } = await supabase
    .from("shifts")
    .update({ 
      end_time: actualEndTime,   // Aggiorna l'orario (il trigger del DB ricalcolerà il total_pay)
      status: "completed"         // Sposta il turno nello stato finale
    })
    .eq("id", shiftId);

  if (error) {
    console.error("Errore durante il completamento del turno su Supabase:", error);
    throw error;
  }
  
  return true;
};

export const fetchShiftFullDetails = async (shiftId: string) => {
  const [shiftRes, appsRes] = await Promise.all([
    supabase
      .from("shifts")
      .select(`
        id, title, status, image_url, shift_date, start_time, end_time, description, hourly_rate, total_pay, manager_id, department_id,
        businesses ( name ),
        departments ( name )
      `) 
      .eq("id", shiftId)
      .single(),

    supabase
      .from("applications")
      .select(`id, status, profile_id, profiles (name, surname, avatar_url)`)
      .eq("shift_id", shiftId)
  ]);

  if (shiftRes.error) throw shiftRes.error;

  return {
    shift: shiftRes.data,
    applications: appsRes.data || []
  };
};

// --- CANDIDATES & NOTIFICATIONS ---

export const fetchCandidateProfile = async (candidateId: string) => {
  const { data, error } = await supabase
    .from("profiles")
    .select(`
        id, 
        title, 
        status, 
        image_url, 
        shift_date, 
        start_time, 
        end_time, 
        description, 
        hourly_rate, 
        total_pay, 
        department_id,
        manager_id,
        businesses ( name ),
        departments ( name )
      `)
    .eq("id", candidateId)
    .single();

  if (error) throw error;
  return data;
};

export const updateApplicationStatus = async (
  shiftId: string, 
  profileId: string, 
  status: 'accepted' | 'rejected'
) => {
  const { data, error } = await supabase
    .from('applications')
    .update({ status: status })
    .eq('shift_id', shiftId)
    .eq('profile_id', profileId)
    .select();

  if (error) throw error;

  if (!data || data.length === 0) {
    throw new Error("APPLICATION NOT FOUND");
  }

  return data;
};

export const fetchUserNotifications = async (userId: string) => {
  const { data, error } = await supabase
    .from('notifications')
    .select('id, title, message, type, created_at, is_read, shift_id')
    .eq('profile_id', userId)
    .eq("is_archived", false)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

export const archiveNotification = async (notificationId: string) => {
  const { error } = await supabase
    .from("notifications")
    .update({ is_archived: true })
    .eq("id", notificationId);

  if (error) throw error;
};

export const markNotificationAsRead = async (notificationId: string) => {
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', notificationId);

  if (error) throw error;
};

export const markAllNotificationsAsRead = async (userId: string) => {
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('profile_id', userId);

  if (error) throw error;
};

// --- USER PROFILE ---

export const fetchUserProfile = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, name, surname, job_role, bio, phone, avatar_url, business_id") // AGGIORNATO: Allineato senza colonna department text
      .eq("id", userId)
      .maybeSingle();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data;
  } catch (err) {
    console.error("Error in fetchUserProfile:", err);
    return null;
  }
};

export const updateUserProfile = async (userId: string, updates: any) => {
  const { error } = await supabase
    .from("profiles")
    .update({
      name: updates.name,
      surname: updates.surname,
      job_role: updates.job_role,
      bio: updates.bio,
      phone: updates.phone,
      avatar_url: updates.avatar_url,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);

  if (error) throw error;
  return true;
};

export const countPendingApplications = async (userId: string) => {
  const { count, error } = await supabase
    .from("applications")
    .select("id, shifts!inner(manager_id)", { count: 'exact', head: true })
    .eq("status", "pending")
    .eq("shifts.manager_id", userId);

  if (error) {
    console.error("Error counting applications:", error);
    return 0;
  }
  return count || 0;
};

export const deleteShift = async (shiftId: string) => {
  const { error } = await supabase
    .from("shifts")
    .delete()
    .eq("id", shiftId);

  if (error) throw error;
  return true;
};

export const completeShiftStatus = async (shiftId: string) => {
  const { error } = await supabase
    .from("shifts")
    .update({ status: "completed" })
    .eq("id", shiftId);

  if (error) throw error;
  return true;
};

export const fetchManagerHistory = async (userId: string) => {
  const today = new Date().toISOString().split("T")[0];
  
  const { data, error } = await supabase
    .from("shifts")
    .select(`
      *,
      departments ( name ),
      applications(
        status,
        profiles(name, surname, avatar_url)
      )
    `)
    .eq("manager_id", userId)
    .lt("shift_date", today)
    .order("shift_date", { ascending: false });

  if (error) throw error;
  
  return data.map(shift => ({
    ...shift,
    assignedWorker: shift.applications?.find((app: any) => app.status === 'accepted')?.profiles || null
  }));
};

// --- CANDIDATE FULL DETAILS REFACTOR ---

export type CandidateFullDetails = {
  profile: any;
  applicationStatus: string | null;
  shiftStatus: string | null;
  shiftInfo: {
    title: string;
    shift_date: string;
    start_time: string;
    end_time: string;
    departmentName: string;
  } | null;
};

export const fetchCandidateShiftDetails = async (
  shiftId: string,
  profileId: string
): Promise<CandidateFullDetails> => {
  const [profileRes, appRes, shiftRes] = await Promise.all([
    supabase.from("profiles").select("id, name, surname, avatar_url, bio, experience, phone, job_role").eq("id", profileId).single(),
    supabase.from("applications").select("status").eq("shift_id", shiftId).eq("profile_id", profileId).maybeSingle(),
    supabase.from("shifts").select("status, title, shift_date, start_time, end_time, departments(name)").eq("id", shiftId).single(),
  ]);

  if (profileRes.error) throw profileRes.error;
  if (shiftRes.error) throw shiftRes.error;

  return {
    profile: profileRes.data,
    applicationStatus: appRes.data?.status || null,
    shiftStatus: shiftRes.data?.status || null,
    shiftInfo: shiftRes.data ? {
      title: shiftRes.data.title,
      shift_date: shiftRes.data.shift_date,
      start_time: shiftRes.data.start_time,
      end_time: shiftRes.data.end_time,
      departmentName: (shiftRes.data as any).departments?.name || "No Department"
    } : null,
  };
};

// --- UPDATE BUDGET ---

export const updateBudget = async(departmentId: string, newBudget: number) =>{
  const {data, error} = await supabase
    .from('departments')
    .update({ monthly_budget: newBudget })
    .eq('id', departmentId)
    .select();
    
    if (error) throw error;
  return data;
};