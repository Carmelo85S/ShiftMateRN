import { createClient } from "https://esm.sh/@supabase/supabase-js@2.44.0";
import Stripe from "npm:stripe";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
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

  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { userId, email, businessId } = await req.json();

    // Recupera l'account specifico per questo utente
    const { data: stripeData, error } = await supabase
    .from("user_stripe_data")
    .select("stripe_connect_id")
    .eq("id", userId)
    .maybeSingle();

    if (error) throw error;

    let accountId = stripeData?.stripe_connect_id;
    if (!accountId) {
      const account = await stripe.accounts.create({
        type: 'express',
        business_type: 'individual',
        email: email,
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
      });
      accountId = account.id;

      // Aggiorna la tabella user_stripe_data
      const { error: updateError } = await supabase
        .from("user_stripe_data")
        .update({
            stripe_connect_id: accountId,
        })
        .eq("id", userId);

        if (updateError) {
        console.error(updateError);
        throw updateError;
        }
    }

    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      return_url: `https://shiftmate.dev/stripe-return`,
      refresh_url: `https://shiftmate.dev/stripe-return`,
      type: 'account_onboarding',
    });

    return new Response(JSON.stringify({ url: accountLink.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { 
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});