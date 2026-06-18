import { supabase } from "@/lib/supabase";

export const getBusinessRole = async (
  userId: string,
  businessId: string,
) => {
  const { data, error } = await supabase
    .from("business_members")
    .select("role")
    .eq("user_id", userId)
    .eq("business_id", businessId)
    .single();

  if (error) return null;

  return data?.role ?? null;
};