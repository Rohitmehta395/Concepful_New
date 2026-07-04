import { pgTable, serial, text, integer, boolean, real, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const companiesTable = pgTable("companies", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  website: text("website"),
  industry: text("industry"),
  size: text("size"),
  revenueRange: text("revenue_range"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertCompanySchema = createInsertSchema(companiesTable).omit({ id: true, createdAt: true });
export type InsertCompany = z.infer<typeof insertCompanySchema>;
export type Company = typeof companiesTable.$inferSelect;

export const onboardingSubmissionsTable = pgTable("onboarding_submissions", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").references(() => companiesTable.id).notNull(),
  companyName: text("company_name").notNull(),
  contactName: text("contact_name"),
  contactEmail: text("contact_email"),
  contactPhone: text("contact_phone"),
  tier: text("tier").notNull(),
  billingCycle: text("billing_cycle").notNull(),
  addOns: jsonb("add_ons").$type<string[]>().default([]),
  aiOpsLevel: text("ai_ops_level").default("none"),
  estimatedMonthlyTotal: real("estimated_monthly_total"),
  estimatedAnnualTotal: real("estimated_annual_total"),
  goals: jsonb("goals"),
  brandInputs: jsonb("brand_inputs"),
  aiSetup: jsonb("ai_setup"),
  status: text("status").default("pending").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertOnboardingSchema = createInsertSchema(onboardingSubmissionsTable).omit({ id: true, createdAt: true });
export type InsertOnboarding = z.infer<typeof insertOnboardingSchema>;
export type OnboardingSubmission = typeof onboardingSubmissionsTable.$inferSelect;

export const planSelectionsTable = pgTable("plan_selections", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").references(() => companiesTable.id).notNull(),
  tier: text("tier").notNull(),
  billingCycle: text("billing_cycle").notNull(),
  basePrice: real("base_price").notNull(),
  discount: real("discount").default(0),
  addOns: jsonb("add_ons").$type<string[]>().default([]),
  aiOpsLevel: text("ai_ops_level").default("none"),
  estimatedMonthlyTotal: real("estimated_monthly_total"),
  estimatedAnnualTotal: real("estimated_annual_total"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertPlanSelectionSchema = createInsertSchema(planSelectionsTable).omit({ id: true, createdAt: true });
export type InsertPlanSelection = z.infer<typeof insertPlanSelectionSchema>;
export type PlanSelection = typeof planSelectionsTable.$inferSelect;

export const workRequestsTable = pgTable("work_requests", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").references(() => companiesTable.id).notNull(),
  title: text("title").notNull(),
  type: text("type").notNull(),
  goal: text("goal"),
  priority: text("priority").default("medium").notNull(),
  status: text("status").default("pending").notNull(),
  deadline: text("deadline"),
  description: text("description"),
  referenceLinks: jsonb("reference_links").$type<string[]>().default([]),
  notes: text("notes"),
  assignedTo: text("assigned_to"),
  nextAction: text("next_action"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
});

export const insertWorkRequestSchema = createInsertSchema(workRequestsTable).omit({ id: true, createdAt: true, completedAt: true });
export type InsertWorkRequest = z.infer<typeof insertWorkRequestSchema>;
export type WorkRequest = typeof workRequestsTable.$inferSelect;

export const completedWorkTable = pgTable("completed_work", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").references(() => companiesTable.id).notNull(),
  title: text("title").notNull(),
  category: text("category").notNull(),
  notes: text("notes"),
  approved: boolean("approved").default(false),
  completedAt: timestamp("completed_at").defaultNow().notNull(),
});

export const insertCompletedWorkSchema = createInsertSchema(completedWorkTable).omit({ id: true });
export type InsertCompletedWork = z.infer<typeof insertCompletedWorkSchema>;
export type CompletedWork = typeof completedWorkTable.$inferSelect;

export const brandProfilesTable = pgTable("brand_profiles", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").references(() => companiesTable.id).notNull().unique(),
  colors: jsonb("colors").$type<string[]>().default([]),
  fonts: jsonb("fonts").$type<string[]>().default([]),
  toneWords: jsonb("tone_words").$type<string[]>().default([]),
  visualReferences: jsonb("visual_references").$type<string[]>().default([]),
  approvedAssets: jsonb("approved_assets").$type<string[]>().default([]),
  bannedWords: jsonb("banned_words").$type<string[]>().default([]),
  requiredDisclaimers: jsonb("required_disclaimers").$type<string[]>().default([]),
  audienceNotes: text("audience_notes"),
  competitorNotes: text("competitor_notes"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertBrandProfileSchema = createInsertSchema(brandProfilesTable).omit({ id: true, updatedAt: true });
export type InsertBrandProfile = z.infer<typeof insertBrandProfileSchema>;
export type BrandProfile = typeof brandProfilesTable.$inferSelect;

export const aiModelProfilesTable = pgTable("ai_model_profiles", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").references(() => companiesTable.id).notNull().unique(),
  providers: jsonb("providers").$type<string[]>().default([]),
  modelName: text("model_name"),
  useCases: jsonb("use_cases").$type<string[]>().default([]),
  usageNotes: text("usage_notes"),
  consentAiWorkflows: boolean("consent_ai_workflows").default(false),
  consentBrandMemory: boolean("consent_brand_memory").default(false),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertAiModelProfileSchema = createInsertSchema(aiModelProfilesTable).omit({ id: true, updatedAt: true });
export type InsertAiModelProfile = z.infer<typeof insertAiModelProfileSchema>;
export type AiModelProfile = typeof aiModelProfilesTable.$inferSelect;

export const brandChecksTable = pgTable("brand_checks", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").references(() => companiesTable.id).notNull(),
  inputText: text("input_text").notNull(),
  inputType: text("input_type").default("text"),
  alignmentScore: real("alignment_score").notNull(),
  toneScore: real("tone_score").notNull(),
  colorScore: real("color_score").notNull(),
  messagingScore: real("messaging_score").notNull(),
  typographyScore: real("typography_score").notNull(),
  recommendations: jsonb("recommendations").$type<string[]>().default([]),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertBrandCheckSchema = createInsertSchema(brandChecksTable).omit({ id: true, createdAt: true });
export type InsertBrandCheck = z.infer<typeof insertBrandCheckSchema>;
export type BrandCheck = typeof brandChecksTable.$inferSelect;

export const portfolioItemsTable = pgTable("portfolio_items", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  clientName: text("client_name"),
  type: text("type").notNull(),
  description: text("description"),
  coverImageUrl: text("cover_image_url"),
  featured: boolean("featured").default(false),
  sortOrder: integer("sort_order").default(0),
  status: text("status").default("draft").notNull(),
  tags: jsonb("tags").$type<string[]>().default([]),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertPortfolioItemSchema = createInsertSchema(portfolioItemsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertPortfolioItem = z.infer<typeof insertPortfolioItemSchema>;
export type PortfolioItem = typeof portfolioItemsTable.$inferSelect;

export const blogPostsTable = pgTable("blog_posts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  content: text("content").notNull().default(""),
  excerpt: text("excerpt"),
  category: text("category").default("insights").notNull(),
  status: text("status").default("draft").notNull(),
  coverImageUrl: text("cover_image_url"),
  tags: jsonb("tags").$type<string[]>().default([]),
  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertBlogPostSchema = createInsertSchema(blogPostsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertBlogPost = z.infer<typeof insertBlogPostSchema>;
export type BlogPost = typeof blogPostsTable.$inferSelect;

export const crmContactsTable = pgTable("crm_contacts", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone"),
  company: text("company"),
  type: text("type").default("prospect").notNull(),
  stage: text("stage").default("new").notNull(),
  notes: text("notes"),
  source: text("source"),
  assignedTo: text("assigned_to"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertCrmContactSchema = createInsertSchema(crmContactsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertCrmContact = z.infer<typeof insertCrmContactSchema>;
export type CrmContact = typeof crmContactsTable.$inferSelect;
