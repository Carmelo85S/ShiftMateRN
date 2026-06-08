import { supabase } from "@/lib/supabase";

export const getInviteCode = async (businessId: string) => {
    const {data, error} = await supabase
    .from('business')
    .select('invite_code')
    .eq("id", businessId)
    .maybeSingle();
if (error) throw error;
  return data;
};