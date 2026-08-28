CREATE TABLE "ai_model_profiles" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_id" integer NOT NULL,
	"providers" jsonb DEFAULT '[]'::jsonb,
	"model_name" text,
	"use_cases" jsonb DEFAULT '[]'::jsonb,
	"usage_notes" text,
	"consent_ai_workflows" boolean DEFAULT false,
	"consent_brand_memory" boolean DEFAULT false,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "ai_model_profiles_company_id_unique" UNIQUE("company_id")
);
--> statement-breakpoint
CREATE TABLE "blog_posts" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"content" text DEFAULT '' NOT NULL,
	"excerpt" text,
	"category" text DEFAULT 'insights' NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"cover_image_url" text,
	"tags" jsonb DEFAULT '[]'::jsonb,
	"published_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "blog_posts_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "brand_checks" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_id" integer NOT NULL,
	"input_text" text NOT NULL,
	"input_type" text DEFAULT 'text',
	"alignment_score" real NOT NULL,
	"tone_score" real NOT NULL,
	"color_score" real NOT NULL,
	"messaging_score" real NOT NULL,
	"typography_score" real NOT NULL,
	"recommendations" jsonb DEFAULT '[]'::jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "brand_profiles" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_id" integer NOT NULL,
	"colors" jsonb DEFAULT '[]'::jsonb,
	"fonts" jsonb DEFAULT '[]'::jsonb,
	"tone_words" jsonb DEFAULT '[]'::jsonb,
	"visual_references" jsonb DEFAULT '[]'::jsonb,
	"approved_assets" jsonb DEFAULT '[]'::jsonb,
	"banned_words" jsonb DEFAULT '[]'::jsonb,
	"required_disclaimers" jsonb DEFAULT '[]'::jsonb,
	"audience_notes" text,
	"competitor_notes" text,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "brand_profiles_company_id_unique" UNIQUE("company_id")
);
--> statement-breakpoint
CREATE TABLE "companies" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"website" text,
	"industry" text,
	"size" text,
	"revenue_range" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "completed_work" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_id" integer NOT NULL,
	"title" text NOT NULL,
	"category" text NOT NULL,
	"notes" text,
	"approved" boolean DEFAULT false,
	"completed_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "crm_contacts" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text,
	"phone" text,
	"company" text,
	"type" text DEFAULT 'prospect' NOT NULL,
	"stage" text DEFAULT 'new' NOT NULL,
	"notes" text,
	"source" text,
	"assigned_to" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "onboarding_submissions" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_id" integer NOT NULL,
	"company_name" text NOT NULL,
	"contact_name" text,
	"contact_email" text,
	"contact_phone" text,
	"tier" text NOT NULL,
	"billing_cycle" text NOT NULL,
	"add_ons" jsonb DEFAULT '[]'::jsonb,
	"ai_ops_level" text DEFAULT 'none',
	"estimated_monthly_total" real,
	"estimated_annual_total" real,
	"goals" jsonb,
	"brand_inputs" jsonb,
	"ai_setup" jsonb,
	"status" text DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "plan_selections" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_id" integer NOT NULL,
	"tier" text NOT NULL,
	"billing_cycle" text NOT NULL,
	"base_price" real NOT NULL,
	"discount" real DEFAULT 0,
	"add_ons" jsonb DEFAULT '[]'::jsonb,
	"ai_ops_level" text DEFAULT 'none',
	"estimated_monthly_total" real,
	"estimated_annual_total" real,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "portfolio_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"client_name" text,
	"type" text NOT NULL,
	"description" text,
	"cover_image_url" text,
	"featured" boolean DEFAULT false,
	"sort_order" integer DEFAULT 0,
	"status" text DEFAULT 'draft' NOT NULL,
	"tags" jsonb DEFAULT '[]'::jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "work_requests" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_id" integer NOT NULL,
	"title" text NOT NULL,
	"type" text NOT NULL,
	"goal" text,
	"priority" text DEFAULT 'medium' NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"deadline" text,
	"description" text,
	"reference_links" jsonb DEFAULT '[]'::jsonb,
	"notes" text,
	"assigned_to" text,
	"next_action" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "ai_model_profiles" ADD CONSTRAINT "ai_model_profiles_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "brand_checks" ADD CONSTRAINT "brand_checks_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "brand_profiles" ADD CONSTRAINT "brand_profiles_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "completed_work" ADD CONSTRAINT "completed_work_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "onboarding_submissions" ADD CONSTRAINT "onboarding_submissions_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "plan_selections" ADD CONSTRAINT "plan_selections_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "work_requests" ADD CONSTRAINT "work_requests_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;