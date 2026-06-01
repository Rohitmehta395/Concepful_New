import { Router } from 'express';
import { getUncachableStripeClient, getStripePublishableKey } from '../stripeClient';

const router = Router();

const TIER_BASE: Record<string, number> = {
  signal: 250000,
  pulse:  750000,
  cortex: 1800000,
};

const ADDON_PRICES: Record<string, number> = {
  async_pack:        150000,
  rush_delivery:     150000,
  extra_revisions:   100000,
  strategy_session:  150000,
  ai_content:        100000,
  brand_photography: 300000,
};

const AI_OPS_PRICES: Record<string, number> = {
  none:     0,
  basic:    0,
  advanced: 250000,
  embedded: 600000,
};

const ANNUAL_DISCOUNTS: Record<string, number> = {
  signal: 0.10,
  pulse:  0.12,
  cortex: 0.15,
};

function computeAmount(body: {
  tier: string;
  billing: string;
  addOns: string[];
  aiOpsLevel: string;
}): number {
  const base      = TIER_BASE[body.tier] ?? 250000;
  const addOnSum  = (body.addOns ?? []).reduce((s, id) => s + (ADDON_PRICES[id] ?? 0), 0);
  const aiOps     = AI_OPS_PRICES[body.aiOpsLevel] ?? 0;
  const monthly   = base + addOnSum + aiOps;

  if (body.billing === 'annual') {
    const discount = ANNUAL_DISCOUNTS[body.tier] ?? 0.10;
    return Math.round(monthly * 12 * (1 - discount));
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

    if (!email) return res.status(400).json({ error: 'Email is required' });

    const amount = computeAmount({ tier, billing, addOns, aiOpsLevel });
    const stripe = await getUncachableStripeClient();

    const TIER_NAMES: Record<string, string> = {
      signal: 'Core', pulse: 'Studio', cortex: 'Department',
    };

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
      description: `Concepful ${TIER_NAMES[tier] ?? tier} plan — ${billing}`,
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
