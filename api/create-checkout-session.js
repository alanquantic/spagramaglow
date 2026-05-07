const Stripe = require("stripe");

const PRODUCT_PRICE_MXN = 99900;
const PRODUCT_NAME = "SPAGRAMA GlowAge 150 ml";
const PRODUCT_DESCRIPTION =
  "Gel conductor premium para rutinas con aparatología facial en casa.";

function getBaseUrl(req) {
  if (process.env.APP_URL) {
    return process.env.APP_URL.replace(/\/$/, "");
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  const protocol = req.headers["x-forwarded-proto"] || "http";
  const host = req.headers.host;
  return `${protocol}://${host}`;
}

function readJson(req) {
  if (req.body) {
    return Promise.resolve(typeof req.body === "string" ? JSON.parse(req.body) : req.body);
  }

  return new Promise((resolve, reject) => {
    let body = "";

    req.on("data", (chunk) => {
      body += chunk;
    });

    req.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (error) {
        reject(error);
      }
    });

    req.on("error", reject);
  });
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Metodo no permitido." });
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return res.status(500).json({ error: "Stripe no esta configurado." });
  }

  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const body = await readJson(req);
    const quantity = Number.parseInt(body.quantity, 10);

    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 5) {
      return res.status(400).json({ error: "Selecciona una cantidad de 1 a 5 piezas." });
    }

    const baseUrl = getBaseUrl(req);
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      locale: "es",
      payment_method_types: ["card"],
      line_items: [
        {
          quantity,
          price_data: {
            currency: "mxn",
            unit_amount: PRODUCT_PRICE_MXN,
            product_data: {
              name: PRODUCT_NAME,
              description: PRODUCT_DESCRIPTION,
              images: [`${baseUrl}/glowage-16-9.jpg`],
            },
          },
        },
      ],
      phone_number_collection: {
        enabled: true,
      },
      shipping_address_collection: {
        allowed_countries: ["MX"],
      },
      success_url: `${baseUrl}/gracias.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/compra-cancelada.html`,
      metadata: {
        product: "GlowAge",
        quantity: String(quantity),
        shipping: "included",
      },
      custom_text: {
        shipping_address: {
        message: "El envío está incluido para compras de 1 a 5 piezas.",
      },
      submit: {
        message: "Recibirás la confirmación de compra por correo.",
      },
      },
    });

    return res.status(200).json({ url: session.url });
  } catch (error) {
    console.error("Stripe checkout error:", error);
    return res.status(500).json({ error: "No pudimos crear la sesion de pago." });
  }
};
