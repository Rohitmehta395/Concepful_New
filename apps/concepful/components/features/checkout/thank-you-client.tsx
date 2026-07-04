"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle, ArrowRight, Sparkles, Calendar, Users, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePricingStore } from "@/hooks/use-pricing-store";
import { useAuthState } from "@/hooks/use-auth-state";
import { TIERS } from "@/lib/pricing";

const onboardingSteps = [
  {
    icon: Users,
    title: "Meet your creative team",
    description: "We'll introduce you to your dedicated creative lead and brief them on your brand.",
  },
  {
    icon: Calendar,
    title: "Schedule your kickoff call",
    description: "A focused 45-min session to align on priorities, tone, and your first deliverables.",
  },
  {
    icon: Sparkles,
    title: "Brand intelligence setup",
    description: "Your brand memory and AI profile get configured so every asset feels like you.",
  },
  {
    icon: Zap,
    title: "First deliverables in 5 days",
    description: "Your creative engine goes live. Expect your first batch within the first week.",
  },
];

export function ThankYouClient() {
  const router = useRouter();
  const { tier } = usePricingStore();
  const { login } = useAuthState();
  const t = TIERS[tier];
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    login("test@concepful.com", tier);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const particles: {
      x: number; y: number; vx: number; vy: number;
      size: number; opacity: number; color: string;
    }[] = [];

    const colors = ["hsl(349,90%,54%)", "hsl(349,90%,70%)", "hsl(232,28%,60%)", "#fff"];

    for (let i = 0; i < 80; i++) {
      particles.push({
        x: canvas.width / 2,
        y: canvas.height * 0.35,
        vx: (Math.random() - 0.5) * 8,
        vy: Math.random() * -10 - 2,
        size: Math.random() * 6 + 2,
        opacity: 1,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }

    let frame = 0;
    const animate = () => {
      if (frame > 120) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.25;
        p.opacity = Math.max(0, p.opacity - 0.012);
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;
      frame++;
      requestAnimationFrame(animate);
    };

    const timeout = setTimeout(animate, 300);
    return () => clearTimeout(timeout);
  }, [mounted]);

  if (!mounted) {
    return <div className="min-h-screen bg-background" />;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="relative flex-1 flex flex-col items-center justify-start pt-16 pb-24 px-4">
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none"
          aria-hidden="true"
        />

        <div className="relative z-10 w-full max-w-2xl mx-auto text-center">
          <motion.div
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 18, delay: 0.1 }}
            className="flex justify-center mb-6"
          >
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping opacity-60" />
              <CheckCircle className="h-20 w-20 text-primary relative" strokeWidth={1.5} />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
          >
            <p className="text-sm font-semibold uppercase tracking-widest text-primary mb-3">
              Purchase confirmed
            </p>
            <h1 className="font-serif text-4xl md:text-5xl font-bold tracking-tight mb-4">
              Welcome to Concepful.
            </h1>
            <p className="text-lg text-muted-foreground max-w-md mx-auto">
              Your <span className="text-foreground font-medium">{t.name}</span> plan is active.
              A receipt has been sent to your email.
            </p>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          className="relative z-10 w-full max-w-2xl mx-auto mt-14"
        >
          <div className="rounded-2xl border border-border bg-card/80 backdrop-blur-sm overflow-hidden">
            <div className="px-6 pt-6 pb-4 border-b border-border/60">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                What happens next
              </p>
            </div>
            <div className="divide-y divide-border/40">
              {onboardingSteps.map((step, i) => (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.65 + i * 0.08 }}
                  className="flex items-start gap-4 px-6 py-4"
                >
                  <div className="mt-0.5 h-8 w-8 rounded-lg bg-primary/12 flex items-center justify-center shrink-0">
                    <step.icon className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm text-foreground">{step.title}</p>
                    <p className="text-sm text-muted-foreground mt-0.5">{step.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="relative z-10 mt-10 flex flex-col sm:flex-row gap-3 w-full max-w-sm mx-auto"
        >
          <Button
            size="lg"
            className="flex-1 h-12 text-base font-semibold"
            onClick={() => router.push("/onboarding")}
          >
            Start onboarding
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="flex-1 h-12"
            onClick={() => router.push("/dashboard")}
          >
            Go to dashboard
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
