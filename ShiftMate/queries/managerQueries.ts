import { supabase } from "@/lib/supabase";

// --- HELPERS (Internals for earnings calculation) ---
const calculateTotalPay = (startTime: Date, endTime: Date, hourlyRate: string) => {
  const rate = parseFloat(hourlyRate) || 0;
  if (rate <= 0) return 0;

  let diffInMs = endTime.getTime() - startTime.getTime();
  
  // Night shift management (if it ends the next day))
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

export const createBusinessAndAssignOwner = async (userId: string, businessName: string, inviteCode: string) => {
  const { data: business, error: businessError } = await supabase
    .from("businesses")
    .insert([{ name: businessName.trim(), invite_code: inviteCode }])
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
    .select("id, title, shift_date, start_time, end_time, status, image_url, hourly_rate, total_pay, department")
    .eq("manager_id", userId)
    .order('shift_date', { ascending: true });

  if (error) throw error;
  return shifts || [];
};

export const createShift = async (userId: string, imageUrl: string | null, formData: {
  title: string;
  description: string;
  department: string;
  date: Date;
  startTime: Date;
  endTime: Date;
  hourly_rate: string;
}) => {
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("business_id")
    .eq("id", userId)
    .single();

  if (profileError || !profile?.business_id) {
    throw new Error("Your profile is not linked to a business.");
  }

  const totalPay = calculateTotalPay(formData.startTime, formData.endTime, formData.hourly_rate);

  const { error: shiftError } = await supabase.from("shifts").insert([
    {
      title: formData.title,
      description: formData.description,
      department: formData.department.toLowerCase(),
      business_id: profile.business_id,
      shift_date: formData.date.toISOString().split("T")[0],
      start_time: formData.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
      end_time: formData.endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
      image_url: imageUrl,
      hourly_rate: parseFloat(formData.hourly_rate) || 0,
      total_pay: totalPay,
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
    .select("title, description, shift_date, start_time, end_time, image_url, hourly_rate, department, total_pay")
    .eq("id", shiftId)
    .maybeSingle();

  if (error) throw error;
  return data;
};

export const updateShift = async (id: string, shiftData: {
  title: string;
  description: string;
  shift_date: Date;
  start_time: Date;
  end_time: Date;
  image_url: string | null;
  hourly_rate: string;
  department: string;
}) => {
  const totalPay = calculateTotalPay(shiftData.start_time, shiftData.end_time, shiftData.hourly_rate);

  const { error } = await supabase
    .from("shifts")
    .update({
      title: shiftData.title,
      description: shiftData.description,
      department: shiftData.department.toLowerCase(),
      shift_date: shiftData.shift_date.toISOString().split("T")[0],
      start_time: shiftData.start_time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
      end_time: shiftData.end_time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
      image_url: shiftData.image_url,
      hourly_rate: parseFloat(shiftData.hourly_rate) || 0,
      total_pay: totalPay,
    })
    .eq("id", id);

  if (error) throw error;
  return true;
};

export const fetchShiftFullDetails = async (shiftId: string) => {
  const [shiftRes, appsRes] = await Promise.all([
    supabase
      .from("shifts")
      .select(`id, title, status, image_url, shift_date, start_time, end_time, description, department, hourly_rate, total_pay,
        businesses ( name )`)
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
    .select("id, name, surname, avatar_url, bio, experience, phone, job_role, department")
    .eq("id", candidateId)
    .single();

  if (error) throw error;
  return data;
};

// Update status application

export const updateApplicationStatus = async (
  shiftId: string, 
  applicationId: string, 
  status: "accepted" | "rejected"
) => {
  // Call rpc if accepted
  if (status === 'accepted') {
    const { error } = await supabase.rpc('accept_application', { 
      target_app_id: applicationId 
    });
    if (error) throw error;
    return;
  }

  // Simple update if rejected
  const { error } = await supabase
    .from('applications')
    .update({ status: status, updated_at: new Date().toISOString() })
    .eq('id', applicationId);

  if (error) throw error;
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
      .select("id, name, surname, job_role, bio, phone, department, avatar_url")
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
      department: updates.department,
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

// delete shift
export const deleteShift = async (shiftId: string) => {
  const { error } = await supabase
    .from("shifts")
    .delete()
    .eq("id", shiftId);

  if (error) throw error;
  return true;
};

// mark shift as completed
export const completeShiftStatus = async (shiftId: string) => {
  const { error } = await supabase
    .from("shifts")
    .update({ status: "completed" })
    .eq("id", shiftId);

  if (error) throw error;
  return true;
};

// Fetch shift history for manager
export const fetchManagerHistory = async (userId: string) => {
  const today = new Date().toISOString().split("T")[0];
  
  const { data, error } = await supabase
    .from("shifts")
    .select(`
      *,
      applications(
        status,
        profiles(name, surname, avatar_url)
      )
    `)
    .eq("manager_id", userId)
    .lt("shift_date", today)
    .order("shift_date", { ascending: false });

  if (error) throw error;
  
  // Filter client-side to identify the worker assigned to each shift
  return data.map(shift => ({
    ...shift,
    assignedWorker: shift.applications?.find((app: any) => app.status === 'accepted')?.profiles || null
  }));
};

// Retrieves candidate profile along with their application status and relevant shift details.
export type CandidateFullDetails = {
  profile: any;
  applicationStatus: string | null;
  shiftStatus: string | null;
  shiftInfo: {
    title: string;
    shift_date: string;
    start_time: string;
    end_time: string;
  } | null;
};

export const fetchCandidateShiftDetails = async (
  shiftId: string,
  profileId: string
): Promise<CandidateFullDetails> => {
  const [profileRes, appRes, shiftRes] = await Promise.all([
    supabase.from("profiles").select("id, name, surname, avatar_url, bio, experience, phone, job_role, department").eq("id", profileId).single(),
    supabase.from("applications").select("status").eq("shift_id", shiftId).eq("profile_id", profileId).maybeSingle(),
    supabase.from("shifts").select("status, title, shift_date, start_time, end_time").eq("id", shiftId).single(),
  ]);

  if (profileRes.error) throw profileRes.error;
  if (shiftRes.error) throw shiftRes.error;

  return {
    profile: profileRes.data,
    applicationStatus: appRes.data?.status || null,
    shiftStatus: shiftRes.data?.status || null,
    shiftInfo: shiftRes.data || null,
  };
};