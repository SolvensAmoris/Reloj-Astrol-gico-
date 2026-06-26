// api/crear-pago.js
// Coloca este archivo en: /api/crear-pago.js (en tu proyecto Vercel)
// Variables de entorno requeridas:
//   STRIPE_SECRET_KEY  →  tu clave secreta de Stripe (empieza con sk_live_ o sk_test_)

import Stripe from 'stripe';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { amount = 300, currency = 'usd' } = req.body;

  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeSecretKey) {
    console.error('Falta STRIPE_SECRET_KEY en las variables de entorno.');
    return res.status(500).json({ error: 'Configuración del servidor incompleta.' });
  }

  try {
    const stripe = new Stripe(stripeSecretKey, { apiVersion: '2024-04-10' });

    const paymentIntent = await stripe.paymentIntents.create({
      amount,        // en centavos: 300 = $3.00 USD
      currency,
      automatic_payment_methods: { enabled: true },
      metadata: {
        producto: 'Carta Astral Pro · Solvens Amoris',
      },
    });

    return res.status(200).json({ clientSecret: paymentIntent.client_secret });

  } catch (error) {
    console.error('Error de Stripe:', error);
    return res.status(500).json({ error: error.message });
  }
}
