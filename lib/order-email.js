function formatMoney(amountTotal, currency) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: (currency || "mxn").toUpperCase(),
  }).format((amountTotal || 0) / 100);
}

function formatShippingAddress(details) {
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
    .join("<br />");
}

function buildOrderEmail(session) {
  const quantity = session.metadata && session.metadata.quantity ? session.metadata.quantity : "1";
  const total = formatMoney(session.amount_total, session.currency);
  const customerName = session.customer_details && session.customer_details.name;
  const shippingAddress = formatShippingAddress(session.shipping_details);

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
                  ${customerName ? `Hola ${customerName}, ` : ""}recibimos tu compra de GlowAge. Prepararemos tu pedido para que esta experiencia de spa en casa llegue a ti con el mismo cuidado con el que fue creada.
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

function buildInternalNotification(session) {
  const email = session.customer_details && session.customer_details.email;
  const total = formatMoney(session.amount_total, session.currency);
  const quantity = session.metadata && session.metadata.quantity ? session.metadata.quantity : "1";
  const address = formatShippingAddress(session.shipping_details).replace(/<br \/>/g, "\n");

  return [
    "Nueva venta GlowAge",
    "",
    `Cliente: ${(session.customer_details && session.customer_details.name) || "Sin nombre"}`,
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

module.exports = {
  buildInternalNotification,
  buildOrderEmail,
};
