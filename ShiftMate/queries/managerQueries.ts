import { supabase } from "@/lib/supabase";

// --- PROFILE & BUSINESS ---

// Get manager profile with business ID
export const getManagerProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from("profiles")
    .select("name, business_id")
    .eq("id", userId)
    .maybeSingle();
  
  if (error) throw error;
  return data;
};

// Count workers linked to a specific business
export const countBusinessWorkers = async (businessId: string) => {
  const { count, error } = await supabase
    .from("profiles")
    .select("*", { count: 'exact', head: true })
    .eq("business_id", businessId)
    .eq("role", "worker");

  if (error) throw error;
  return count || 0;
};

// Create a new business and link it to the owner profile
export const createBusinessAndAssignOwner = async (userId: string, businessName: string, inviteCode: string) => {
  // 1. Insert into businesses table
  const { data: business, error: businessError } = await supabase
    .from("businesses")
    .insert([{ 
        name: businessName.trim(), 
        invite_code: inviteCode 
    }])
    .select()
    .single();

  if (businessError) throw businessError;

  // 2. Update owner profile with business_id
  const { error: profileError } = await supabase
    .from("profiles")
    .update({ business_id: business.id })
    .eq("id", userId);

  if (profileError) throw profileError;

  return { business, inviteCode };
};

// --- SHIFT MANAGEMENT ---

// Fetch all shifts created by a specific manager
export const fetchManagerShifts = async (userId: string) => {
  const { data: shifts, error } = await supabase
    .from("shifts")
    .select("id, title, shift_date, start_time, end_time, status, image_url")
    .eq("manager_id", userId)
    .order('shift_date', { ascending: true });

  if (error) throw error;
  return shifts || [];
};

// Create a new shift linked to the manager's business
export const createShift = async (userId: string, imageUrl: string | null, formData: {
  title: string;
  description: string;
  department: string;
  date: Date;
  startTime: Date;
  endTime: Date;
}) => {
  // 1. Get business ID from manager profile
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("business_id")
    .eq("id", userId)
    .single();

  if (profileError || !profile?.business_id) {
    throw new Error("Your profile is not linked to a business. Contact admin.");
  }

  // 2. Insert new shift
  const { error: shiftError } = await supabase.from("shifts").insert([
    {
      title: formData.title,
      description: formData.description,
      department: formData.department,
      business_id: profile.business_id,
      shift_date: formData.date.toISOString().split("T")[0],
      start_time: formData.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
      end_time: formData.endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
      image_url: imageUrl,
      status: "open",
      created_by: userId,
      manager_id: userId,
    },
  ]);

  if (shiftError) throw shiftError;
  return true;
};

// Get basic shift data for editing
export const getShiftForEdit = async (shiftId: string) => {
  const {data, error} = await supabase
    .from("shifts")
    .select("title, description, shift_date, start_time, end_time, image_url")
    .eq("id", shiftId)
    .maybeSingle();

  if (error) throw error;
  return data;
};

// Update existing shift details
export const updateShift = async (id: string, shiftData: {
  title: string;
  description: string;
  shift_date: Date;
  start_time: Date;
  end_time: Date;
  image_url: string | null;
}) => {
  const { error } = await supabase
    .from("shifts")
    .update({
      title: shiftData.title,
      description: shiftData.description,
      shift_date: shiftData.shift_date.toISOString().split("T")[0],
      start_time: shiftData.start_time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
      end_time: shiftData.end_time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
      image_url: shiftData.image_url,
    })
    .eq("id", id);

  if (error) throw error;
  return true;
};

// Fetch shift details including all applications
export const fetchShiftFullDetails = async (shiftId: string) => {
  const [shiftRes, appsRes] = await Promise.all([
    supabase
      .from("shifts")
      .select(`id, title, status, image_url, shift_date, start_time, end_time, description, department, 
        businesses (
          name
        )`)
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

// Fetch detailed profile for a specific candidate
export const fetchCandidateProfile = async (candidateId: string) => {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, name, surname, avatar_url, bio, experience, phone, job_role, department")
    .eq("id", candidateId)
    .single();

  if (error) throw error;
  return data;
};

// Update status of a shift application
export const updateApplicationStatus = async (shiftId: string, candidateId: string, status: "accepted" | "rejected") => {
  const { error } = await supabase
    .from("applications")
    .update({ status: status })
    .eq("shift_id", shiftId)
    .eq("profile_id", candidateId);

  if (error) throw error;
  return true;
};

// Fetch active notifications for a user
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

// Move notification to archive
export const archiveNotification = async (notificationId: string) => {
  const { error } = await supabase
    .from("notifications")
    .update({ is_archived: true })
    .eq("id", notificationId);

  if (error) throw error;
};

// Mark single notification as read
export const markNotificationAsRead = async (notificationId: string) => {
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', notificationId);

  if (error) throw error;
};

// Mark all user notifications as read
export const markAllNotificationsAsRead = async (userId: string) => {
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('profile_id', userId);

  if (error) throw error;
};

// --- USER PROFILE ---

// Fetch public profile information
export const fetchUserProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, name, surname, job_role, bio, phone, department, avatar_url")
    .eq("id", userId)
    .single();

  if (error) throw error;
  return data;
};

// Update user profile details
export const updateUserProfile = async (userId: string, updates: any) => {
  const { error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", userId);

  if (error) throw error;
  return true;
};