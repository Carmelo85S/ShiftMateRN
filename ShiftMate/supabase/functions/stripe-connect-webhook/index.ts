import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@22.2.0?target=deno";

const stripe = new Stripe(
  Deno.env.get("STRIPE_SECRET_KEY") || "",
  {
    httpClient: Stripe.createFetchHttpClient(),
  }
);

const supabase = createClient(
  Deno.env.get("SUPABASE_URL") || "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ""
);

serve(async (req) => {
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return new Response("No signature", { status: 400 });
  }

  const body = await req.text();

  const secret = Deno.env.get("STRIPE_CONNECT_WEBHOOK");

  if (!secret) {
    return new Response("Missing secret", { status: 500 });
  }

  let event: Stripe.Event;

  try {
    event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      secret
    );
  } catch (err: any) {
    console.error("Signature error:", err.message);

    return new Response(
      `Webhook Error: ${err.message}`,
      { status: 400 }
    );
  }

  console.log("Verified:", event.type);

  if (event.type === "account.updated") {
    const account = event.data.object as Stripe.Account;

    console.log("ACCOUNT:", {
      id: account.id,
      charges_enabled: account.charges_enabled,
      payouts_enabled: account.payouts_enabled,
      details_submitted: account.details_submitted,
    });

    const { data, error } = await supabase
      .from("businesses")
      .update({
        stripe_onboarding_completed:
          account.charges_enabled === true,
      })
      .eq("stripe_account_id", account.id)
      .select();

    if (error) {
      console.error(error);

      return new Response(
        "DB Update Failed",
        { status: 500 }
      );
    }

    console.log("Updated:", data);
  }

  if (event.type === "account.updated") {
    const account = event.data.object as Stripe.Account;

    console.log("ACCOUNT:", {
      id: account.id,
      charges_enabled: account.charges_enabled,
      payouts_enabled: account.payouts_enabled,
      details_submitted: account.details_submitted,
    });

    // Aggiorna businesses (se è un account business)
    const { data: businessData, error: businessError } = await supabase
      .from("businesses")
      .update({
        stripe_onboarding_completed: account.charges_enabled,
      })
      .eq("stripe_account_id", account.id)
      .select();

    if (businessError) {
      console.error("❌ Business update error:", businessError);
    } else {
      console.log("✅ Businesses updated:", businessData?.length ?? 0);
    }

    // Aggiorna user_stripe_data (se è un account worker)
    const { data: workerData, error: workerError } = await supabase
      .from("user_stripe_data")
      .update({
        onboarding_completed: account.details_submitted,
        charges_enabled: account.charges_enabled,
        payouts_enabled: account.payouts_enabled,
      })
      .eq("stripe_connect_id", account.id)
      .select();

    if (workerError) {
      console.error("❌ Worker update error:", workerError);
    } else {
      console.log("✅ Workers updated:", workerData?.length ?? 0);
    }
  }

  return new Response(
    JSON.stringify({ received: true }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
});