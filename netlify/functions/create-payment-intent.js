const createPaymentIntent = async (amount, currency = "eur", customerEmail) => {
  const stripeKey = process.env.STRIPE_SECRET_KEY;

  if (!stripeKey) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Chiave Stripe non configurata. Imposta STRIPE_SECRET_KEY.",
      }),
    };
  }

  const response = await fetch("https://api.stripe.com/v1/payment_intents", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${stripeKey}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      amount: Math.round(amount * 100).toString(),
      currency,
      "automatic_payment_methods[enabled]": "true",
      ...(customerEmail ? { receipt_email: customerEmail } : {}),
    }),
  });

  const paymentIntent = await response.json();

  if (!response.ok) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Errore durante la creazione del pagamento",
        details: paymentIntent.error?.message,
      }),
    };
  }

  return {
    statusCode: 200,
    body: JSON.stringify({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    }),
  };
};

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Metodo non consentito" }),
    };
  }

  let payload = {};
  try {
    payload = JSON.parse(event.body || "{}");
  } catch (error) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Payload non valido" }),
    };
  }

  const amount = Number(payload.amount || 0);
  const currency = payload.currency || "eur";
  const customerEmail = payload.customerEmail;

  if (!amount) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Amount è obbligatorio" }),
    };
  }

  return createPaymentIntent(amount, currency, customerEmail);
};
