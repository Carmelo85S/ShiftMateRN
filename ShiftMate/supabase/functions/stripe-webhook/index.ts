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

      if (!businessId || !userId) return new Response("Missing metadata", { status: 400 });

      const planConfig: Record<string, { name: string, type: 'sub' | 'pkg' | 'client_pkg' | 'client_sub', limit: number }> = {
        "price_1TdpVXPf9BDNyCapRO9apxU0": { name: "Scale", type: 'sub', limit: 50 },
        "price_1TdpUqPf9BDNyCaphUprM3xC": { name: "Growth", type: 'sub', limit: 10 },
        "price_1TdRTrPf9BDNyCapNvDt0Cxt": { name: "Essential", type: 'sub', limit: 3 },
        "price_1Th5NLPf9BDNyCapAFoF8oNT": { name: "Solo Start", type: 'pkg', limit: 10 },
        "price_1TdpTlPf9BDNyCapsKtthz8K": { name: "Business flow", type: 'pkg', limit: 12 },
        "price_1TdpSEPf9BDNyCapTpA1yPPY": { name: "Flexi pack", type: 'pkg', limit: 5 },
        "price_1TdRUfPf9BDNyCap2gvWBsOm": { name: "Quick start", type: 'pkg', limit: 1 },
        "price_1Th6UsPf9BDNyCappYyGgGG7": { name: "Booster", type: 'client_pkg', limit: 15 },
        "price_1Th6SSPf9BDNyCapNeGQHOLw": { name: "Starter", type: 'client_pkg', limit: 1 },
        "price_1Th6QJPf9BDNyCapiMgf1ymA": { name: "Base", type: 'client_sub', limit: 5 },
        "price_1Th6RYPf9BDNyCapWULFtVa5": { name: "Pro", type: 'client_sub', limit: 15 },
      };

      let priceId = session.subscription 
        ? (await stripe.subscriptions.retrieve(session.subscription)).items.data[0].price.id
        : (await stripe.checkout.sessions.listLineItems(session.id)).data[0].price.id;

      const cfg = planConfig[priceId] || { name: "Unknown", type: 'sub', limit: 0 };
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', userId).single();
      const userRole = profile?.role;

      // 1. LOGICA ABBONAMENTI (Solo Owner)
      if (cfg.type === 'sub') {
        if (userRole === 'owner') {
          await supabase.from('businesses').update({ 
            plan_type: cfg.name,
            stripe_customer_id: session.customer,
            is_active_subscriber: true,
            stripe_subscription_status: 'active',
            max_managers: cfg.limit
          }).eq('id', businessId);
        } else {
          return new Response("Unauthorized", { status: 403 });
        }
      } 
      // 2. LOGICA PACCHETTI E CLIENT
      else {
        // --- SE È UN OWNER ---
        if (userRole === 'owner') {
          // L'Owner aggiorna direttamente il limite del business
          const { data: business } = await supabase
            .from('businesses')
            .select('job_postings_limit')
            .eq('id', businessId)
            .single();

          const currentLimit = business?.job_postings_limit || 0;
          await supabase
            .from('businesses')
            .update({ 
              plan_type: cfg.name,
              job_postings_limit: currentLimit + cfg.limit 
            })
            .eq('id', businessId);
            
          console.log(`Owner ${userId} ha aggiunto ${cfg.limit} crediti al business ${businessId}`);
        } 
        
        // --- SE È UN MANAGER (O ALTRO) ---
        else {
          // Il Manager usa il sistema a crediti a scadenza
          const expiresAt = new Date();
          expiresAt.setDate(expiresAt.getDate() + 30);

          await supabase.from('manager_purchases').insert({
            user_id: userId,
            business_id: businessId,
            status: 'active',
            stripe_subscription_id: session.subscription || session.id,
            plan_type: cfg.name,
            total_job_posts_limit: cfg.limit,
            used_job_posts: 0,
            expires_at: expiresAt.toISOString() 
          });
        }
      }
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