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

        console.log("Processing checkout.session.completed");

        const fullSession = await stripe.checkout.sessions.retrieve(session.id);

        const businessId = fullSession.metadata?.business_id;
        const userId = fullSession.metadata?.user_id;

        if (!businessId || !userId) {
          console.error("Missing metadata", fullSession.metadata);
          return new Response("Missing metadata", { status: 400 });
        }

        const { error } = await supabase
          .from("businesses")
          .update({
            is_active_subscriber: true,
            stripe_subscription_status: "active",
            stripe_customer_id:
              typeof fullSession.customer === "string"
                ? fullSession.customer
                : fullSession.customer?.id ?? null,
          })
          .eq("id", businessId);

        if (error) {
          console.error("DB Update Failed:", error);
          return new Response("DB Update Failed", { status: 500 });
        }

        console.log(`Business ${businessId} activated`);
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