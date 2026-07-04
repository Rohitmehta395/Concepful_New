"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Progress } from "@/components/ui/progress";
import { usePricingStore } from "@/hooks/use-pricing-store";
import { onboardingFormSchema, type OnboardingFormValues } from "@/lib/schemas/onboarding";
import { useToast } from "@/hooks/use-toast";
import { calcMonthlyTotal, calcAnnualTotal, PROJECT_ADDONS } from "@/lib/pricing";
import { useSubmitOnboarding } from "@workspace/api-client-react";

import { CreateAccountStep } from "./steps/create-account-step";
import { CompanyBasicsStep } from "./steps/company-basics-step";
import { ProjectBriefStep } from "./steps/project-brief-step";
import { StrategicGoalsStep } from "./steps/strategic-goals-step";
import { BrandInputsStep } from "./steps/brand-inputs-step";
import { AssetsFigmaStep, UploadedAsset, FigmaData } from "./steps/assets-figma-step";
import { AiSetupStep } from "./steps/ai-setup-step";
import { ReviewStep } from "./steps/review-step";

const RETAINER_STEPS = 7;
const RETAINER_STEP_LABELS = [
  "Create Account",
  "Your Company",
  "Goals",
  "Brand",
  "Assets & Figma",
  "AI Setup",
  "Review",
];
const ONETIME_STEP_LABELS = ["Create Account", "Project Brief", "Review"];

export function OnboardingClient() {
  const router = useRouter();
  const { toast } = useToast();
  const { tier, billing, addOns, aiOpsLevel, pricingMode, selectedProjects } = usePricingStore();
  const submitOnboarding = useSubmitOnboarding();
  
  const [mounted, setMounted] = useState(false);
  
  const isOneTime = pricingMode === "oneTime";
  const TOTAL_STEPS = isOneTime ? 3 : RETAINER_STEPS;
  const STEP_LABELS = isOneTime ? ONETIME_STEP_LABELS : RETAINER_STEP_LABELS;

  const [step, setStep] = useState(1);

  // Figma and ObjectUploader State
  const [uploadedAssets, setUploadedAssets] = useState<UploadedAsset[]>([]);
  const [figmaUrl, setFigmaUrl] = useState("");
  const [figmaToken, setFigmaToken] = useState("");
  const [showFigmaToken, setShowFigmaToken] = useState(false);
  const [figmaLoading, setFigmaLoading] = useState(false);
  const [figmaError, setFigmaError] = useState<string | null>(null);
  const [figmaData, setFigmaData] = useState<FigmaData | null>(null);
  const [selectedFrames, setSelectedFrames] = useState<string[]>([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const form = useForm<OnboardingFormValues>({
    resolver: zodResolver(onboardingFormSchema),
    defaultValues: {
      account: { username: "Testies", password: "Testies1!", confirmPassword: "Testies1!" },
      company: { name: "Testies Inc.", website: "https://testies.dev", industry: "Technology", size: "11-50", revenueRange: "$1M-$10M" },
      contact: { name: "Testies User", email: "hello@testies.dev", phone: "" },
      goals: { improvements: ["Brand consistency", "Faster content output"], painPoints: "Design bandwidth is a bottleneck across every campaign.", firstPriorities: ["Brand guidelines", "Social media content"] },
      brand: { colors: ["#E8193C", "#0E1228"], fonts: ["Poppins", "Inter"], toneWords: "Bold, modern, trustworthy", competitors: "Pentagram, Superside" },
      aiSetup: { providers: [], modelName: "", usageNotes: "", consentBrandMemory: false, consentAiWorkflows: false },
    },
  });

  const fieldsByStep: Record<number, (keyof OnboardingFormValues | string)[]> = {
    1: ["account.username", "account.password", "account.confirmPassword"],
    2: ["company.name", "contact.email"],
    3: [],
    4: [],
    5: [],
    6: [],
    7: [],
  };

  const handleFigmaExtract = async () => {
    if (!figmaUrl.trim() || !figmaToken.trim()) return;
    setFigmaLoading(true);
    setFigmaError(null);
    setFigmaData(null);
    setSelectedFrames([]);
    try {
      const res = await fetch("/api/figma/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileUrl: figmaUrl, accessToken: figmaToken }),
      });
      const json = await res.json();
      if (!res.ok) {
        setFigmaError(json.error ?? "Failed to connect to Figma.");
      } else {
        setFigmaData(json as FigmaData);
      }
    } catch {
      setFigmaError("Network error. Check your connection and try again.");
    } finally {
      setFigmaLoading(false);
    }
  };

  const toggleFrame = (id: string) =>
    setSelectedFrames((prev) => prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]);

  const nextStep = async () => {
    const currentFields = fieldsByStep[step] as any;
    const isValid = await form.trigger(currentFields);
    if (isValid) {
      setStep((s) => Math.min(s + 1, TOTAL_STEPS));
      window.scrollTo(0, 0);
    }
  };

  const prevStep = () => {
    setStep((s) => Math.max(s - 1, 1));
    window.scrollTo(0, 0);
  };

  const projectsTotal = selectedProjects.reduce(
    (sum, id) => sum + (PROJECT_ADDONS.find((p) => p.id === id)?.price ?? 0), 0
  );

  const onSubmit = (values: OnboardingFormValues) => {
    if (isOneTime) {
      submitOnboarding.mutate(
        {
          data: {
            company: { name: values.company.name || "Unknown", website: "", industry: "", size: "", revenueRange: "" },
            contact: { email: values.contact.email, name: values.contact.name || "", phone: values.contact.phone || "" },
            plan: {
              tier: "signal" as any,
              billingCycle: "monthly" as any,
              addOns: [],
              aiOpsLevel: "none" as any,
              estimatedMonthlyTotal: projectsTotal,
              estimatedAnnualTotal: projectsTotal,
            },
            goals: {
              improvements: selectedProjects,
              painPoints: values.goals.painPoints ?? "",
              firstPriorities: [],
            },
            brand: {},
            aiSetup: { providers: [], consentBrandMemory: false, consentAiWorkflows: false },
          },
        },
        {
          onSuccess: () => {
            toast({ title: "Request received!", description: "We'll review your project and follow up within 24 hours." });
            router.push("/dashboard");
          },
          onError: () => {
            toast({ title: "Submission failed", description: "Please try again.", variant: "destructive" });
          },
        }
      );
      return;
    }

    const monthlyTotal = calcMonthlyTotal(tier, addOns, aiOpsLevel);
    const annualTotal = calcAnnualTotal(tier, monthlyTotal, billing);

    submitOnboarding.mutate(
      {
        data: {
          company: {
            name: values.company.name,
            website: values.company.website || "",
            industry: values.company.industry || "",
            size: values.company.size || "",
            revenueRange: values.company.revenueRange || ""
          },
          contact: { email: values.contact.email, name: values.contact.name || "", phone: values.contact.phone || "" },
          plan: {
            tier: tier as any,
            billingCycle: billing as any,
            addOns,
            aiOpsLevel: aiOpsLevel as any,
            estimatedMonthlyTotal: monthlyTotal,
            estimatedAnnualTotal: annualTotal,
          },
          goals: {
            improvements: values.goals.improvements,
            painPoints: values.goals.painPoints,
            firstPriorities: values.goals.firstPriorities,
            competitors: values.brand.competitors
              ? values.brand.competitors.split(",").map((s) => s.trim())
              : undefined,
          },
          brand: {
            colors: values.brand.colors,
            fonts: values.brand.fonts,
            toneWords: values.brand.toneWords
              ? values.brand.toneWords.split(",").map((s) => s.trim())
              : undefined,
          },
          aiSetup: {
            providers: values.aiSetup.providers,
            consentBrandMemory: values.aiSetup.consentBrandMemory,
            consentAiWorkflows: values.aiSetup.consentAiWorkflows,
          },
        },
      },
      {
        onSuccess: () => {
          toast({ title: "Welcome to Concepful", description: "Your creative department is ready." });
          router.push("/dashboard");
        },
        onError: () => {
          toast({ title: "Submission failed", description: "Please try again.", variant: "destructive" });
        },
      }
    );
  };

  if (!mounted) {
    return <div className="flex-1 bg-muted/30 min-h-screen" />;
  }

  return (
    <div className="flex-1 bg-muted/30 min-h-screen flex flex-col">
      {/* Progress bar */}
      <div className="sticky top-16 z-40 bg-background/90 backdrop-blur border-b px-6 py-3">
        <div className="container mx-auto max-w-3xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">
              Step {step} of {TOTAL_STEPS} — <span className="text-foreground">{STEP_LABELS[step - 1]}</span>
            </span>
            <span className="text-xs text-muted-foreground">{Math.round((step / TOTAL_STEPS) * 100)}%</span>
          </div>
          <Progress value={(step / TOTAL_STEPS) * 100} className="h-1.5" />
        </div>
      </div>

      <div className="container mx-auto px-6 py-12 max-w-3xl flex-1">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.28 }}
                className="bg-card border rounded-2xl p-8 shadow-sm flex flex-col items-center text-center space-y-4"
              >
                {step === 1 && <CreateAccountStep form={form} />}
                
                {step === 2 && isOneTime && (
                  <ProjectBriefStep form={form} selectedProjects={selectedProjects} />
                )}
                {step === 2 && !isOneTime && (
                  <CompanyBasicsStep form={form} />
                )}

                {step === 3 && isOneTime && (
                  <ReviewStep 
                    form={form} 
                    isOneTime={isOneTime}
                    tier={tier}
                    billing={billing}
                    addOns={addOns}
                    aiOpsLevel={aiOpsLevel}
                    selectedProjects={selectedProjects}
                  />
                )}
                {step === 3 && !isOneTime && (
                  <StrategicGoalsStep form={form} />
                )}

                {step === 4 && !isOneTime && <BrandInputsStep form={form} />}
                
                {step === 5 && !isOneTime && (
                  <AssetsFigmaStep 
                    uploadedAssets={uploadedAssets}
                    setUploadedAssets={setUploadedAssets}
                    figmaUrl={figmaUrl}
                    setFigmaUrl={setFigmaUrl}
                    figmaToken={figmaToken}
                    setFigmaToken={setFigmaToken}
                    showFigmaToken={showFigmaToken}
                    setShowFigmaToken={setShowFigmaToken}
                    figmaLoading={figmaLoading}
                    figmaError={figmaError}
                    figmaData={figmaData}
                    selectedFrames={selectedFrames}
                    toggleFrame={toggleFrame}
                    handleFigmaExtract={handleFigmaExtract}
                  />
                )}
                
                {step === 6 && !isOneTime && <AiSetupStep form={form} />}
                
                {step === 7 && !isOneTime && (
                  <ReviewStep 
                    form={form} 
                    isOneTime={isOneTime}
                    tier={tier}
                    billing={billing}
                    addOns={addOns}
                    aiOpsLevel={aiOpsLevel}
                    selectedProjects={selectedProjects}
                  />
                )}

                {step === TOTAL_STEPS && (
                  <div className="pt-4 flex flex-col items-center gap-4 text-center w-full">
                    <Button
                      type="submit"
                      size="lg"
                      className="w-full md:w-auto h-14 px-12 text-lg"
                      disabled={submitOnboarding.isPending}
                    >
                      {submitOnboarding.isPending && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                      {submitOnboarding.isPending ? "Submitting…" : isOneTime ? "Submit Project Request" : "Launch My Creative Department"}
                    </Button>
                    <p className="text-sm text-muted-foreground">
                      {isOneTime ? "We'll review your request and follow up within 24 hours." : "By submitting, you agree to our terms of service."}
                    </p>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {step < TOTAL_STEPS && (
              <div className="flex justify-between items-center pt-4">
                <Button type="button" variant="ghost" onClick={prevStep} disabled={step === 1}>
                  <ChevronLeft className="mr-2 h-4 w-4" /> Back
                </Button>
                <Button type="button" onClick={nextStep} className="px-8">
                  Continue <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            )}

            {step === TOTAL_STEPS && (
              <div className="flex justify-start pt-4">
                <Button type="button" variant="ghost" onClick={prevStep}>
                  <ChevronLeft className="mr-2 h-4 w-4" /> Back
                </Button>
              </div>
            )}
          </form>
        </Form>
      </div>
    </div>
  );
}
