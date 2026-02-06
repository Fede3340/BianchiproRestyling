const VAT_RATE = 0.22;

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

const calculateSubtotal = (items = []) =>
  items.reduce((sum, item) => {
    const accessoriesTotal = (item.accessories || []).reduce(
      (acc, accessory) => acc + Number(accessory.price || 0),
      0,
    );
    const quantity = Number(item.quantity || 0);
    const basePrice = Number(item.price || 0);
    return sum + (basePrice + accessoriesTotal) * quantity;
  }, 0);

exports.handler = async (event) => {
  if (event.httpMethod === "GET") {
    return {
      statusCode: 200,
      body: JSON.stringify({ status: "ok" }),
    };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Metodo non consentito" }),
    };
  }

  const { items } = parseBody(event.body);

  if (!Array.isArray(items)) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Items non validi" }),
    };
  }

  const subtotal = calculateSubtotal(items);
  const vat = subtotal * VAT_RATE;
  const total = subtotal + vat;

  return {
    statusCode: 200,
    body: JSON.stringify({
      subtotal,
      vat,
      total,
      currency: "EUR",
    }),
  };
};
