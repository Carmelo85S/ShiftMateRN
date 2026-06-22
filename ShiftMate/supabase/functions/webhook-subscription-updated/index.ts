import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@22.2.0?target=deno";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  httpClient: Stripe.createFetchHttpClient(),
});

const supabase = createClient(
  Deno.env.get("SUPABASE_URL") || "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ""
);

// DEFINIZIONE PIANI: Cruciale per distinguere il comportamento
const planConfig: Record<string, { name: string; type: "sub" | "pkg"; limit: number }> = {
  "price_1TdpVXPf9BDNyCapRO9apxU0": { name: "Scale", type: "sub", limit: 50 },
  "price_1TdpUqPf9BDNyCaphUprM3xC": { name: "Growth", type: "sub", limit: 10 },
  "price_1TdRTrPf9BDNyCapNvDt0Cxt": { name: "Essential", type: "sub", limit: 3 },
  "price_1Th5NLPf9BDNyCapAFoF8oNT": { name: "Solo Start", type: "pkg", limit: 10 },
  "price_1TdpTlPf9BDNyCapsKtthz8K": { name: "Business flow", type: "pkg", limit: 12 },
  "price_1TdpSEPf9BDNyCapTpA1yPPY": { name: "Flexi pack", type: "pkg", limit: 5 },
  "price_1TdRUfPf9BDNyCap2gvWBsOm": { name: "Quick start", type: "pkg", limit: 1 },
};

serve(async (req) => {
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    console.error("Missing Stripe signature");
    return new Response("No signature", { status: 400 });
  }

  const body = await req.text();
  const webhookSecret = Deno.env.get("STRIPE_SUBSCRIPTION_WEBHOOK");

  if (!webhookSecret) {
    console.error("Missing webhook secret");
    return new Response("Webhook secret not configured", { status: 500 });
  }

  let event: Stripe.Event;

  try {
    event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      webhookSecret
    );

    console.log("Verified event:", event.type, "ID:", event.id);
  } catch (err: any) {
    console.error("Webhook signature error:", err.message);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  try {

    console.log("Verified event:", event.type);
    console.log("Event payload:", JSON.stringify(event.data.object));

    switch (event.type) {

      /*
       * 💳 SUBSCRIPTION CREATED
       */
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const businessId = session.metadata?.business_id;

        // 1. Recupera il Price ID per capire cosa è stato comprato
        const items = await stripe.checkout.sessions.listLineItems(session.id);
        const priceId = items.data[0]?.price?.id;
        const cfg = planConfig[priceId!];

        if (!cfg || !businessId) {
          console.error("Missing config or businessId");
          return new Response("Invalid request", { status: 400 });
        }

        // 2. LOGICA BIFORCATA
        if (cfg.type === "sub") {
          console.log("👑 Processing Subscription:", cfg.name);
          await supabase.from("businesses").update({
            is_active_subscriber: true,
            plan_type: cfg.name,
            max_managers: cfg.limit,
            stripe_subscription_status: "active",
            stripe_customer_id: typeof session.customer === 'string' ? session.customer : session.customer?.id
          }).eq("id", businessId);
        } 
        else if (cfg.type === "pkg") {
          console.log("📦 Processing Credits Package:", cfg.limit);
          // NON tocchiamo is_active_subscriber qui!
          await supabase.rpc("handle_package_purchase", {
            p_business_id: businessId,
            p_amount: cfg.limit,
            p_event_id: event.id
          });
        }
        break;
      }

        /*
        * ❌ SUBSCRIPTION CANCELED
        */
        case "customer.subscription.deleted": {
          const subscription = event.data.object as Stripe.Subscription;

          console.log("Processing subscription.deleted");

          const customerId =
            typeof subscription.customer === "string"
              ? subscription.customer
              : subscription.customer?.id ?? "";

          const { error } = await supabase
            .from("businesses")
            .update({
              is_active_subscriber: false,
              stripe_subscription_status: "canceled",
            })
            .eq("stripe_customer_id", customerId);

          if (error) {
            console.error("DB Update Failed:", error);
            return new Response("DB Update Failed", { status: 500 });
          }

          console.log(`Subscription canceled: ${customerId}`);

          break;
        }

        /*
        * ⚠️ PAYMENT FAILED (DO NOT DISABLE USER)
        */
        case "invoice.payment_failed": {
          const invoice = event.data.object as Stripe.Invoice;

          console.log("Processing invoice.payment_failed");

          const customerId =
            typeof invoice.customer === "string"
              ? invoice.customer
              : invoice.customer?.id ?? "";

          const { error } = await supabase
            .from("businesses")
            .update({
              stripe_subscription_status: "past_due",
            })
            .eq("stripe_customer_id", customerId);

          if (error) {
            console.error("DB Update Failed:", error);
            return new Response("DB Update Failed", { status: 500 });
          }

          console.log(`Payment failed: ${customerId}`);

          break;
        }

        default:
          console.log("Unhandled event:", event.type);
      }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  } catch (err: any) {
    console.error("Unexpected webhook error:", err);
    return new Response("Internal Server Error", { status: 500 });
  }
});