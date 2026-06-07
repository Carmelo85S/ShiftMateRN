import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@12.0.0?target=deno";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  httpClient: Stripe.createFetchHttpClient(),
});

const supabase = createClient(
  Deno.env.get("SUPABASE_URL") || "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "" // Usiamo il SERVICE_ROLE per ignorare RLS
);

serve(async (req) => {
  const signature = req.headers.get("stripe-signature");
  if (!signature) return new Response("No signature", { status: 400 });

  const body = await req.text();

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      Deno.env.get("STRIPE_WEBHOOK_SECRET")!
    );
  } catch (err) {
    console.error(`Webhook Error: ${err.message}`);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      const businessId = session.metadata?.business_id;

      if (!businessId) {
        console.error("ERRORE: Metadata business_id mancante nella sessione");
        return new Response("Missing metadata", { status: 400 });
      }

      const { error } = await supabase
        .from("businesses")
        .update({ 
          is_active_subscriber: true,
          stripe_subscription_status: 'active',
          stripe_customer_id: typeof session.customer === 'string' ? session.customer : null
        })
        .eq("id", businessId);

      if (error) {
        console.error("DB Update Failed:", error);
        return new Response("DB Update Failed", { status: 500 });
      }
      break;
    }
    
    case "customer.subscription.deleted": {
      const subscription = event.data.object;
      const { error } = await supabase
        .from("businesses")
        .update({ 
          is_active_subscriber: false, 
          stripe_subscription_status: 'canceled' 
        })
        .eq("stripe_customer_id", subscription.customer);
        
      if (error) console.error("DB Update Failed on cancel:", error);
      break;
    }  
  }

  return new Response(JSON.stringify({ received: true }), { status: 200 });
});