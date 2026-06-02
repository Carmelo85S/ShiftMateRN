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
    const { priceId, businessId, mode } = await req.json();

    const session = await stripe.checkout.sessions.create({
      mode: mode === "subscription" ? "subscription" : "payment",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: "shiftmate://dashboard",
      cancel_url: "shiftmate://auth/login",
      metadata: { businessId },
    });

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