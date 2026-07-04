"use client";

import { UseFormReturn } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { OnboardingFormValues } from "@/lib/schemas/onboarding";

export function BrandInputsStep({ form }: { form: UseFormReturn<OnboardingFormValues> }) {
  return (
    <div className="space-y-6 w-full text-left">
      <div>
        <h2 className="text-2xl font-serif font-bold mb-2">Brand Inputs</h2>
        <p className="text-muted-foreground">Help us align with your visual identity.</p>
      </div>

      <div className="bg-primary/5 p-4 rounded-lg text-sm text-primary">
        <strong>Note:</strong> Full logo and asset upload will be available in your dashboard after onboarding.
      </div>

      <FormField control={form.control} name="brand.toneWords" render={({ field }) => (
        <FormItem>
          <FormLabel>Tone Words (comma separated)</FormLabel>
          <FormDescription>e.g., confident, minimal, warm, authoritative</FormDescription>
          <FormControl><Input placeholder="e.g. confident, minimal, warm" {...field} /></FormControl>
          <FormMessage />
        </FormItem>
      )} />

      <FormField control={form.control} name="brand.competitors" render={({ field }) => (
        <FormItem>
          <FormLabel>Competitors (comma separated)</FormLabel>
          <FormControl><Input placeholder="e.g. Stripe, Linear, Vercel" {...field} /></FormControl>
          <FormMessage />
        </FormItem>
      )} />

      <div className="pt-4">
        <p className="text-sm text-muted-foreground italic">You can add specific colors and fonts later in the Brand Center.</p>
      </div>
    </div>
  );
}
