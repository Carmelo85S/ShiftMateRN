import Stripe from "https://esm.sh/stripe@14.0.0?target=deno";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  apiVersion: "2023-10-16", // API più recente
  httpClient: Stripe.createFetchHttpClient(),
});

Deno.serve(async (req: Request) => {
  // Gestione CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { 
      headers: { 
        "Access-Control-Allow-Origin": "*", 
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" 
      } 
    });
  }

  try {
    const { priceId, businessId, mode, userId } = await req.json();

    console.log("Dati ricevuti dal frontend:", { priceId, businessId, mode, userId });

    console.log("Creazione sessione per businessId:", businessId);
    const isSubscription = mode === "subscription";

    const meta = { business_id: businessId, user_id: userId };

    const sessionConfig: any = {
      mode: isSubscription ? "subscription" : "payment",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: "shiftmate://dashboard",
      cancel_url: "shiftmate://auth/login",
      metadata: meta,
    };

    // Se è una sottoscrizione, passiamo il metadata anche a subscription_data
    if (isSubscription) {
      sessionConfig.subscription_data = {
        metadata: meta
      };
    } else {
      sessionConfig.payment_intent_data = {
        metadata: meta 
      };
    }

    const session = await stripe.checkout.sessions.create(sessionConfig);

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "An error occurred";
    return new Response(JSON.stringify({ error: message }), { 
      status: 400,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
    });
  }
});