import { useState, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import { loadStripe, type Stripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { ArrowLeft, Lock, Shield } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { SiteLayout } from "@/components/layout/site-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { usePricingStore } from "@/hooks/use-pricing-store";
import {
  TIERS,
  MONTHLY_ADDONS,
  AI_OPS,
  calcMonthlyTotal,
  calcAnnualTotal,
} from "@/lib/pricing";

const fmt = (v: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(v);

function OrderSummary() {
  const { tier, billing, addOns, aiOpsLevel } = usePricingStore();
  const t = TIERS[tier];
  const monthly = calcMonthlyTotal(tier, addOns, aiOpsLevel);
  const annual = calcAnnualTotal(tier, monthly, billing);
  const display = billing === "annual" ? Math.round(annual / 12) : monthly;
  const tierPrice =
    billing === "annual"
      ? t.monthly * (1 - t.annualDiscount)
      : t.monthly;

  return (
    <div className="space-y-0">
      <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">
        Order Summary
      </h2>

      <div className="space-y-3 text-sm">
        <div className="flex justify-between items-start">
          <div>
            <p className="font-semibold text-foreground">{t.name} Plan</p>
            <p className="text-muted-foreground text-xs capitalize">{billing} billing</p>
          </div>
          <span className="font-medium tabular-nums">{fmt(tierPrice)}<span className="text-muted-foreground text-xs">/mo</span></span>
        </div>

        {addOns.length > 0 && (
          <div className="pt-3 border-t border-border/50 space-y-2">
            {addOns.map((id) => {
              const a = MONTHLY_ADDONS.find((x) => x.id === id);
              return a ? (
                <div key={id} className="flex justify-between text-muted-foreground">
                  <span>{a.label}</span>
                  <span className="tabular-nums">{fmt(a.price)}<span className="text-xs">/mo</span></span>
                </div>
              ) : null;
            })}
          </div>
        )}

        {AI_OPS[aiOpsLevel].price > 0 && (
          <div className="flex justify-between text-muted-foreground">
            <span>{AI_OPS[aiOpsLevel].label}</span>
            <span className="tabular-nums">{fmt(AI_OPS[aiOpsLevel].price)}<span className="text-xs">/mo</span></span>
          </div>
        )}
      </div>

      <div className="mt-5 pt-4 border-t border-border">
        <div className="flex justify-between items-end">
          <div>
            <p className="text-xs text-muted-foreground">
              {billing === "annual" ? "Billed annually" : "Billed monthly"}
            </p>
            <p className="text-sm font-medium">Monthly total</p>
          </div>
          <p className="text-2xl font-bold tracking-tight">{fmt(display)}</p>
        </div>

        {billing === "annual" && (
          <div className="mt-3 p-3 bg-primary/8 rounded-lg border border-primary/20">
            <div className="flex justify-between text-sm">
              <span className="text-primary font-medium">
                Annual total ({Math.round(TIERS[tier].annualDiscount * 100)}% savings)
              </span>
              <span className="font-semibold tabular-nums">{fmt(annual)}</span>
            </div>
          </div>
        )}
      </div>

      <div className="mt-5 pt-4 border-t border-border/50 space-y-2">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Lock className="h-3 w-3 shrink-0" />
          <span>Payments processed securely by Stripe</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Shield className="h-3 w-3 shrink-0" />
          <span>Cancel anytime — no long-term commitment</span>
        </div>
      </div>
    </div>
  );
}

interface PaymentFormProps {
  clientSecret: string;
  onSuccess: () => void;
  email: string;
  phone: string;
}

function PaymentForm({ clientSecret, onSuccess, email, phone }: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [, setLocation] = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setPaying(true);
    setError(null);

    const baseUrl = window.location.origin + (import.meta.env.BASE_URL ?? "/").replace(/\/$/, "");

    const { error: submitError } = await elements.submit();
    if (submitError) {
      setError(submitError.message ?? "Payment failed.");
      setPaying(false);
      return;
    }

    const { error: confirmError } = await stripe.confirmPayment({
      elements,
      clientSecret,
      confirmParams: {
        return_url: `${baseUrl}/thank-you`,
        payment_method_data: {
          billing_details: { email, phone: phone || undefined },
        },
      },
    });

    if (confirmError) {
      setError(confirmError.message ?? "Payment failed.");
      setPaying(false);
    } else {
      onSuccess();
      setLocation("/thank-you");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement
        options={{
          layout: "tabs",
          wallets: { applePay: "auto", googlePay: "auto" },
        }}
      />

      {error && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg p-3"
        >
          {error}
        </motion.p>
      )}

      <Button
        type="submit"
        size="lg"
        className="w-full h-14 text-base font-semibold"
        disabled={!stripe || paying}
      >
        {paying ? (
          <span className="flex items-center gap-2">
            <span className="h-4 w-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            Processing…
          </span>
        ) : (
          "Complete Purchase"
        )}
      </Button>

      <p className="text-center text-xs text-muted-foreground flex items-center justify-center gap-1.5">
        <Lock className="h-3 w-3" />
        Secured by Stripe · 256-bit encryption
      </p>
    </form>
  );
}

export default function Checkout() {
  const [, setLocation] = useLocation();
  const { tier, billing, addOns, aiOpsLevel } = usePricingStore();

  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [emailTouched, setEmailTouched] = useState(false);
  const [emailValid, setEmailValid] = useState(false);

  const [stripePromise, setStripePromise] = useState<Promise<Stripe | null> | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loadingPayment, setLoadingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [intentCreated, setIntentCreated] = useState(false);

  const validateEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

  useEffect(() => {
    setEmailValid(validateEmail(email));
  }, [email]);

  const initializePayment = useCallback(async () => {
    if (intentCreated || !emailValid) return;
    setLoadingPayment(true);
    setPaymentError(null);

    try {
      const configRes = await fetch("/api/stripe/config");
      const { publishableKey } = await configRes.json();
      setStripePromise(loadStripe(publishableKey));

      const intentRes = await fetch("/api/stripe/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier, billing, addOns, aiOpsLevel, email }),
      });
      const data = await intentRes.json();

      if (!intentRes.ok) throw new Error(data.error ?? "Failed to initialize payment");

      setClientSecret(data.clientSecret);
      setIntentCreated(true);
    } catch (err: any) {
      setPaymentError(err.message ?? "Failed to initialize payment.");
    } finally {
      setLoadingPayment(false);
    }
  }, [emailValid, intentCreated, tier, billing, addOns, aiOpsLevel, email]);

  const handleEmailBlur = () => {
    setEmailTouched(true);
    if (emailValid) initializePayment();
  };

  const appearance = {
    theme: "night" as const,
    variables: {
      colorPrimary: "hsl(349, 90%, 54%)",
      colorBackground: "hsl(232, 28%, 14%)",
      colorSurface: "hsl(232, 28%, 16%)",
      colorText: "hsl(0, 0%, 95%)",
      colorTextSecondary: "hsl(0, 0%, 65%)",
      colorDanger: "hsl(0, 72%, 51%)",
      borderRadius: "8px",
      fontFamily: "'Inter', sans-serif",
    },
    rules: {
      ".Input": {
        backgroundColor: "hsl(232, 28%, 18%)",
        borderColor: "hsl(232, 28%, 28%)",
      },
      ".Input:focus": {
        borderColor: "hsl(349, 90%, 54%)",
        boxShadow: "0 0 0 1px hsl(349, 90%, 54%)",
      },
    },
  };

  return (
    <SiteLayout>
      <div className="container mx-auto px-4 sm:px-6 py-10 max-w-5xl">
        <button
          onClick={() => setLocation("/pricing")}
          className="mb-8 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to pricing
        </button>

        <div className="mb-10">
          <h1 className="font-serif text-3xl md:text-4xl font-bold tracking-tight">
            Complete your purchase
          </h1>
          <p className="text-muted-foreground mt-2">
            You're one step away from activating your {TIERS[tier].name} plan.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 lg:gap-14">
          <div className="lg:col-span-3 space-y-8">
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">
                Contact Information
              </h2>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="email">
                    Email <span className="text-primary">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onBlur={handleEmailBlur}
                    className="h-11"
                    autoComplete="email"
                  />
                  {emailTouched && !emailValid && (
                    <p className="text-xs text-destructive">Please enter a valid email address.</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="phone">
                    Phone{" "}
                    <span className="text-muted-foreground font-normal">(optional)</span>
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="h-11"
                    autoComplete="tel"
                  />
                </div>
              </div>
            </div>

            <div className="lg:hidden p-5 rounded-xl border border-border bg-card">
              <OrderSummary />
            </div>

            <div>
              <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-5">
                Payment
              </h2>

              <AnimatePresence mode="wait">
                {!emailValid && (
                  <motion.div
                    key="placeholder"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="rounded-xl border border-dashed border-border/60 bg-secondary/20 p-6 text-center text-sm text-muted-foreground"
                  >
                    Enter your email above to load payment options
                  </motion.div>
                )}

                {emailValid && loadingPayment && (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="rounded-xl border border-border bg-card p-6 flex items-center justify-center gap-3 text-sm text-muted-foreground"
                  >
                    <span className="h-4 w-4 border-2 border-primary/40 border-t-primary rounded-full animate-spin" />
                    Loading payment options…
                  </motion.div>
                )}

                {emailValid && paymentError && (
                  <motion.div
                    key="error"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive"
                  >
                    {paymentError}
                  </motion.div>
                )}

                {emailValid && !loadingPayment && clientSecret && stripePromise && (
                  <motion.div
                    key="payment"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Elements
                      stripe={stripePromise}
                      options={{ clientSecret, appearance }}
                    >
                      <PaymentForm
                        clientSecret={clientSecret}
                        onSuccess={() => {}}
                        email={email}
                        phone={phone}
                      />
                    </Elements>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="hidden lg:block lg:col-span-2">
            <div className="sticky top-24 p-6 rounded-xl border border-border bg-card shadow-lg">
              <OrderSummary />
            </div>
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}
