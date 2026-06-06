import Stripe from "https://esm.sh/stripe@16.0.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.44.0";

// 1. Usa Deno.env.get per le chiavi segrete
const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") ?? "", {
  httpClient: Stripe.createFetchHttpClient(),
});

// 2. Inizializza il client Supabase correttamente per l'ambiente server
const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

Deno.serve(async (req) => {
  // Gestione CORS necessaria per chiamate da App
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  };
  
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { businessId } = await req.json();
    
    // Recupera dal database
    const { data: business, error } = await supabase
      .from('businesses')
      .select('stripe_account_id')
      .eq('id', businessId)
      .single();

    if (error || !business?.stripe_account_id) throw new Error("Business non trovato");
    
    // Verifica su Stripe
    const account = await stripe.accounts.retrieve(business.stripe_account_id);
    
    if (account.details_submitted) {
      await supabase
        .from('businesses')
        .update({ stripe_onboarding_completed: true })
        .eq('id', businessId);
      
      return new Response(JSON.stringify({ completed: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" }});
    }
    
    return new Response(JSON.stringify({ completed: false }), { headers: { ...corsHeaders, "Content-Type": "application/json" }});
  
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 400, headers: { ...corsHeaders } });
  }
});