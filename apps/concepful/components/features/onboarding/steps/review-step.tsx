"use client";

import { UseFormReturn } from "react-hook-form";
import { Check } from "lucide-react";
import { OnboardingFormValues } from "@/lib/schemas/onboarding";
import { TIERS, MONTHLY_ADDONS, AI_OPS, PROJECT_ADDONS, calcMonthlyTotal, calcAnnualTotal, TierKey, AiOpsKey } from "@/lib/pricing";

interface ReviewStepProps {
  form: UseFormReturn<OnboardingFormValues>;
  isOneTime: boolean;
  tier: string;
  billing: string;
  addOns: string[];
  aiOpsLevel: string;
  selectedProjects: string[];
}

export function ReviewStep({
  form,
  isOneTime,
  tier,
  billing,
  addOns,
  aiOpsLevel,
  selectedProjects,
}: ReviewStepProps) {
  const fmt = (v: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(v);

  const projectsTotal = selectedProjects.reduce(
    (sum, id) => sum + (PROJECT_ADDONS.find((p) => p.id === id)?.price ?? 0), 0
  );

  return (
    <div className="space-y-8 w-full text-left">
      <div>
        <h2 className="text-2xl font-serif font-bold mb-2">{isOneTime ? "Ready to submit" : "Final Review"}</h2>
        <p className="text-muted-foreground">
          {isOneTime 
            ? "Review your project request before we get started."
            : "Review your partnership configuration before submitting."}
        </p>
      </div>

      <div className="bg-secondary/30 border rounded-xl p-6 space-y-6">
        {/* Account (Shared) */}
        <div className="flex justify-between items-center pb-4 border-b border-border/50">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Account</p>
            <p className="font-mono font-semibold">@{form.getValues().account.username}</p>
          </div>
          <Check className="h-5 w-5 text-emerald-500" />
        </div>

        {isOneTime ? (
          <>
            {selectedProjects.length > 0 ? (
              <div className="pb-4 border-b border-border/50">
                <p className="text-xs text-muted-foreground mb-3">Selected Projects</p>
                <div className="space-y-2">
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
                    <div className="flex items-center justify-between text-sm font-semibold border-t border-border/40 pt-2 mt-1">
                      <span>Project Total</span>
                      <span className="text-primary">{fmt(projectsTotal)}</span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="pb-4 border-b border-border/50 text-sm text-muted-foreground">
                No projects selected — we'll reach out to scope your custom request.
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm font-semibold mb-2">Contact</p>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  {form.getValues().company.name && <li>{form.getValues().company.name}</li>}
                  <li>{form.getValues().contact.email || "No email provided"}</li>
                </ul>
              </div>
              {form.getValues().goals.painPoints && (
                <div>
                  <p className="text-sm font-semibold mb-2">Project Brief</p>
                  <p className="text-sm text-muted-foreground line-clamp-4">{form.getValues().goals.painPoints}</p>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <div className="flex justify-between items-center pb-4 border-b border-border/50">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Selected Plan</p>
                <p className="font-serif font-bold text-xl">{TIERS[tier as TierKey].name} ({billing})</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground mb-1">Estimated {billing === "monthly" ? "Monthly" : "Monthly Avg"}</p>
                <p className="font-bold text-2xl">
                  ${billing === "annual"
                    ? (calcAnnualTotal(tier as TierKey, calcMonthlyTotal(tier as TierKey, addOns, aiOpsLevel as any), billing as any) / 12).toFixed(0)
                    : calcMonthlyTotal(tier as TierKey, addOns, aiOpsLevel as any).toFixed(0)}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <p className="text-sm font-semibold mb-3">Add-ons & AI</p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {addOns.length === 0 && aiOpsLevel === "none" && <li>None selected</li>}
                  {addOns.map((id) => {
                    const a = MONTHLY_ADDONS.find((x) => x.id === id);
                    return a ? <li key={id}>+ {a.label}</li> : null;
                  })}
                  {aiOpsLevel !== "none" && <li>+ {AI_OPS[aiOpsLevel as AiOpsKey].label}</li>}
                </ul>
              </div>
              <div>
                <p className="text-sm font-semibold mb-3">Contact Details</p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>{form.getValues().company.name}</li>
                  <li>{form.getValues().contact.name}</li>
                  <li>{form.getValues().contact.email}</li>
                </ul>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
