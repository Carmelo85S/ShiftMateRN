import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Session, User } from '@supabase/supabase-js';

export const useAuth = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [businessId, setBusinessId] = useState<string | null>(null); // Aggiunto
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async (userId: string) => {
      const { data } = await supabase
        .from('profiles')
        .select('business_id')
        .eq('id', userId)
        .single();
      if (data) setBusinessId(data.business_id);
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
      else setBusinessId(null);
    });

    return () => subscription.unsubscribe();
  }, []);

  return { session, user, businessId, loading };
};