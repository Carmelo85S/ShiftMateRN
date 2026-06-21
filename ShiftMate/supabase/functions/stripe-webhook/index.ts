import { createClient } from "https://esm.sh/@supabase/supabase-js@2.44.0";
import Stripe from "https://esm.sh/stripe@16.0.0?target=deno";

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
  if (!signature) return new Response("No signature", { status: 400 });

  const body = await req.text();

  let event;
  try {
    event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      Deno.env.get("STRIPE_WEBHOOK_SECRET")!
    );
  } catch (err: any) {
    console.error("❌ Stripe webhook error:", err.message);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  console.log("\n==============================");
  console.log("🔥 STRIPE EVENT:", event.type);
  console.log("==============================\n");

  if (event.type !== "checkout.session.completed") {
    console.log("⏭ Ignored event type");
    return new Response(JSON.stringify({ received: true }), { status: 200 });
  }

  const session = event.data.object as any;

  const businessId = session.metadata?.business_id;

  console.log("📦 SESSION ID:", session.id);
  console.log("🏢 BUSINESS ID:", businessId);

  if (!businessId) {
    console.error("❌ Missing businessId in metadata");
    return new Response("Missing businessId", { status: 400 });
  }

  const eventId = event.id;

  // =========================
  // PRICE RESOLUTION (SAFE)
  // =========================
  let priceId: string | undefined;

  try {
    if (session.subscription) {
      const sub = await stripe.subscriptions.retrieve(session.subscription);
      priceId = sub.items.data[0]?.price?.id;
    } else {
      const items = await stripe.checkout.sessions.listLineItems(session.id);
      priceId = items.data[0]?.price?.id;
    }

    console.log("💳 PRICE ID:", priceId);
  } catch (err) {
    console.error("❌ Price resolution error:", err);
  }

  console.log("🔎 PLAN CONFIG KEYS:", Object.keys(planConfig));

  const cfg = planConfig[priceId!];

  console.log("🎯 MATCHED CFG:", cfg);

  if (!cfg) {
    console.error("❌ Unknown priceId:", priceId);
    return new Response("Unknown plan", { status: 400 });
  }

  // =========================
  // SUBSCRIPTION FLOW
  // =========================
  if (cfg.type === "sub") {
    console.log("👑 SUBSCRIPTION FLOW");

    const { error } = await supabase
      .from("businesses")
      .update({
        plan_type: cfg.name,
        max_managers: cfg.limit,
        is_active_subscriber: true,
        stripe_subscription_status: "active",
        stripe_customer_id: session.customer
      })
      .eq("id", businessId);

    if (error) {
      console.error("❌ Subscription update error:", error);
      return new Response("DB error", { status: 500 });
    }

    console.log("✅ Subscription updated");
  }

  // =========================
  // PACKAGE FLOW
  // =========================
  if (cfg.type === "pkg") {
    console.log("📦 PACKAGE FLOW");

    const { error } = await supabase.rpc("handle_package_purchase", {
      p_business_id: businessId,
      p_amount: cfg.limit,
      p_event_id: eventId
    });

    if (error) {
      // Se arrivi qui, controlla i log: l'errore SQL apparirà chiaramente
      console.error("❌ RPC FAILED:", error);
      return new Response("RPC failed", { status: 500 });
    }

    console.log("✅ Credits updated successfully");
  }

  console.log("🎉 WEBHOOK COMPLETED SUCCESSFULLY");

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
  });
});