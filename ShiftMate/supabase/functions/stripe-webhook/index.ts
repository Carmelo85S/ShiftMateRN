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

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as any;
      const businessId = session.metadata?.businessId; 
      
      if (!businessId) {
        console.error("Errore: nessun businessId nei metadata.");
        return new Response("Missing metadata", { status: 400 });
      }

      // 1. Recupero robusto del Customer ID
      let customerId = session.customer;
      if (!customerId && session.subscription) {
        const sub = await stripe.subscriptions.retrieve(session.subscription);
        customerId = sub.customer as string;
      }

      // 2. Configurazione Piani
      const planConfig: Record<string, { name: string, type: 'sub' | 'pkg', limit: number, days?: number }> = {
        "price_1TdpVXPf9BDNyCapRO9apxU0": { name: "Scale", type: 'sub', limit: 50 },
        "price_1TdpUqPf9BDNyCaphUprM3xC": { name: "Growth", type: 'sub', limit: 10 },
        "price_1TdRTrPf9BDNyCapNvDt0Cxt": { name: "Essential", type: 'sub', limit: 3 },
        "price_1TdpTlPf9BDNyCapsKtthz8K": { name: "Business flow", type: 'pkg', limit: 12, days: 365 },
        "price_1TdpSEPf9BDNyCapTpA1yPPY": { name: "Flexi pack", type: 'pkg', limit: 5, days: 180 },
        "price_1TdRUfPf9BDNyCap2gvWBsOm": { name: "Quick start", type: 'pkg', limit: 1, days: 14 },
      };

      // 3. Recupero dinamico del Price ID
      let priceId;
      if (session.subscription) {
        const sub = await stripe.subscriptions.retrieve(session.subscription);
        priceId = sub.items.data[0].price.id;
      } else {
        const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
        priceId = lineItems.data[0].price.id;
      }

      const cfg = planConfig[priceId] || { name: "Unknown", type: 'sub', limit: 0 };

      // 4. Preparazione dati
      let updateData: any = { 
        plan_type: cfg.name,
        stripe_customer_id: customerId 
      };

      if (cfg.type === 'sub') {
          updateData.is_active_subscriber = true;
          updateData.stripe_subscription_status = 'active';
          updateData.max_managers = cfg.limit;
          updateData.job_postings_limit = 0;
        } else {
          // PACCHETTI
          updateData.is_active_subscriber = false; 
          updateData.stripe_subscription_status = 'inactive';
          updateData.max_managers = 0; 
          updateData.job_postings_limit = cfg.limit;
          updateData.job_postings_used = 0; // Reset del contatore
          
          const expiry = new Date();
          expiry.setDate(expiry.getDate() + (cfg.days || 0));
          updateData.access_expires_at = expiry.toISOString();
        }

        await supabase.from('businesses').update(updateData).eq('id', businessId);
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

    case "invoice.payment_succeeded": {
      const invoice = event.data.object as any;
      const customerId = invoice.customer;

      await supabase.from('businesses')
        .update({ 
          is_active_subscriber: true, 
          stripe_subscription_status: 'active' 
        })
        .eq('stripe_customer_id', customerId);
      break;
    }

    default:
      console.log(`Evento ignorato: ${event.type}`);
  }

  return new Response(JSON.stringify({ received: true }), { status: 200 });
});