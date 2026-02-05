import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-d9742687/health", (c) => {
  return c.json({ status: "ok" });
});

// Salva ordine nel database
app.post("/make-server-d9742687/orders", async (c) => {
  try {
    const body = await c.req.json();
    const { 
      customerName, 
      customerEmail, 
      customerPhone, 
      customerAddress,
      items, 
      total, 
      paymentIntentId 
    } = body;

    // Validazione base
    if (!customerEmail || !items || !total) {
      return c.json({ error: "Dati mancanti: email, items e total sono obbligatori" }, 400);
    }

    const orderId = `order-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const orderData = {
      id: orderId,
      customerName: customerName || '',
      customerEmail,
      customerPhone: customerPhone || '',
      customerAddress: customerAddress || '',
      items,
      total,
      paymentIntentId: paymentIntentId || null,
      status: paymentIntentId ? 'paid' : 'pending',
      createdAt: new Date().toISOString(),
    };

    // Salva nel KV store
    await kv.set(`order:${orderId}`, orderData);
    
    // Salva anche nella lista ordini del cliente
    const customerOrders = await kv.get(`customer:${customerEmail}:orders`) || [];
    customerOrders.push(orderId);
    await kv.set(`customer:${customerEmail}:orders`, customerOrders);

    console.log(`✅ Ordine salvato: ${orderId} per ${customerEmail}`);

    return c.json({ 
      success: true, 
      orderId,
      message: "Ordine salvato con successo" 
    });

  } catch (error) {
    console.error("❌ Errore salvataggio ordine:", error);
    return c.json({ 
      error: "Errore durante il salvataggio dell'ordine",
      details: error.message 
    }, 500);
  }
});

// Recupera ordine
app.get("/make-server-d9742687/orders/:orderId", async (c) => {
  try {
    const orderId = c.req.param('orderId');
    const order = await kv.get(`order:${orderId}`);
    
    if (!order) {
      return c.json({ error: "Ordine non trovato" }, 404);
    }

    return c.json({ success: true, order });

  } catch (error) {
    console.error("❌ Errore recupero ordine:", error);
    return c.json({ error: "Errore durante il recupero dell'ordine" }, 500);
  }
});

// Form assistenza - salva richiesta
app.post("/make-server-d9742687/support", async (c) => {
  try {
    const body = await c.req.json();
    const { name, phone, message } = body;

    if (!name || !phone || !message) {
      return c.json({ error: "Tutti i campi sono obbligatori" }, 400);
    }

    const requestId = `support-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const supportData = {
      id: requestId,
      name,
      phone,
      message,
      status: 'new',
      createdAt: new Date().toISOString(),
    };

    await kv.set(`support:${requestId}`, supportData);

    console.log(`✅ Richiesta assistenza salvata: ${requestId} da ${name}`);

    // In produzione, qui invieresti una email reale
    // Per ora logghiamo solo
    console.log(`📧 Email da inviare a: assistenza@esempio.it`);
    console.log(`   Da: ${name} (${phone})`);
    console.log(`   Messaggio: ${message}`);

    return c.json({ 
      success: true, 
      requestId,
      message: "Richiesta inviata con successo. Ti contatteremo a breve!" 
    });

  } catch (error) {
    console.error("❌ Errore invio richiesta assistenza:", error);
    return c.json({ 
      error: "Errore durante l'invio della richiesta",
      details: error.message 
    }, 500);
  }
});

// Crea Stripe Payment Intent
app.post("/make-server-d9742687/create-payment-intent", async (c) => {
  try {
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    
    if (!stripeKey) {
      return c.json({ 
        error: "Chiave Stripe non configurata. Configura STRIPE_SECRET_KEY nelle variabili d'ambiente." 
      }, 500);
    }

    const body = await c.req.json();
    const { amount, currency = 'eur', customerEmail } = body;

    if (!amount) {
      return c.json({ error: "Amount è obbligatorio" }, 400);
    }

    // Chiamata API Stripe per creare Payment Intent
    const response = await fetch('https://api.stripe.com/v1/payment_intents', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${stripeKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        amount: Math.round(amount * 100).toString(), // Stripe usa centesimi
        currency: currency,
        'automatic_payment_methods[enabled]': 'true',
        ...(customerEmail && { receipt_email: customerEmail }),
      }),
    });

    const paymentIntent = await response.json();

    if (!response.ok) {
      console.error("❌ Errore Stripe:", paymentIntent);
      return c.json({ 
        error: "Errore durante la creazione del pagamento",
        details: paymentIntent.error?.message 
      }, 500);
    }

    console.log(`✅ Payment Intent creato: ${paymentIntent.id} per €${amount}`);

    return c.json({ 
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });

  } catch (error) {
    console.error("❌ Errore creazione payment intent:", error);
    return c.json({ 
      error: "Errore durante la creazione del pagamento",
      details: error.message 
    }, 500);
  }
});

// Webhook Stripe (per confermare pagamenti)
app.post("/make-server-d9742687/stripe-webhook", async (c) => {
  try {
    const signature = c.req.header('stripe-signature');
    const body = await c.req.text();
    
    // In produzione, qui verificheresti la firma del webhook
    // Per ora logghiamo l'evento
    console.log(`📨 Webhook Stripe ricevuto`);
    
    const event = JSON.parse(body);
    
    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object;
      console.log(`✅ Pagamento confermato: ${paymentIntent.id}`);
      
      // Aggiorna lo stato dell'ordine
      const orders = await kv.getByPrefix('order:');
      const orderToUpdate = orders.find((order: any) => 
        order.paymentIntentId === paymentIntent.id
      );
      
      if (orderToUpdate) {
        orderToUpdate.status = 'paid';
        orderToUpdate.paidAt = new Date().toISOString();
        await kv.set(`order:${orderToUpdate.id}`, orderToUpdate);
        console.log(`✅ Ordine ${orderToUpdate.id} aggiornato a 'paid'`);
      }
    }

    return c.json({ received: true });

  } catch (error) {
    console.error("❌ Errore webhook Stripe:", error);
    return c.json({ error: "Errore webhook" }, 500);
  }
});

Deno.serve(app.fetch);