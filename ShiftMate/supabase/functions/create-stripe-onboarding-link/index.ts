import Stripe from "https://esm.sh/stripe@16.0.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.44.0";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") ?? "", {
  httpClient: Stripe.createFetchHttpClient(),
});

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

Deno.serve(async (req) => {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  };

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Leggi il body una sola volta
    const { businessId, email } = await req.json();
    console.log("Processando businessId:", businessId);

    // 1. Recupera o crea l'account Stripe Connect
    let { data: business } = await supabase
      .from('businesses')
      .select('stripe_account_id')
      .eq('id', businessId)
      .single();

    let accountId = business?.stripe_account_id;

    if (!accountId) {
      const account = await stripe.accounts.create({
        type: 'express',
        email: email,
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
      });
      accountId = account.id;

      await supabase
        .from('businesses')
        .update({ stripe_account_id: accountId })
        .eq('id', businessId);
    }

    // 2. Genera il link
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: 'https://alguer.it', //Only for testing
      return_url: 'https://google.com', //Only for testing
      type: 'account_onboarding',
    });

    return new Response(JSON.stringify({ url: accountLink.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err: any) {
    console.error("Errore Stripe:", err);
    return new Response(JSON.stringify({ error: err.message }), { 
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});