import { useState } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronLeft, ChevronRight, Eye, EyeOff, User, Upload, Figma, Link, Loader2, X, ImageIcon, FileText, Archive } from "lucide-react";
import { ObjectUploader } from "@workspace/object-storage-web";
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
import { Badge } from "@/components/ui/badge";
import { AiOpsKey, TierKey, usePricingStore } from "@/hooks/use-pricing-store";
import { calcMonthlyTotal, calcAnnualTotal, TIERS, MONTHLY_ADDONS, AI_OPS } from "@/lib/pricing";
import { useSubmitOnboarding } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const TOTAL_STEPS = 7;

const formSchema = z.object({
  account: z.object({
    username: z
      .string()
      .min(3, "Username must be at least 3 characters")
      .max(30, "Username must be 30 characters or less")
      .regex(/^[a-zA-Z0-9_-]+$/, "Only letters, numbers, underscores, and hyphens"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  }).refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  }),
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

type FormValues = z.infer<typeof formSchema>;

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: "8+ characters", ok: password.length >= 8 },
    { label: "Uppercase letter", ok: /[A-Z]/.test(password) },
    { label: "Number", ok: /\d/.test(password) },
    { label: "Special character", ok: /[^a-zA-Z0-9]/.test(password) },
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

const STEP_LABELS = [
  "Create Account",
  "Your Company",
  "Goals",
  "Brand",
  "Assets & Figma",
  "AI Setup",
  "Review",
];

export default function Onboarding() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { tier, billing, addOns, aiOpsLevel } = usePricingStore();
  const submitOnboarding = useSubmitOnboarding();
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  type UploadedAsset = { name: string; objectPath: string; contentType: string };
  type FigmaFrame = { id: string; name: string; pageId: string; pageName: string; thumbnailUrl: string | null };
  type FigmaData = { fileName: string; pages: { id: string; name: string }[]; frames: FigmaFrame[] };

  const [uploadedAssets, setUploadedAssets] = useState<UploadedAsset[]>([]);
  const [figmaUrl, setFigmaUrl] = useState("");
  const [figmaToken, setFigmaToken] = useState("");
  const [showFigmaToken, setShowFigmaToken] = useState(false);
  const [figmaLoading, setFigmaLoading] = useState(false);
  const [figmaError, setFigmaError] = useState<string | null>(null);
  const [figmaData, setFigmaData] = useState<FigmaData | null>(null);
  const [selectedFrames, setSelectedFrames] = useState<string[]>([]);

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

  const fileIcon = (name: string) => {
    const ext = name.split(".").pop()?.toLowerCase() ?? "";
    if (["jpg","jpeg","png","gif","webp","svg"].includes(ext)) return <ImageIcon className="h-4 w-4" />;
    if (["pdf"].includes(ext)) return <FileText className="h-4 w-4" />;
    return <Archive className="h-4 w-4" />;
  };

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      account: { username: "", password: "", confirmPassword: "" },
      company: { name: "", website: "", industry: "", size: "", revenueRange: "" },
      contact: { name: "", email: "", phone: "" },
      goals: { improvements: [], painPoints: "", firstPriorities: [] },
      brand: { colors: [], fonts: [], toneWords: "", competitors: "" },
      aiSetup: { providers: [], modelName: "", usageNotes: "", consentBrandMemory: false, consentAiWorkflows: false },
    },
  });

  const fieldsByStep: Record<number, (keyof FormValues | string)[]> = {
    1: ["account.username", "account.password", "account.confirmPassword"],
    2: ["company.name", "company.website", "company.industry", "company.size", "company.revenueRange", "contact.name", "contact.email"],
    3: ["goals.improvements", "goals.painPoints", "goals.firstPriorities"],
    4: ["brand.colors", "brand.fonts", "brand.toneWords", "brand.competitors"],
    5: [],
    6: ["aiSetup.providers", "aiSetup.modelName", "aiSetup.usageNotes", "aiSetup.consentBrandMemory", "aiSetup.consentAiWorkflows"],
    7: [],
  };

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

  const onSubmit = (values: FormValues) => {
    const monthlyTotal = calcMonthlyTotal(tier, addOns, aiOpsLevel);
    const annualTotal = calcAnnualTotal(tier, monthlyTotal, billing);

    submitOnboarding.mutate(
      {
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
          setLocation("/dashboard");
        },
        onError: () => {
          toast({ title: "Submission failed", description: "Please try again.", variant: "destructive" });
        },
      },
    );
  };

  const improvementsOptions = ["Brand consistency", "Campaign performance", "Design velocity", "Strategic direction", "AI integration", "Content volume"];
  const prioritiesOptions = ["Social assets", "Campaign systems", "Brand identity", "Presentations", "Motion graphics", "Strategy"];
  const aiProvidersOptions = ["ChatGPT", "Claude", "Gemini", "Local Models", "Other"];

  const password = form.watch("account.password");

  return (
    <SiteLayout>
      <div className="flex-1 bg-muted/30">
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

        <div className="container mx-auto px-6 py-12 max-w-3xl">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.28 }}
                  className="bg-card border rounded-2xl p-8 shadow-sm"
                >

                  {/* ── STEP 1: Create Account ── */}
                  {step === 1 && (
                    <div className="space-y-6">
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
                  )}

                  {/* ── STEP 2: Company Basics ── */}
                  {step === 2 && (
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
                                <SelectItem value="1-10">1–10 employees</SelectItem>
                                <SelectItem value="11-50">11–50 employees</SelectItem>
                                <SelectItem value="51-200">51–200 employees</SelectItem>
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

                  {/* ── STEP 3: Goals ── */}
                  {step === 3 && (
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
                              <FormField key={item} control={form.control} name="goals.improvements" render={({ field }) => (
                                <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-4 border rounded-lg hover:bg-secondary/50 cursor-pointer">
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(item)}
                                      onCheckedChange={(checked) =>
                                        checked
                                          ? field.onChange([...field.value, item])
                                          : field.onChange(field.value?.filter((v) => v !== item))
                                      }
                                    />
                                  </FormControl>
                                  <FormLabel className="font-normal cursor-pointer w-full">{item}</FormLabel>
                                </FormItem>
                              )} />
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
                              <FormField key={item} control={form.control} name="goals.firstPriorities" render={({ field }) => (
                                <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-4 border rounded-lg hover:bg-secondary/50 cursor-pointer">
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(item)}
                                      onCheckedChange={(checked) =>
                                        checked
                                          ? field.onChange([...field.value, item])
                                          : field.onChange(field.value?.filter((v) => v !== item))
                                      }
                                    />
                                  </FormControl>
                                  <FormLabel className="font-normal cursor-pointer w-full">{item}</FormLabel>
                                </FormItem>
                              )} />
                            ))}
                          </div>
                        </FormItem>
                      )} />
                    </div>
                  )}

                  {/* ── STEP 4: Brand ── */}
                  {step === 4 && (
                    <div className="space-y-6">
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
                  )}

                  {/* ── STEP 5: Assets & Figma ── */}
                  {step === 5 && (
                    <div className="space-y-8">
                      <div>
                        <h2 className="text-2xl font-serif font-bold mb-2">Assets & References</h2>
                        <p className="text-muted-foreground">Upload brand files and connect your Figma workspace. This step is optional — you can always add assets from your dashboard later.</p>
                      </div>

                      {/* File upload */}
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <Upload className="h-4 w-4 text-primary" />
                          <h3 className="font-semibold text-sm">Upload Brand Files</h3>
                        </div>
                        <p className="text-xs text-muted-foreground">Brand guides, logos, decks, existing creative (PDF, PNG, JPG, SVG, ZIP — up to 50 MB each)</p>

                        <ObjectUploader
                          maxNumberOfFiles={20}
                          maxFileSize={52428800}
                          onGetUploadParameters={async (file) => {
                            const res = await fetch("/api/storage/uploads/request-url", {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ name: file.name, size: file.size, contentType: file.type }),
                            });
                            const { uploadURL } = await res.json();
                            return { method: "PUT" as const, url: uploadURL, headers: { "Content-Type": file.type } };
                          }}
                          onComplete={(result) => {
                            const newAssets = (result.successful ?? []).map((f) => ({
                              name: f.name,
                              objectPath: `/objects/uploads/${f.name}`,
                              contentType: f.type ?? "application/octet-stream",
                            }));
                            setUploadedAssets((prev) => [...prev, ...newAssets]);
                          }}
                          buttonClassName="flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-dashed border-border hover:border-primary/50 hover:bg-primary/5 transition-all text-sm font-medium text-muted-foreground hover:text-foreground w-full justify-center"
                        >
                          <Upload className="h-4 w-4" /> Choose files or drag & drop
                        </ObjectUploader>

                        {uploadedAssets.length > 0 && (
                          <div className="space-y-2">
                            {uploadedAssets.map((a, i) => (
                              <div key={i} className="flex items-center gap-3 px-3 py-2 bg-secondary/30 rounded-lg border border-border/40">
                                <span className="text-muted-foreground">{fileIcon(a.name)}</span>
                                <span className="text-sm flex-1 truncate">{a.name}</span>
                                <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                                <button
                                  type="button"
                                  onClick={() => setUploadedAssets((prev) => prev.filter((_, j) => j !== i))}
                                  className="text-muted-foreground hover:text-destructive transition-colors"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Figma integration */}
                      <div className="pt-6 border-t space-y-4">
                        <div className="flex items-center gap-2">
                          <Figma className="h-4 w-4 text-primary" />
                          <h3 className="font-semibold text-sm">Connect a Figma File</h3>
                        </div>
                        <p className="text-xs text-muted-foreground">Paste a Figma file URL and your personal access token to extract frames and components directly into your workspace.</p>

                        <div className="space-y-3">
                          <div className="relative">
                            <Link className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <input
                              type="url"
                              value={figmaUrl}
                              onChange={(e) => setFigmaUrl(e.target.value)}
                              placeholder="https://www.figma.com/file/..."
                              className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                            />
                          </div>

                          <div className="relative">
                            <input
                              type={showFigmaToken ? "text" : "password"}
                              value={figmaToken}
                              onChange={(e) => setFigmaToken(e.target.value)}
                              placeholder="Figma personal access token"
                              className="w-full pr-10 pl-4 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary font-mono"
                            />
                            <button
                              type="button"
                              onClick={() => setShowFigmaToken((v) => !v)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            >
                              {showFigmaToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>

                          <p className="text-[11px] text-muted-foreground">
                            Get your token at <span className="font-mono text-foreground">figma.com → Settings → Personal access tokens</span>. It is used only for this extraction and is never stored.
                          </p>

                          <button
                            type="button"
                            onClick={handleFigmaExtract}
                            disabled={!figmaUrl.trim() || !figmaToken.trim() || figmaLoading}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors"
                          >
                            {figmaLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Figma className="h-4 w-4" />}
                            {figmaLoading ? "Extracting…" : "Extract Frames"}
                          </button>
                        </div>

                        {figmaError && (
                          <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                            {figmaError}
                          </div>
                        )}

                        {figmaData && (
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-semibold text-sm">{figmaData.fileName}</p>
                                <p className="text-xs text-muted-foreground">{figmaData.pages.length} pages · {figmaData.frames.length} frames found</p>
                              </div>
                              {selectedFrames.length > 0 && (
                                <span className="text-xs font-medium text-primary bg-primary/10 px-2.5 py-1 rounded-full">
                                  {selectedFrames.length} selected
                                </span>
                              )}
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-72 overflow-y-auto pr-1">
                              {figmaData.frames.map((frame) => {
                                const selected = selectedFrames.includes(frame.id);
                                return (
                                  <button
                                    key={frame.id}
                                    type="button"
                                    onClick={() => toggleFrame(frame.id)}
                                    className={cn(
                                      "relative rounded-xl border-2 overflow-hidden text-left transition-all",
                                      selected ? "border-primary shadow-md shadow-primary/20" : "border-border hover:border-border/80"
                                    )}
                                  >
                                    {frame.thumbnailUrl ? (
                                      <img src={frame.thumbnailUrl} alt={frame.name} className="w-full aspect-video object-cover bg-secondary/30" />
                                    ) : (
                                      <div className="w-full aspect-video bg-secondary/30 flex items-center justify-center">
                                        <Figma className="h-6 w-6 text-muted-foreground/40" />
                                      </div>
                                    )}
                                    <div className="px-2 py-1.5">
                                      <p className="text-[11px] font-medium truncate">{frame.name}</p>
                                      <p className="text-[10px] text-muted-foreground truncate">{frame.pageName}</p>
                                    </div>
                                    {selected && (
                                      <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                                        <Check className="h-3 w-3 text-primary-foreground" />
                                      </div>
                                    )}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* ── STEP 6: AI Setup ── */}
                  {step === 6 && (
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
                              <FormField key={item} control={form.control} name="aiSetup.providers" render={({ field }) => (
                                <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-4 border rounded-lg hover:bg-secondary/50 cursor-pointer">
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(item)}
                                      onCheckedChange={(checked) =>
                                        checked
                                          ? field.onChange([...field.value, item])
                                          : field.onChange(field.value?.filter((v) => v !== item))
                                      }
                                    />
                                  </FormControl>
                                  <FormLabel className="font-normal cursor-pointer w-full">{item}</FormLabel>
                                </FormItem>
                              )} />
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

                  {/* ── STEP 7: Review ── */}
                  {step === 7 && (
                    <div className="space-y-8">
                      <div>
                        <h2 className="text-2xl font-serif font-bold mb-2">Final Review</h2>
                        <p className="text-muted-foreground">Review your partnership configuration before submitting.</p>
                      </div>

                      <div className="bg-secondary/30 border rounded-xl p-6 space-y-6">
                        {/* Account */}
                        <div className="flex justify-between items-center pb-4 border-b border-border/50">
                          <div>
                            <p className="text-sm text-muted-foreground mb-1">Login credentials</p>
                            <p className="font-mono font-semibold">@{form.getValues().account.username}</p>
                          </div>
                          <Check className="h-5 w-5 text-emerald-500" />
                        </div>

                        <div className="flex justify-between items-center pb-4 border-b border-border/50">
                          <div>
                            <p className="text-sm text-muted-foreground mb-1">Selected Plan</p>
                            <p className="font-serif font-bold text-xl">{TIERS[tier as TierKey].name} ({billing})</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-muted-foreground mb-1">Estimated {billing === "monthly" ? "Monthly" : "Monthly Avg"}</p>
                            <p className="font-bold text-2xl">
                              ${billing === "annual"
                                ? (calcAnnualTotal(tier as TierKey, calcMonthlyTotal(tier as TierKey, addOns, aiOpsLevel as any), billing) / 12).toFixed(0)
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
                      </div>

                      <div className="pt-4 flex flex-col items-center gap-4 text-center">
                        <Button
                          type="submit"
                          size="lg"
                          className="w-full md:w-auto h-14 px-12 text-lg"
                          disabled={submitOnboarding.isPending}
                        >
                          {submitOnboarding.isPending ? "Submitting…" : "Launch My Creative Department"}
                        </Button>
                        <p className="text-sm text-muted-foreground">By submitting, you agree to our terms of service.</p>
                      </div>
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
    </SiteLayout>
  );
}
