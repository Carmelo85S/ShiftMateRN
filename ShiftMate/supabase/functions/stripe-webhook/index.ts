import { createClient } from "https://esm.sh/@supabase/supabase-js@2.44.0";
import Stripe from "https://esm.sh/stripe@16.0.0?target=deno";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") ?? "", {
  httpClient: Stripe.createFetchHttpClient(),
});

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

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
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  switch (event.type) {

    /* =========================
       CHECKOUT SUCCESS
    ========================= */
    case "checkout.session.completed": {
      const session = event.data.object as any;

      const businessId = session.metadata?.business_id;
      const userId = session.metadata?.user_id;

      if (!businessId || !userId) {
        return new Response("Missing metadata", { status: 400 });
      }

      const planConfig: Record<string, { name: string; type: "sub" | "pkg"; limit: number }> = {
        //Limit refer to max_managers
        "price_1TdpVXPf9BDNyCapRO9apxU0": { name: "Scale", type: "sub", limit: 50 },
        "price_1TdpUqPf9BDNyCaphUprM3xC": { name: "Growth", type: "sub", limit: 10 },
        "price_1TdRTrPf9BDNyCapNvDt0Cxt": { name: "Essential", type: "sub", limit: 3 },

        //Limit refer to job_posting_limit
        "price_1Th5NLPf9BDNyCapAFoF8oNT": { name: "Solo Start", type: "pkg", limit: 10 },
        "price_1TdpTlPf9BDNyCapsKtthz8K": { name: "Business flow", type: "pkg", limit: 12 },
        "price_1TdpSEPf9BDNyCapTpA1yPPY": { name: "Flexi pack", type: "pkg", limit: 5 },
        "price_1TdRUfPf9BDNyCap2gvWBsOm": { name: "Quick start", type: "pkg", limit: 1 },
      };

      const priceId = session.subscription
        ? (await stripe.subscriptions.retrieve(session.subscription))
            .items.data[0].price.id
        : (await stripe.checkout.sessions.listLineItems(session.id))
            .data[0].price.id;

      const cfg = planConfig[priceId] ?? null;

      if (!cfg) {
        console.error("Unknown priceId:", priceId);
        return new Response("Unknown plan", { status: 400 });
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", userId)
        .single();

      const userRole = profile?.role;

      /* =========================
         👑 OWNER FLOW (NO RPC)
      ========================= */
if (userRole === "owner") {

  if (cfg.type === "sub") {
    await supabase
      .from("businesses")
      .update({
        plan_type: cfg.name,
        max_managers: cfg.limit,
        is_active_subscriber: true,
        stripe_customer_id: session.customer ?? null,
        stripe_subscription_status: "active",
      })
      .eq("id", businessId);
  }

if (cfg.type === "pkg") {

  const { data: billing } = await supabase
    .from("billing_accounts")
    .select(`
      total_job_posts_limit,
      used_job_posts,
      job_post_credits_remaining
    `)
    .eq("business_id", businessId)
    .single();

  const currentTotal = billing?.total_job_posts_limit ?? 0;
  const currentUsed = billing?.used_job_posts ?? 0;
  const currentRemaining = billing?.job_post_credits_remaining ?? 0;

  await supabase
    .from("billing_accounts")
    .upsert(
      {
        business_id: businessId,
        stripe_subscription_id: session.subscription || session.id,
        plan_type: cfg.name,
        status: "active",

        total_job_posts_limit: currentTotal + cfg.limit,

        used_job_posts: currentUsed,

        job_post_credits_remaining:
          currentRemaining + cfg.limit,
      },
      {
        onConflict: "business_id",
      }
    );
}
}

      /* =========================
         👤 NON OWNER (MANAGER)
      ========================= */
      else {

        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30);

        await supabase.from("billing_accounts").upsert({
          business_id: businessId,
          user_id: userId,
          stripe_subscription_id: session.subscription || session.id,
          plan_type: cfg.name,
          status: "active",
          total_job_posts_limit: cfg.limit,
          used_job_posts: 0,
          job_post_credits_remaining: cfg.limit,
          expires_at: expiresAt.toISOString(),
        }, {
          onConflict: "business_id"
        });
      }

      break;
    }

    /* =========================
       SUB STATUS UPDATE
    ========================= */
    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const sub = event.data.object as any;

      const isActive =
        sub.status === "active" || sub.status === "trialing";

      await supabase
        .from("businesses")
        .update({
          is_active_subscriber: isActive,
          stripe_subscription_status: sub.status,
        })
        .eq("stripe_customer_id", sub.customer);

      break;
    }

    /* =========================
       PAYMENT OK
    ========================= */
    case "invoice.payment_succeeded": {
      const invoice = event.data.object as any;

      await supabase
        .from("businesses")
        .update({
          is_active_subscriber: true,
          stripe_subscription_status: "active",
        })
        .eq("stripe_customer_id", invoice.customer);

      break;
    }
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
  });
});