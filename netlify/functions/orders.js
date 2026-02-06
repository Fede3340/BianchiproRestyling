const parseBody = (body) => {
  if (!body) {
    return {};
  }

  try {
    return JSON.parse(body);
  } catch (error) {
    return {};
  }
};

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Metodo non consentito" }),
    };
  }

  const {
    customerName,
    customerEmail,
    customerPhone,
    customerAddress,
    items,
    total,
    paymentIntentId,
  } = parseBody(event.body);

  if (!customerEmail || !customerPhone || !items || !total) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        error: "Dati mancanti: email, telefono, items e total sono obbligatori",
      }),
    };
  }

  const orderId = `order-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

  return {
    statusCode: 200,
    body: JSON.stringify({
      success: true,
      orderId,
      message: "Ordine salvato con successo",
      order: {
        id: orderId,
        customerName: customerName || "",
        customerEmail,
        customerPhone,
        customerAddress: customerAddress || "",
        items,
        total,
        paymentIntentId: paymentIntentId || null,
        status: paymentIntentId ? "paid" : "pending",
      },
    }),
  };
};
