# SPAGRAMA GlowAge

Landing premium para GlowAge con compra por Stripe Checkout, correos de confirmación con Resend y SEO técnico para `https://www.spagrama.com/`.

## Variables de entorno

Configura estas variables en Vercel, en el proyecto conectado al repo:

```bash
APP_URL=https://www.spagrama.com
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=SPAGRAMA <ventas@updates.spagrama.com>
SPAGRAMA_NOTIFY_EMAIL=
```

`SPAGRAMA_NOTIFY_EMAIL` es opcional. Si lo configuras, recibirá una notificación interna por cada venta.

## Stripe

El checkout se crea en:

```text
/api/create-checkout-session
```

El webhook para confirmar pago y mandar email es:

```text
https://www.spagrama.com/api/stripe-webhook
```

En Stripe, registra ese endpoint y escucha al menos el evento:

```text
checkout.session.completed
```

Después copia el signing secret del webhook en `STRIPE_WEBHOOK_SECRET`.

## Resend

El dominio de envío preparado es:

```text
updates.spagrama.com
```

El remitente recomendado es:

```text
SPAGRAMA <ventas@updates.spagrama.com>
```

## Desarrollo

```bash
npm install
npm run check
npx vercel dev
```
