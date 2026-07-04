"use client";

import { UseFormReturn } from "react-hook-form";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { OnboardingFormValues } from "@/lib/schemas/onboarding";
import { PROJECT_ADDONS } from "@/lib/pricing";

export function ProjectBriefStep({ 
  form, 
  selectedProjects 
}: { 
  form: UseFormReturn<OnboardingFormValues>;
  selectedProjects: string[];
}) {
  const fmt = (v: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(v);

  const projectsTotal = selectedProjects.reduce(
    (sum, id) => sum + (PROJECT_ADDONS.find((p) => p.id === id)?.price ?? 0), 0
  );

  return (
    <div className="space-y-6 w-full text-left">
      <div>
        <Badge variant="outline" className="text-primary border-primary/30 mb-3">One-Time Project</Badge>
        <h2 className="text-2xl font-serif font-bold mb-2">Project Brief</h2>
        <p className="text-muted-foreground">Tell us what you need and how to reach you.</p>
      </div>

      {selectedProjects.length > 0 && (
        <div className="bg-secondary/40 border rounded-xl p-5 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
            Selected project{selectedProjects.length > 1 ? "s" : ""}
          </p>
          {selectedProjects.map((id) => {
            const proj = PROJECT_ADDONS.find((p) => p.id === id);
            return proj ? (
              <div key={id} className="flex items-center justify-between text-sm">
                <span className="font-medium">{proj.label}</span>
                <span className="text-primary font-bold">{fmt(proj.price)}</span>
              </div>
            ) : null;
          })}
          {selectedProjects.length > 1 && (
            <div className="flex items-center justify-between text-sm font-semibold border-t border-border/40 pt-2 mt-2">
              <span>Total</span>
              <span className="text-primary">{fmt(projectsTotal)}</span>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField control={form.control} name="company.name" render={({ field }) => (
          <FormItem><FormLabel>Company Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="contact.email" render={({ field }) => (
          <FormItem>
            <FormLabel>Email Address <span className="text-destructive">*</span></FormLabel>
            <FormControl><Input type="email" placeholder="you@company.com" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
      </div>

      <FormField control={form.control} name="goals.painPoints" render={({ field }) => (
        <FormItem>
          <FormLabel>Tell us about your project <span className="text-muted-foreground font-normal">(optional)</span></FormLabel>
          <FormDescription>Any background, goals, constraints, or timelines we should know.</FormDescription>
          <FormControl>
            <Textarea
              className="min-h-[120px]"
              placeholder="Describe your project, goals, audience, or anything else that helps us scope the work..."
              {...field}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )} />
    </div>
  );
}
