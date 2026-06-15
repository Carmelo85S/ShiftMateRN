import { supabase } from "@/lib/supabase";
import { Session, User } from "@supabase/supabase-js";
import { useEffect, useState } from "react";

export const useAuth = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<"owner" | "manager" | null>(null); // Aggiunto
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async (userId: string) => {
      // Recupera business_id E ruolo
      const { data } = await supabase
        .from("profiles")
        .select("business_id, role")
        .eq("id", userId)
        .single();

      if (data) {
        setBusinessId(data.business_id);
        setUserRole(data.role as "owner" | "manager");
      }
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
      else {
        setBusinessId(null);
        setUserRole(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Esporta tutto ciò che ti serve
  return {
    session,
    user,
    userId: user?.id ?? null, // Esportiamo userId esplicitamente
    businessId,
    userRole,
    loading,
  };
};
