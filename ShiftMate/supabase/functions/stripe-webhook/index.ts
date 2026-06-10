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
    case "checkout.session.completed": {
      const session = event.data.object as any;
      const businessId = session.metadata?.business_id; 
      const userId = session.metadata?.user_id;

      if (!businessId) return new Response("Missing metadata", { status: 400 });

      // 1. DEFINIZIONE CONFIGURAZIONE (Spostata all'inizio)
      const planConfig: Record<string, { name: string, type: 'sub' | 'pkg', limit: number, days?: number }> = {
        "price_1TdpVXPf9BDNyCapRO9apxU0": { name: "Scale", type: 'sub', limit: 50 },
        "price_1TdpUqPf9BDNyCaphUprM3xC": { name: "Growth", type: 'sub', limit: 10 },
        "price_1TdRTrPf9BDNyCapNvDt0Cxt": { name: "Essential", type: 'sub', limit: 3 },
        "price_1TgLu5Pf9BDNyCap2F80yOph": { name: "Solo Start", type: 'sub', limit: 10, days: 30},
        "price_1TdpTlPf9BDNyCapsKtthz8K": { name: "Business flow", type: 'pkg', limit: 12, days: 365 },
        "price_1TdpSEPf9BDNyCapTpA1yPPY": { name: "Flexi pack", type: 'pkg', limit: 5, days: 180 },
        "price_1TdRUfPf9BDNyCap2gvWBsOm": { name: "Quick start", type: 'pkg', limit: 1, days: 14 },
      };

      // 2. RECUPERO PRICE ID (Spostato all'inizio)
      let priceId;
      if (session.subscription) {
        const sub = await stripe.subscriptions.retrieve(session.subscription);
        priceId = sub.items.data[0].price.id;
      } else {
        const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
        priceId = lineItems.data[0].price.id;
      }

      const cfg = planConfig[priceId] || { name: "Unknown", type: 'sub', limit: 0 };

      // 3. RECUPERA CUSTOMER ID
      let customerId = session.customer;
      if (!customerId && session.subscription) {
        const sub = await stripe.subscriptions.retrieve(session.subscription);
        customerId = sub.customer as string;
      }

      // 4. GESTIONE ACQUISTO MANAGER (Ora cfg e userId esistono)
      if (userId) {
        await supabase.from('manager_purchases').insert({
          user_id: userId,
          business_id: businessId,
          status: 'active',
          stripe_subscription_id: session.subscription || session.id,
          plan_type: cfg.name // Ora funziona!
        });
      }

      // 5. AGGIORNAMENTO BUSINESS
      const updateData: any = { plan_type: cfg.name, stripe_customer_id: customerId };
      if (cfg.type === 'sub') {
        updateData.is_active_subscriber = true;
        updateData.stripe_subscription_status = 'active';
        updateData.max_managers = cfg.limit;
      } else {
        updateData.is_active_subscriber = false; 
        updateData.job_postings_limit = cfg.limit;
        const expiry = new Date();
        expiry.setDate(expiry.getDate() + (cfg.days || 0));
        updateData.access_expires_at = expiry.toISOString();
      }

      await supabase.from('businesses').update(updateData).eq('id', businessId);
      break; 
    }

    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const sub = event.data.object as any;
      const isActive = sub.status === 'active' || sub.status === 'trialing';
      
      await supabase.from('businesses').update({ 
          is_active_subscriber: isActive, 
          stripe_subscription_status: sub.status 
      }).eq('stripe_customer_id', sub.customer);
      break;
    }

    case "invoice.payment_succeeded": {
      const invoice = event.data.object as any;
      await supabase.from('businesses')
        .update({ is_active_subscriber: true, stripe_subscription_status: 'active' })
        .eq('stripe_customer_id', invoice.customer);
      break;
    }
  }

  return new Response(JSON.stringify({ received: true }), { status: 200 });
});