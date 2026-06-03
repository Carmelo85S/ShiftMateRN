import Stripe from "https://esm.sh/stripe@16.0.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.44.0";

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

  // Gestione semplificata per evitare crash su eventi non previsti
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as any;
      const businessId = session.metadata?.businessId;
      const customerId = session.customer;

      if (businessId && customerId) {
        await supabase.from('businesses').update({ 
            is_active_subscriber: true, 
            stripe_subscription_status: 'active',
            stripe_customer_id: customerId 
        }).eq('id', businessId);
      }
      break;
    }

    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const subscription = event.data.object as any;
      const customerId = subscription.customer;
      const isActive = subscription.status === 'active' || subscription.status === 'trialing';
      
      await supabase.from('businesses').update({ 
          is_active_subscriber: isActive, 
          stripe_subscription_status: subscription.status 
      }).eq('stripe_customer_id', customerId);
      break;
    }

    default:
      console.log(`Evento ignorato: ${event.type}`);
  }

  return new Response(JSON.stringify({ received: true }), { status: 200 });
});