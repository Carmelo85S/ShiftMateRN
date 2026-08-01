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

const PLATFORM_FEE_PERCENTAGE = 0.10; // 🆕 10% — valore fisso per ora

Deno.serve(async (req) => {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  };

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // 🆕 0. VERIFICA AUTORIZZAZIONE — chi sta chiamando questa funzione?
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Non autenticato.");
    }

    const supabaseCaller = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabaseCaller.auth.getUser();

    if (userError || !user) {
      throw new Error("Utente non valido.");
    }

    const { shiftId, workerId } = await req.json();

    if (!shiftId || !workerId) {
      throw new Error("Parametri mancanti: shiftId e workerId sono obbligatori.");
    }

    // 1. Recupera i dettagli del turno per verificare lo stato e il compenso
    const { data: shift, error: shiftError } = await supabase
      .from("shifts")
      .select("total_pay, status, business_id") // 🆕 aggiunto business_id, serve per il controllo autorizzazione
      .eq("id", shiftId)
      .single();

    if (shiftError || !shift) {
      throw new Error("Turno non trovato.");
    }

    // 🆕 1b. VERIFICA CHE IL CHIAMANTE SIA OWNER/MANAGER DEL BUSINESS DI QUESTO TURNO
    const { data: callerProfile, error: callerError } = await supabase
      .from("profiles")
      .select("id, role, business_id")
      .eq("id", user.id)
      .single();

    if (
      callerError ||
      !callerProfile ||
      callerProfile.business_id !== shift.business_id ||
      !["owner", "manager"].includes(callerProfile.role)
    ) {
      throw new Error("Non autorizzato a pagare questo turno.");
    }

    if (shift.status !== "completed") {
      // 🆕 nota: questo controllo ora copre anche l'anti-doppio-pagamento,
      // perché uno shift già 'paid' non è più 'completed'
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

    // 🆕 3. CALCOLO FEE E PAYOUT
    const totalPay = Number(shift.total_pay);
    const platformFee = Math.round(totalPay * PLATFORM_FEE_PERCENTAGE * 100) / 100;
    const workerPayout = Math.round((totalPay - platformFee) * 100) / 100;

    const amountInCents = Math.round(workerPayout * 100); // 🆕 ora si trasferisce workerPayout, non più totalPay

    if (amountInCents <= 0) {
      throw new Error("L'importo del turno non è valido per il pagamento.");
    }

    // 4. Esegui il trasferimento dei fondi tramite Stripe Connect (Transfer)
    const transfer = await stripe.transfers.create({
      amount: amountInCents,
      currency: "sek",
      destination: stripeData.stripe_connect_id,
      metadata: {
        shiftId,
        workerId,
        platformFee: platformFee.toString(), // 🆕 utile per audit su Stripe stesso
      },
    });

    // 5. Aggiorna lo stato del turno a 'paid' nel database
    const { error: updateError } = await supabase
      .from("shifts")
      .update({ status: "paid" })
      .eq("id", shiftId);

    if (updateError) {
      // 🆕 non lanciamo più errore qui: i soldi sono già trasferiti, va solo loggato
      console.error(
        "⚠️ Transfer riuscito ma update shift fallito:",
        { shiftId, transferId: transfer.id, error: updateError.message }
      );
    }

    // 🆕 6. REGISTRA IL PAGAMENTO NELLA TABELLA payments
    const { error: paymentInsertError } = await supabase
      .from("payments")
      .insert({
        shift_id: shiftId,
        worker_id: workerId,
        stripe_payment_intent_id: transfer.id,
        amount: totalPay,
        status: "completed",
        transfer_group: transfer.transfer_group ?? null,
        platform_fee: platformFee,
        owner_commission: 0,
      });

    if (paymentInsertError) {
      console.error(
        "⚠️ PAGAMENTO STRIPE RIUSCITO MA INSERT PAYMENTS FALLITO:",
        { shiftId, workerId, transferId: transfer.id, error: paymentInsertError.message }
      );
      // non blocchiamo la risposta di successo: i soldi sono arrivati al worker
    }

    return new Response(
      JSON.stringify({
        success: true,
        transferId: transfer.id,
        totalPay,           // 🆕
        platformFee,        // 🆕
        workerPayout,       // 🆕
        message: "Pagamento completato con successo.",
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