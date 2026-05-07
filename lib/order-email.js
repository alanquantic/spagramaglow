function formatMoney(amountTotal, currency) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: (currency || "mxn").toUpperCase(),
  }).format((amountTotal || 0) / 100);
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function getCustomerName(session) {
  return (
    (session.customer_details && session.customer_details.name) ||
    (session.collected_information && session.collected_information.individual_name) ||
    ""
  );
}

function getCustomerEmail(session) {
  return (
    (session.customer_details && session.customer_details.email) ||
    session.customer_email ||
    ""
  );
}

function getShippingDetails(session) {
  if (session.collected_information && session.collected_information.shipping_details) {
    return session.collected_information.shipping_details;
  }

  if (session.shipping_details) {
    return session.shipping_details;
  }

  if (session.customer_details && session.customer_details.address) {
    return {
      name: getCustomerName(session),
      address: session.customer_details.address,
    };
  }

  return null;
}

function formatShippingAddress(details, separator = "<br />") {
  const address = details && details.address;

  if (!address) {
    return "Dirección de envío pendiente de confirmar.";
  }

  return [
    details.name,
    address.line1,
    address.line2,
    [address.postal_code, address.city].filter(Boolean).join(" "),
    address.state,
    address.country,
  ]
    .filter(Boolean)
    .map((line) => (separator === "<br />" ? escapeHtml(line) : String(line)))
    .join(separator);
}

function buildOrderEmail(session) {
  const quantity = session.metadata && session.metadata.quantity ? session.metadata.quantity : "1";
  const total = formatMoney(session.amount_total, session.currency);
  const customerName = getCustomerName(session);
  const shippingAddress = formatShippingAddress(getShippingDetails(session));
  const greeting = customerName ? `Hola ${escapeHtml(customerName)}, ` : "";

  return `<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Tu compra GlowAge</title>
  </head>
  <body style="margin:0;background:#eef1f4;color:#23262b;font-family:Manrope,Arial,sans-serif;">
    <div style="display:none;overflow:hidden;line-height:1px;opacity:0;max-height:0;max-width:0;">
      Confirmamos tu compra de GlowAge de SPAGRAMA.
    </div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#eef1f4;padding:32px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:620px;background:#fbfcfd;border:1px solid #dfe4ea;border-radius:28px;overflow:hidden;box-shadow:0 22px 60px rgba(44,52,62,0.12);">
            <tr>
              <td style="padding:34px 34px 18px;">
                <p style="margin:0 0 18px;color:#7f8995;font-size:12px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;">SPAGRAMA</p>
                <h1 style="margin:0;color:#23262b;font-family:Georgia,'Times New Roman',serif;font-size:44px;line-height:0.95;font-weight:500;">Tu ritual GlowAge está confirmado.</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:0 34px 24px;">
                <p style="margin:0;color:#666d76;font-size:16px;line-height:1.7;">
                  ${greeting}recibimos tu compra de GlowAge. Prepararemos tu pedido para que esta experiencia de spa en casa llegue a ti con el mismo cuidado con el que fue creada.
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:0 34px 28px;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border:1px solid #e1e6eb;border-radius:20px;background:#f5f7f9;">
                  <tr>
                    <td style="padding:20px;border-bottom:1px solid #e1e6eb;">
                      <p style="margin:0 0 6px;color:#7f8995;font-size:11px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;">Producto</p>
                      <p style="margin:0;color:#23262b;font-size:18px;font-weight:700;">GlowAge 150 ml</p>
                    </td>
                    <td align="right" style="padding:20px;border-bottom:1px solid #e1e6eb;">
                      <p style="margin:0 0 6px;color:#7f8995;font-size:11px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;">Cantidad</p>
                      <p style="margin:0;color:#23262b;font-size:18px;font-weight:700;">${quantity}</p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:20px;">
                      <p style="margin:0 0 6px;color:#7f8995;font-size:11px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;">Total</p>
                      <p style="margin:0;color:#23262b;font-size:24px;font-weight:800;">${total}</p>
                    </td>
                    <td align="right" style="padding:20px;">
                      <p style="margin:0 0 6px;color:#7f8995;font-size:11px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;">Envío</p>
                      <p style="margin:0;color:#23262b;font-size:15px;font-weight:700;">Incluido</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:0 34px 32px;">
                <p style="margin:0 0 8px;color:#7f8995;font-size:11px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;">Dirección de entrega</p>
                <p style="margin:0;color:#666d76;font-size:15px;line-height:1.65;">${shippingAddress}</p>
              </td>
            </tr>
            <tr>
              <td style="padding:26px 34px;background:#23262b;">
                <p style="margin:0;color:#f8f9fb;font-size:14px;line-height:1.7;">
                  Gracias por elegir SPAGRAMA. Este correo confirma tu pago; conservaremos tus datos de compra para dar seguimiento a tu pedido.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function buildInternalNotificationText(session) {
  const customerName = getCustomerName(session);
  const email = getCustomerEmail(session);
  const total = formatMoney(session.amount_total, session.currency);
  const quantity = session.metadata && session.metadata.quantity ? session.metadata.quantity : "1";
  const address = formatShippingAddress(getShippingDetails(session), "\n");

  return [
    "Nueva venta GlowAge",
    "",
    `Cliente: ${customerName || "Sin nombre"}`,
    `Email: ${email || "Sin email"}`,
    `Cantidad: ${quantity}`,
    `Total: ${total}`,
    "",
    "Dirección:",
    address,
    "",
    `Stripe session: ${session.id}`,
  ].join("\n");
}

function buildInternalNotificationEmail(session) {
  const customerName = escapeHtml(getCustomerName(session) || "Sin nombre");
  const email = escapeHtml(getCustomerEmail(session) || "Sin email");
  const total = formatMoney(session.amount_total, session.currency);
  const quantity = session.metadata && session.metadata.quantity ? session.metadata.quantity : "1";
  const shippingAddress = formatShippingAddress(getShippingDetails(session));
  const sessionId = escapeHtml(session.id);

  return `<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Nueva venta GlowAge</title>
  </head>
  <body style="margin:0;background:#eef1f4;color:#23262b;font-family:Manrope,Arial,sans-serif;">
    <div style="display:none;overflow:hidden;line-height:1px;opacity:0;max-height:0;max-width:0;">
      Nueva venta de GlowAge confirmada en Stripe.
    </div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#eef1f4;padding:32px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:680px;background:#fbfcfd;border:1px solid #dfe4ea;border-radius:28px;overflow:hidden;box-shadow:0 22px 60px rgba(44,52,62,0.12);">
            <tr>
              <td style="padding:34px 34px 18px;">
                <p style="margin:0 0 18px;color:#7f8995;font-size:12px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;">SPAGRAMA</p>
                <h1 style="margin:0;color:#23262b;font-family:Georgia,'Times New Roman',serif;font-size:44px;line-height:0.95;font-weight:500;">Nueva venta GlowAge.</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:0 34px 24px;">
                <p style="margin:0;color:#666d76;font-size:16px;line-height:1.7;">
                  Stripe confirmó una compra. Estos son los datos principales para preparar el pedido y dar seguimiento.
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:0 34px 28px;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border:1px solid #e1e6eb;border-radius:20px;background:#f5f7f9;">
                  <tr>
                    <td style="padding:20px;border-bottom:1px solid #e1e6eb;">
                      <p style="margin:0 0 6px;color:#7f8995;font-size:11px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;">Cliente</p>
                      <p style="margin:0;color:#23262b;font-size:18px;font-weight:700;">${customerName}</p>
                    </td>
                    <td align="right" style="padding:20px;border-bottom:1px solid #e1e6eb;">
                      <p style="margin:0 0 6px;color:#7f8995;font-size:11px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;">Cantidad</p>
                      <p style="margin:0;color:#23262b;font-size:18px;font-weight:700;">${quantity}</p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:20px;">
                      <p style="margin:0 0 6px;color:#7f8995;font-size:11px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;">Email</p>
                      <p style="margin:0;color:#23262b;font-size:16px;font-weight:700;">${email}</p>
                    </td>
                    <td align="right" style="padding:20px;">
                      <p style="margin:0 0 6px;color:#7f8995;font-size:11px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;">Total</p>
                      <p style="margin:0;color:#23262b;font-size:22px;font-weight:800;">${total}</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:0 34px 26px;">
                <p style="margin:0 0 8px;color:#7f8995;font-size:11px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;">Dirección de entrega</p>
                <p style="margin:0;color:#23262b;font-size:16px;line-height:1.65;font-weight:600;">${shippingAddress}</p>
              </td>
            </tr>
            <tr>
              <td style="padding:0 34px 34px;">
                <p style="margin:0 0 8px;color:#7f8995;font-size:11px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;">Stripe Session</p>
                <p style="margin:0;color:#666d76;font-family:Menlo,Consolas,monospace;font-size:12px;line-height:1.6;word-break:break-all;">${sessionId}</p>
              </td>
            </tr>
            <tr>
              <td style="padding:24px 34px;background:#23262b;">
                <p style="margin:0;color:#f8f9fb;font-size:14px;line-height:1.7;">
                  Notificación interna para preparación y seguimiento del pedido GlowAge.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

module.exports = {
  buildInternalNotificationEmail,
  buildInternalNotificationText,
  buildOrderEmail,
};
