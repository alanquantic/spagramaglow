const Stripe = require("stripe");
const { Resend } = require("resend");
const { buildInternalNotification, buildOrderEmail } = require("../lib/order-email");

function readRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];

    req.on("data", (chunk) => {
      chunks.push(Buffer.from(chunk));
    });

    req.on("end", () => {
      resolve(Buffer.concat(chunks));
    });

    req.on("error", reject);
  });
}

async function sendOrderEmails(session) {
  if (!process.env.RESEND_API_KEY) {
    console.warn("RESEND_API_KEY is not configured; skipping email.");
    return;
  }

  const customerEmail = session.customer_details && session.customer_details.email;

  if (!customerEmail) {
    console.warn("Stripe session has no customer email; skipping customer email.");
    return;
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const from = process.env.RESEND_FROM_EMAIL || "SPAGRAMA <ventas@updates.spagrama.com>";

  await resend.emails.send({
    from,
    to: customerEmail,
    subject: "Tu compra GlowAge está confirmada",
    html: buildOrderEmail(session),
  });

  if (process.env.SPAGRAMA_NOTIFY_EMAIL) {
    await resend.emails.send({
      from,
      to: process.env.SPAGRAMA_NOTIFY_EMAIL,
      subject: "Nueva venta GlowAge",
      text: buildInternalNotification(session),
    });
  }
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Metodo no permitido." });
  }

  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
    return res.status(500).json({ error: "Stripe webhook no esta configurado." });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const signature = req.headers["stripe-signature"];
  const rawBody = await readRawBody(req);

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    console.error("Stripe webhook signature error:", error.message);
    return res.status(400).json({ error: "Firma invalida." });
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = await stripe.checkout.sessions.retrieve(event.data.object.id, {
        expand: ["line_items"],
      });

      if (session.payment_status === "paid") {
        await sendOrderEmails(session);
      }
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    console.error("Stripe webhook processing error:", error);
    return res.status(500).json({ error: "No pudimos procesar el webhook." });
  }
};
