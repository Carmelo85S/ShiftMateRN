import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

Deno.serve(async (req) => {
  // Leggiamo l'ID direttamente dal body della richiesta Insomnia
  const { businessId } = await req.json();

  if (!businessId) {
    return new Response("Manca businessId", { status: 400 });
  }

  // Eseguiamo la stessa identica query che hai nel webhook
  const { data, error } = await supabase
    .from('businesses')
    .update({ is_active_subscriber: true, stripe_subscription_status: 'active' })
    .eq('id', businessId)
    .select();

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  return new Response(JSON.stringify({ message: "Success!", data }), { status: 200 });
});