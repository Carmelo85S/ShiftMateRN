import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import Stripe from 'https://esm.sh/stripe@11.1.0?target=deno'

// Ora puoi usare i nomi definiti nel deno.json
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { withSupabase } from "@supabase/server";

// Se hai bisogno di Stripe, continua a importarlo via URL
import Stripe from 'https://esm.sh/stripe@11.1.0?target=deno';

// Il resto del tuo codice...

// Inizializza Stripe con la chiave che abbiamo salvato nel cloud
const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
  httpClient: Stripe.createFetchHttpClient(),
  apiVersion: '2022-11-15',
})

serve(async (req) => {
  // Gestione CORS (per permettere la chiamata dal tuo frontend)
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' } })
  }

  try {
    const { userId } = await req.json()

    // 1. Crea un account Express (o recuperane uno esistente)
    const account = await stripe.accounts.create({ type: 'express' })

    // 2. Crea un Account Link per reindirizzare l'utente
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: 'https://tuosito.com/reauth', // Dove mandarlo se il link scade
      return_url: 'https://tuosito.com/return',  // Dove mandarlo dopo aver finito
      type: 'account_onboarding',
    })

    return new Response(JSON.stringify({ url: accountLink.url }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      status: 200,
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 400 })
  }
})