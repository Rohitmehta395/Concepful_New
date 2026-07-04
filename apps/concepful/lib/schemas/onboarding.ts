import * as z from "zod";

export const onboardingFormSchema = z.object({
  account: z.object({
    username: z
      .string()
      .min(3, "Username must be at least 3 characters")
      .max(30, "Username must be 30 characters or less")
      .regex(/^[a-zA-Z0-9_-]+$/, "Only letters, numbers, underscores, and hyphens"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  }).refine((d: any) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  }),
  company: z.object({
    name: z.string().min(2, "Company name is required"),
    website: z.string().url("Enter a valid URL").or(z.literal("")).optional(),
    industry: z.string().optional(),
    size: z.string().optional(),
    revenueRange: z.string().optional(),
  }),
  contact: z.object({
    name: z.string().optional(),
    email: z.string().email("A valid company email is required"),
    phone: z.string().optional(),
  }),
  goals: z.object({
    improvements: z.array(z.string()).optional().default([]),
    painPoints: z.string().optional(),
    firstPriorities: z.array(z.string()).optional().default([]),
  }),
  brand: z.object({
    colors: z.array(z.string()).max(5).optional(),
    fonts: z.array(z.string()).max(3).optional(),
    toneWords: z.string().optional(),
    competitors: z.string().optional(),
  }),
  aiSetup: z.object({
    providers: z.array(z.string()).optional().default([]),
    modelName: z.string().optional(),
    usageNotes: z.string().optional(),
    consentBrandMemory: z.boolean().default(false),
    consentAiWorkflows: z.boolean().default(false),
  }),
});

export type OnboardingFormValues = z.infer<typeof onboardingFormSchema>;
