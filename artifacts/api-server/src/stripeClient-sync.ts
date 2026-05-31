import { StripeSync } from 'stripe-replit-sync';
import { getStripeSecretKey } from './stripeClient';

let _stripeSync: StripeSync | null = null;

export async function getStripeSync(): Promise<StripeSync> {
  if (!_stripeSync) {
    const secretKey = await getStripeSecretKey();
    _stripeSync = new StripeSync({
      poolConfig: { connectionString: process.env.DATABASE_URL!, max: 2 },
      stripeSecretKey: secretKey,
    });
  }
  return _stripeSync;
}
