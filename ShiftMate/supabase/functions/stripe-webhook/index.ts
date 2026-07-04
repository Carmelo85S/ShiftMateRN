import { createClient } from "https://esm.sh/@supabase/supabase-js@2.44.0";
import Stripe from "https://esm.sh/stripe@16.0.0?target=deno&no-check";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") ?? "", {
  httpClient: Stripe.createFetchHttpClient(),
});

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

const planConfig: Record<string, { name: string; type: "sub" | "pkg"; limit: number }> = {
  "price_1TdpVXPf9BDNyCapRO9apxU0": { name: "Scale", type: "sub", limit: 50 },
  "price_1TdpUqPf9BDNyCaphUprM3xC": { name: "Growth", type: "sub", limit: 10 },
  "price_1TdRTrPf9BDNyCapNvDt0Cxt": { name: "Essential", type: "sub", limit: 3 },
  "price_1Th5NLPf9BDNyCapAFoF8oNT": { name: "Solo Start", type: "pkg", limit: 10 },
  "price_1TdpTlPf9BDNyCapsKtthz8K": { name: "Business flow", type: "pkg", limit: 12 },
  "price_1TdpSEPf9BDNyCapTpA1yPPY": { name: "Flexi pack", type: "pkg", limit: 5 },
  "price_1TdRUfPf9BDNyCap2gvWBsOm": { name: "Quick start", type: "pkg", limit: 1 },
};

Deno.serve(async (req) => {
  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    console.error("❌ No signature found in headers");
    return new Response("No signature", { status: 400 });
  }

  const body = await req.text();
  let event;

  try {
    event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      Deno.env.get("STRIPE_WEBHOOK_SECRET")!
    );
  } catch (err: any) {
    console.error("❌ Webhook Signature Error:", err.message);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  console.log("🔥 EVENTO RICEVUTO:", event.type);

  // --- 1. GESTIONE ONBOARDING (Stripe Connect) ---
  if (event.type === "account.updated") {
    const account = event.data.object as any;
    console.log("👤 Analisi account.updated per:", account.id);
    console.log("🔍 Dettagli charges_enabled:", account.charges_enabled);
    
    if (account.charges_enabled) {
      const { error } = await supabase
        .from("user_stripe_data")
        .update({ onboarding_completed: true, charges_enabled: true })
        .eq("stripe_connect_id", account.id)
      
      if (error) {
        console.error("❌ Errore aggiornamento DB onboarding:", error);
      } else {
        console.log("✅ Onboarding completato e DB aggiornato per:", account.id);
      }
    } else {
      console.log("⚠️ Onboarding ricevuto ma charges_enabled è false");
    }
    return new Response(JSON.stringify({ received: true }), { status: 200 });
  }

  // --- 2. GESTIONE PAGAMENTI (Checkout Sessions) ---
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as any;
    const businessId = session.metadata?.business_id;

    console.log("📦 SESSION ID:", session.id);
    console.log("🏢 BUSINESS ID:", businessId);

    if (!businessId) {
      console.error("❌ Missing businessId in metadata");
      return new Response("Missing businessId", { status: 400 });
    }

    let priceId: string | undefined;
    try {
      if (session.subscription) {
        const sub = await stripe.subscriptions.retrieve(session.subscription);
        priceId = sub.items.data[0]?.price?.id;
      } else {
        const items = await stripe.checkout.sessions.listLineItems(session.id);
        priceId = items.data[0]?.price?.id;
      }
      console.log("💳 PRICE ID estratto:", priceId);
    } catch (err) {
      console.error("❌ Errore risoluzione prezzo:", err);
      return new Response("Price error", { status: 500 });
    }

    const cfg = planConfig[priceId!];
    if (!cfg) {
      console.error("❌ Piano sconosciuto per priceId:", priceId);
      return new Response("Unknown plan", { status: 400 });
    }

    console.log("🎯 Piano trovato:", cfg.name);

    if (cfg.type === "sub") {
      const { error } = await supabase.from("businesses").update({
        plan_type: cfg.name,
        max_managers: cfg.limit,
        is_active_subscriber: true,
        stripe_subscription_status: "active",
        stripe_customer_id: session.customer
      }).eq("id", businessId);
      
      if (error) console.error("❌ Errore DB Subscription:", error);
      else console.log("✅ Subscription updated");
    } else if (cfg.type === "pkg") {
      console.log("📦 Esecuzione RPC handle_package_purchase...");
      const { error } = await supabase.rpc("handle_package_purchase", {
        p_business_id: businessId,
        p_amount: cfg.limit,
        p_event_id: event.id
      });
      if (error) console.error("❌ Errore RPC:", error);
      else console.log("✅ Credits updated successfully");
    }

    return new Response(JSON.stringify({ received: true }), { status: 200 });
  }

  console.log("⏭ Evento non gestito:", event.type);
  return new Response(JSON.stringify({ received: true }), { status: 200 });
});