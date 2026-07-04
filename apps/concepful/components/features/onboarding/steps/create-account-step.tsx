"use client";

import { useState } from "react";
import { User, EyeOff, Eye, Check } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { OnboardingFormValues } from "@/lib/schemas/onboarding";
import { cn } from "@/lib/utils";

function PasswordStrength({ password }: { password?: string }) {
  const checks = [
    { label: "8+ characters", ok: (password?.length ?? 0) >= 8 },
    { label: "Uppercase letter", ok: /[A-Z]/.test(password || "") },
    { label: "Number", ok: /\d/.test(password || "") },
    { label: "Special character", ok: /[^a-zA-Z0-9]/.test(password || "") },
  ];
  const score = checks.filter((c) => c.ok).length;
  const colors = ["bg-destructive", "bg-orange-500", "bg-amber-500", "bg-emerald-500", "bg-emerald-500"];
  const labels = ["", "Weak", "Fair", "Good", "Strong"];

  if (!password) return null;

  return (
    <div className="mt-2 space-y-2">
      <div className="flex gap-1.5">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={cn("h-1.5 flex-1 rounded-full transition-all duration-300", i <= score ? colors[score] : "bg-border")}
          />
        ))}
      </div>
      <div className="flex items-center justify-between">
        <div className="flex gap-3">
          {checks.map(({ label, ok }) => (
            <span key={label} className={cn("text-[10px] flex items-center gap-1", ok ? "text-emerald-600" : "text-muted-foreground")}>
              <Check className={cn("h-2.5 w-2.5", ok ? "opacity-100" : "opacity-30")} />
              {label}
            </span>
          ))}
        </div>
        {score > 0 && (
          <span className={cn("text-xs font-medium", score >= 3 ? "text-emerald-600" : "text-muted-foreground")}>
            {labels[score]}
          </span>
        )}
      </div>
    </div>
  );
}

export function CreateAccountStep({ form }: { form: UseFormReturn<OnboardingFormValues> }) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const password = form.watch("account.password");

  return (
    <div className="space-y-6 w-full text-left">
      <div>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="h-5 w-5 text-primary" />
          </div>
          <Badge variant="outline" className="text-primary border-primary/30">New account</Badge>
        </div>
        <h2 className="text-2xl font-serif font-bold mb-2">Create your account</h2>
        <p className="text-muted-foreground">
          Set up your login credentials to access your client portal after onboarding.
        </p>
      </div>

      <FormField
        control={form.control}
        name="account.username"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Username</FormLabel>
            <FormDescription>
              This is your unique handle in the portal (e.g. <span className="font-mono">acme-co</span>).
            </FormDescription>
            <FormControl>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">@</span>
                <Input
                  {...field}
                  placeholder="your-company"
                  className="pl-7 h-11"
                  autoComplete="username"
                  autoCapitalize="none"
                />
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="account.password"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Password</FormLabel>
            <FormControl>
              <div className="relative">
                <Input
                  {...field}
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a strong password"
                  className="pr-10 h-11"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </FormControl>
            <PasswordStrength password={password} />
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="account.confirmPassword"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Confirm Password</FormLabel>
            <FormControl>
              <div className="relative">
                <Input
                  {...field}
                  type={showConfirm ? "text" : "password"}
                  placeholder="Re-enter your password"
                  className="pr-10 h-11"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <p className="text-xs text-muted-foreground pt-2">
        Your credentials are encrypted and stored securely. You'll use these to log into your client portal.
      </p>
    </div>
  );
}
