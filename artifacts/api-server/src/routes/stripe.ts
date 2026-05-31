import { Router } from 'express';
import { getUncachableStripeClient, getStripePublishableKey } from '../stripeClient';

const router = Router();

const TIER_PRICES: Record<string, number> = {
  signal: 550000,
  pulse: 1200000,
  cortex: 2400000,
};

const ADDON_PRICES: Record<string, number> = {
  video_production: 150000,
  motion_graphics: 80000,
  ux_ui_design: 200000,
  seo_content: 60000,
  pr_media: 120000,
  social_mgmt: 90000,
};

const AI_OPS_PRICES: Record<string, number> = {
  none: 0,
  basic: 0,
  advanced: 50000,
  embedded: 150000,
};

function computeAmount(body: {
  tier: string;
  billing: string;
  addOns: string[];
  aiOpsLevel: string;
}): number {
  const base = TIER_PRICES[body.tier] ?? 550000;
  const addOnTotal = (body.addOns ?? []).reduce((s, id) => s + (ADDON_PRICES[id] ?? 0), 0);
  const aiOps = AI_OPS_PRICES[body.aiOpsLevel] ?? 0;
  const monthly = base + addOnTotal + aiOps;
  if (body.billing === 'annual') {
    return Math.round(monthly * 12 * 0.875);
  }
  return monthly;
}

router.get('/stripe/config', async (_req, res) => {
  try {
    const publishableKey = await getStripePublishableKey();
    res.json({ publishableKey });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/stripe/create-payment-intent', async (req, res) => {
  try {
    const { tier, billing, addOns, aiOpsLevel, email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const amount = computeAmount({ tier, billing, addOns, aiOpsLevel });
    const stripe = await getUncachableStripeClient();

    const customer = await stripe.customers.create({
      email,
      metadata: { tier, billing, aiOpsLevel },
    });

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'usd',
      customer: customer.id,
      automatic_payment_methods: { enabled: true },
      metadata: {
        tier,
        billing,
        aiOpsLevel,
        addOns: (addOns ?? []).join(','),
        email,
      },
      description: `Concepful ${tier} plan — ${billing}`,
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      amount,
      customerId: customer.id,
    });
  } catch (err: any) {
    console.error('PaymentIntent error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

export default router;
