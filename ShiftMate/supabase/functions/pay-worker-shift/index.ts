import { createClient } from "https://esm.sh/@supabase/supabase-js@2.44.0";
import Stripe from "npm:stripe@16.1.0";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
  apiVersion: "2024-06-20",
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

  const balance = await stripe.balance.retrieve();
console.log("💰 Saldo Stripe attuale:", balance);

  try {
    const { shiftId, workerId } = await req.json();

    if (!shiftId || !workerId) {
      throw new Error("Parametri mancanti: shiftId e workerId sono obbligatori.");
    }

    // 1. Recupera i dettagli del turno per verificare lo stato e il compenso
    const { data: shift, error: shiftError } = await supabase
      .from("shifts")
      .select("total_pay, status")
      .eq("id", shiftId)
      .single();

    if (shiftError || !shift) {
      throw new Error("Turno non trovato.");
    }

    if (shift.status !== "completed") {
      throw new Error("Il turno deve essere nello stato 'completed' per poter essere pagato.");
    }

    // 2. Recupera lo stripe_connect_id del worker usando la sua id
    const { data: stripeData, error: stripeError } = await supabase
      .from("user_stripe_data")
      .select("stripe_connect_id, payouts_enabled")
      .eq("id", workerId)
      .single();

    if (stripeError || !stripeData?.stripe_connect_id) {
      throw new Error("Il worker non ha un account Stripe connesso.");
    }

    if (!stripeData.payouts_enabled) {
      throw new Error("L'account Stripe del worker non è ancora abilitato a ricevere pagamenti.");
    }

    const amountInCents = Math.round(Number(shift.total_pay) * 100);

    if (amountInCents <= 0) {
      throw new Error("L'importo del turno non è valido per il pagamento.");
    }

    // 3. Esegui il trasferimento dei fondi tramite Stripe Connect (Transfer)
    const transfer = await stripe.transfers.create({
      amount: amountInCents,
      currency: "sek",
      destination: stripeData.stripe_connect_id,
      metadata: { 
        shiftId, 
        workerId 
      },
    });

    // 4. Aggiorna lo stato del turno a 'paid' nel database
    const { error: updateError } = await supabase
      .from("shifts")
      .update({ status: "paid" })
      .eq("id", shiftId);

    if (updateError) {
      throw new Error("Pagamento effettuato su Stripe ma impossibile aggiornare lo stato del turno nel database: " + updateError.message);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        transferId: transfer.id,
        message: "Pagamento completato con successo." 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (err: any) {
    console.error("❌ Errore Edge Function pay-worker-shift:", err.message);
    return new Response(
      JSON.stringify({ error: err.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});