import { supabase } from "@/lib/supabase";

//manager profile//
export const getManagerProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from("profiles")
    .select("name")
    .eq("id", userId)
    .single();
  
  if (error) throw error;
  return data;
};

//manager shifts//
export const fetchManagerShifts = async (userId: string) => {
  const { data, error } = await supabase
    .from("shifts")
    .select("*")
    .eq("manager_id", userId)
    .order("shift_date", { ascending: false });

  if (error) throw error;
  return data || [];
};