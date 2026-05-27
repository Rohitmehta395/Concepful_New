import { useState } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { SiteLayout } from "@/components/layout/site-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Progress } from "@/components/ui/progress";
import { AiOpsKey, TierKey, usePricingStore } from "@/hooks/use-pricing-store";
import { calcMonthlyTotal, calcAnnualTotal, TIERS, MONTHLY_ADDONS, AI_OPS } from "@/lib/pricing";
import { useSubmitOnboarding } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  company: z.object({
    name: z.string().min(2),
    website: z.string().url(),
    industry: z.string().min(2),
    size: z.string(),
    revenueRange: z.string(),
  }),
  contact: z.object({
    name: z.string().min(2),
    email: z.string().email(),
    phone: z.string().optional(),
  }),
  goals: z.object({
    improvements: z.array(z.string()),
    painPoints: z.string(),
    firstPriorities: z.array(z.string()),
  }),
  brand: z.object({
    colors: z.array(z.string()).max(5).optional(),
    fonts: z.array(z.string()).max(3).optional(),
    toneWords: z.string().optional(),
    competitors: z.string().optional(),
  }),
  aiSetup: z.object({
    providers: z.array(z.string()),
    modelName: z.string().optional(),
    usageNotes: z.string().optional(),
    consentBrandMemory: z.boolean().default(false),
    consentAiWorkflows: z.boolean().default(false),
  }),
});

export default function Onboarding() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { tier, billing, addOns, aiOpsLevel } = usePricingStore();
  const submitOnboarding = useSubmitOnboarding();
  const [step, setStep] = useState(1);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      company: { name: "", website: "", industry: "", size: "", revenueRange: "" },
      contact: { name: "", email: "", phone: "" },
      goals: { improvements: [], painPoints: "", firstPriorities: [] },
      brand: { colors: [], fonts: [], toneWords: "", competitors: "" },
      aiSetup: { providers: [], modelName: "", usageNotes: "", consentBrandMemory: false, consentAiWorkflows: false },
    },
  });

  const nextStep = async () => {
    const fieldsByStep = [
      [],
      ["company.name", "company.website", "company.industry", "company.size", "company.revenueRange", "contact.name", "contact.email"],
      ["goals.improvements", "goals.painPoints", "goals.firstPriorities"],
      ["brand.colors", "brand.fonts", "brand.toneWords", "brand.competitors"],
      ["aiSetup.providers", "aiSetup.modelName", "aiSetup.usageNotes", "aiSetup.consentBrandMemory", "aiSetup.consentAiWorkflows"],
    ];

    const currentFields = fieldsByStep[step] as any;
    const isValid = await form.trigger(currentFields);
    
    if (isValid) {
      setStep(s => Math.min(s + 1, 5));
      window.scrollTo(0, 0);
    }
  };

  const prevStep = () => {
    setStep(s => Math.max(s - 1, 1));
    window.scrollTo(0, 0);
  };

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const monthlyTotal = calcMonthlyTotal(tier, addOns, aiOpsLevel);
    const annualTotal = calcAnnualTotal(tier, monthlyTotal, billing);

    submitOnboarding.mutate({
      data: {
        company: values.company,
        contact: values.contact,
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
          competitors: values.brand.competitors ? values.brand.competitors.split(',').map(s => s.trim()) : undefined,
        },
        brand: {
          colors: values.brand.colors,
          fonts: values.brand.fonts,
          toneWords: values.brand.toneWords ? values.brand.toneWords.split(',').map(s => s.trim()) : undefined,
        },
        aiSetup: {
          providers: values.aiSetup.providers,
          consentBrandMemory: values.aiSetup.consentBrandMemory,
          consentAiWorkflows: values.aiSetup.consentAiWorkflows,
        }
      }
    }, {
      onSuccess: () => {
        toast({ title: "Welcome to Concepful", description: "Your partnership has begun." });
        setLocation('/dashboard');
      },
      onError: () => {
        toast({ title: "Submission failed", description: "Please try again.", variant: "destructive" });
      }
    });
  };

  const improvementsOptions = ["Brand consistency", "Campaign performance", "Design velocity", "Strategic direction", "AI integration", "Content volume"];
  const prioritiesOptions = ["Social assets", "Campaign systems", "Brand identity", "Presentations", "Motion graphics", "Strategy"];
  const aiProvidersOptions = ["ChatGPT", "Claude", "Gemini", "Local Models", "Other"];

  return (
    <SiteLayout>
      <div className="flex-1 bg-muted/30">
        <div className="sticky top-16 z-40 bg-background/80 backdrop-blur border-b p-4">
          <div className="container mx-auto max-w-3xl flex items-center justify-between gap-4">
            <div className="text-sm font-medium text-muted-foreground w-20">Step {step} of 5</div>
            <Progress value={(step / 5) * 100} className="h-2" />
          </div>
        </div>

        <div className="container mx-auto px-6 py-12 max-w-3xl">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="bg-card border rounded-2xl p-8 shadow-sm"
                >
                  {step === 1 && (
                    <div className="space-y-6">
                      <div>
                        <h2 className="text-2xl font-serif font-bold mb-2">Company Basics</h2>
                        <p className="text-muted-foreground">Tell us about your organization and how to reach you.</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField control={form.control} name="company.name" render={({ field }) => (
                          <FormItem><FormLabel>Company Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="company.website" render={({ field }) => (
                          <FormItem><FormLabel>Website</FormLabel><FormControl><Input placeholder="https://" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="company.industry" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Industry</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl><SelectTrigger><SelectValue placeholder="Select industry" /></SelectTrigger></FormControl>
                              <SelectContent>
                                <SelectItem value="technology">Technology / SaaS</SelectItem>
                                <SelectItem value="ecommerce">E-commerce / Retail</SelectItem>
                                <SelectItem value="finance">Financial Services</SelectItem>
                                <SelectItem value="healthcare">Healthcare</SelectItem>
                                <SelectItem value="media">Media / Entertainment</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <FormField control={form.control} name="company.size" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Company Size</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl><SelectTrigger><SelectValue placeholder="Select size" /></SelectTrigger></FormControl>
                              <SelectContent>
                                <SelectItem value="1-10">1-10 employees</SelectItem>
                                <SelectItem value="11-50">11-50 employees</SelectItem>
                                <SelectItem value="51-200">51-200 employees</SelectItem>
                                <SelectItem value="200+">200+ employees</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )} />
                      </div>

                      <div className="pt-6 border-t grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField control={form.control} name="contact.name" render={({ field }) => (
                          <FormItem><FormLabel>Primary Contact Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="contact.email" render={({ field }) => (
                          <FormItem><FormLabel>Email Address</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="contact.phone" render={({ field }) => (
                          <FormItem><FormLabel>Phone Number (Optional)</FormLabel><FormControl><Input type="tel" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                      </div>
                    </div>
                  )}

                  {step === 2 && (
                    <div className="space-y-8">
                      <div>
                        <h2 className="text-2xl font-serif font-bold mb-2">Strategic Goals</h2>
                        <p className="text-muted-foreground">What brings you to Concepful?</p>
                      </div>

                      <FormField control={form.control} name="goals.improvements" render={() => (
                        <FormItem>
                          <div className="mb-4"><FormLabel className="text-base">What are you trying to improve?</FormLabel></div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {improvementsOptions.map((item) => (
                              <FormField key={item} control={form.control} name="goals.improvements" render={({ field }) => {
                                return (
                                  <FormItem key={item} className="flex flex-row items-start space-x-3 space-y-0 p-4 border rounded-lg hover:bg-secondary/50 cursor-pointer">
                                    <FormControl>
                                      <Checkbox checked={field.value?.includes(item)} onCheckedChange={(checked) => {
                                        return checked ? field.onChange([...field.value, item]) : field.onChange(field.value?.filter((value) => value !== item))
                                      }} />
                                    </FormControl>
                                    <FormLabel className="font-normal cursor-pointer w-full">{item}</FormLabel>
                                  </FormItem>
                                )
                              }} />
                            ))}
                          </div>
                        </FormItem>
                      )} />

                      <FormField control={form.control} name="goals.painPoints" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base">What feels unclear right now?</FormLabel>
                          <FormControl><Textarea className="min-h-[100px]" placeholder="Briefly describe your current creative challenges..." {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />

                      <FormField control={form.control} name="goals.firstPriorities" render={() => (
                        <FormItem>
                          <div className="mb-4"><FormLabel className="text-base">What kind of work do you need first?</FormLabel></div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {prioritiesOptions.map((item) => (
                              <FormField key={item} control={form.control} name="goals.firstPriorities" render={({ field }) => {
                                return (
                                  <FormItem key={item} className="flex flex-row items-start space-x-3 space-y-0 p-4 border rounded-lg hover:bg-secondary/50 cursor-pointer">
                                    <FormControl>
                                      <Checkbox checked={field.value?.includes(item)} onCheckedChange={(checked) => {
                                        return checked ? field.onChange([...field.value, item]) : field.onChange(field.value?.filter((value) => value !== item))
                                      }} />
                                    </FormControl>
                                    <FormLabel className="font-normal cursor-pointer w-full">{item}</FormLabel>
                                  </FormItem>
                                )
                              }} />
                            ))}
                          </div>
                        </FormItem>
                      )} />
                    </div>
                  )}

                  {step === 3 && (
                    <div className="space-y-6">
                      <div>
                        <h2 className="text-2xl font-serif font-bold mb-2">Brand Inputs</h2>
                        <p className="text-muted-foreground">Help us align with your visual identity.</p>
                      </div>

                      <div className="bg-primary/5 p-4 rounded-lg text-sm text-primary mb-6">
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
                  )}

                  {step === 4 && (
                    <div className="space-y-8">
                      <div>
                        <h2 className="text-2xl font-serif font-bold mb-2">AI Collaboration Setup</h2>
                        <p className="text-muted-foreground">Configure how we integrate AI into your workflow.</p>
                      </div>

                      <FormField control={form.control} name="aiSetup.providers" render={() => (
                        <FormItem>
                          <div className="mb-4"><FormLabel className="text-base">Which AI providers does your team currently use?</FormLabel></div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {aiProvidersOptions.map((item) => (
                              <FormField key={item} control={form.control} name="aiSetup.providers" render={({ field }) => {
                                return (
                                  <FormItem key={item} className="flex flex-row items-start space-x-3 space-y-0 p-4 border rounded-lg hover:bg-secondary/50 cursor-pointer">
                                    <FormControl>
                                      <Checkbox checked={field.value?.includes(item)} onCheckedChange={(checked) => {
                                        return checked ? field.onChange([...field.value, item]) : field.onChange(field.value?.filter((value) => value !== item))
                                      }} />
                                    </FormControl>
                                    <FormLabel className="font-normal cursor-pointer w-full">{item}</FormLabel>
                                  </FormItem>
                                )
                              }} />
                            ))}
                          </div>
                        </FormItem>
                      )} />

                      <FormField control={form.control} name="aiSetup.usageNotes" render={({ field }) => (
                        <FormItem>
                          <FormLabel>How are you using AI today?</FormLabel>
                          <FormControl><Textarea className="min-h-[100px]" placeholder="e.g., Drafting copy, analyzing competitors..." {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />

                      <div className="space-y-6 pt-6 border-t">
                        <FormField control={form.control} name="aiSetup.consentBrandMemory" render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Brand Memory Integration</FormLabel>
                              <FormDescription>Allow Concepful to use uploaded materials to train your dedicated brand memory vector index.</FormDescription>
                            </div>
                            <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                          </FormItem>
                        )} />

                        <FormField control={form.control} name="aiSetup.consentAiWorkflows" render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-4 border rounded-lg bg-secondary/30">
                            <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} className="mt-1" /></FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>I consent to AI-assisted workflows</FormLabel>
                              <FormDescription>
                                I understand that Concepful utilizes a hybrid approach combining senior creative judgment with AI generation.
                              </FormDescription>
                            </div>
                          </FormItem>
                        )} />
                      </div>

                      <div className="bg-muted p-4 rounded-lg text-xs text-muted-foreground">
                        <strong>Future-Ready:</strong> Secure vault integration for API keys and proprietary model connection will be configured after onboarding via our secure infrastructure.
                      </div>
                    </div>
                  )}

                  {step === 5 && (
                    <div className="space-y-8">
                      <div>
                        <h2 className="text-2xl font-serif font-bold mb-2">Final Review</h2>
                        <p className="text-muted-foreground">Review your partnership configuration before submitting.</p>
                      </div>

                      <div className="bg-secondary/30 border rounded-xl p-6 space-y-6">
                        <div className="flex justify-between items-center pb-4 border-b border-border/50">
                          <div>
                            <p className="text-sm text-muted-foreground mb-1">Selected Plan</p>
                            <p className="font-serif font-bold text-xl">{TIERS[tier as TierKey].name} ({billing})</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-muted-foreground mb-1">Estimated {billing === 'monthly' ? 'Monthly' : 'Monthly Avg'}</p>
                            <p className="font-bold text-2xl">${billing === 'annual' ? (calcAnnualTotal(tier as TierKey, calcMonthlyTotal(tier as TierKey, addOns, aiOpsLevel as any), billing) / 12).toFixed(0) : calcMonthlyTotal(tier as TierKey, addOns, aiOpsLevel as any).toFixed(0)}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div>
                            <p className="text-sm font-semibold mb-3">Add-ons & AI</p>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                              {addOns.length === 0 && aiOpsLevel === 'none' && <li>None selected</li>}
                              {addOns.map(id => {
                                const a = MONTHLY_ADDONS.find(x => x.id === id);
                                return a ? <li key={id}>+ {a.label}</li> : null;
                              })}
                              {aiOpsLevel !== 'none' && <li>+ {AI_OPS[aiOpsLevel as AiOpsKey].label}</li>}
                            </ul>
                          </div>
                          <div>
                            <p className="text-sm font-semibold mb-3">Contact Details</p>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                              <li>{form.getValues().company.name}</li>
                              <li>{form.getValues().contact.name} ({form.getValues().contact.email})</li>
                            </ul>
                          </div>
                        </div>
                      </div>

                      <div className="pt-4 flex flex-col items-center gap-4 text-center">
                        <Button type="submit" size="lg" className="w-full md:w-auto h-14 px-12 text-lg" disabled={submitOnboarding.isPending}>
                          {submitOnboarding.isPending ? "Submitting..." : "Begin Creative Partnership"}
                        </Button>
                        <p className="text-sm text-muted-foreground">By submitting, you agree to our terms of service.</p>
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>

              {step < 5 && (
                <div className="flex justify-between items-center pt-6">
                  <Button type="button" variant="ghost" onClick={prevStep} disabled={step === 1}>
                    <ChevronLeft className="mr-2 h-4 w-4" /> Back
                  </Button>
                  <Button type="button" onClick={nextStep} className="px-8">
                    Continue <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              )}
            </form>
          </Form>
        </div>
      </div>
    </SiteLayout>
  );
}