import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE SCHEMA IF NOT EXISTS "payload";
   CREATE TYPE "payload"."enum_users_role" AS ENUM('admin', 'editor');
  CREATE TYPE "payload"."enum_case_studies_theme" AS ENUM('rose');
  CREATE TYPE "payload"."enum_case_studies_status" AS ENUM('draft', 'published');
  CREATE TYPE "payload"."enum__case_studies_v_version_theme" AS ENUM('rose');
  CREATE TYPE "payload"."enum__case_studies_v_version_status" AS ENUM('draft', 'published');
  CREATE TABLE "payload"."users_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "payload"."users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"role" "payload"."enum_users_role" DEFAULT 'editor' NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "payload"."categories" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"sort_order" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload"."media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"alt" varchar NOT NULL,
  	"caption" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric
  );
  
  CREATE TABLE "payload"."case_studies_challenges" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "payload"."case_studies_deliverables" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "payload"."case_studies_tools" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "payload"."case_studies_outcome_metrics" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"value" varchar
  );
  
  CREATE TABLE "payload"."case_studies_tags" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "payload"."case_studies" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"slug" varchar,
  	"title" varchar,
  	"client" varchar,
  	"category_id" integer,
  	"teaser" varchar,
  	"cover_image_id" integer,
  	"theme" "payload"."enum_case_studies_theme",
  	"brief" varchar,
  	"outcome" varchar,
  	"featured" boolean DEFAULT false,
  	"sort_order" numeric,
  	"related_case_study_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "payload"."enum_case_studies_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "payload"."_case_studies_v_version_challenges" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "payload"."_case_studies_v_version_deliverables" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "payload"."_case_studies_v_version_tools" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "payload"."_case_studies_v_version_outcome_metrics" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"value" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "payload"."_case_studies_v_version_tags" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "payload"."_case_studies_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_slug" varchar,
  	"version_title" varchar,
  	"version_client" varchar,
  	"version_category_id" integer,
  	"version_teaser" varchar,
  	"version_cover_image_id" integer,
  	"version_theme" "payload"."enum__case_studies_v_version_theme",
  	"version_brief" varchar,
  	"version_outcome" varchar,
  	"version_featured" boolean DEFAULT false,
  	"version_sort_order" numeric,
  	"version_related_case_study_id" integer,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "payload"."enum__case_studies_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "payload"."payload_kv" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"data" jsonb NOT NULL
  );
  
  CREATE TABLE "payload"."payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload"."payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer,
  	"categories_id" integer,
  	"media_id" integer,
  	"case_studies_id" integer
  );
  
  CREATE TABLE "payload"."payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload"."payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE "payload"."payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payload"."users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."case_studies_challenges" ADD CONSTRAINT "case_studies_challenges_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."case_studies"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."case_studies_deliverables" ADD CONSTRAINT "case_studies_deliverables_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."case_studies"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."case_studies_tools" ADD CONSTRAINT "case_studies_tools_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."case_studies"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."case_studies_outcome_metrics" ADD CONSTRAINT "case_studies_outcome_metrics_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."case_studies"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."case_studies_tags" ADD CONSTRAINT "case_studies_tags_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."case_studies"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."case_studies" ADD CONSTRAINT "case_studies_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "payload"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."case_studies" ADD CONSTRAINT "case_studies_cover_image_id_media_id_fk" FOREIGN KEY ("cover_image_id") REFERENCES "payload"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."case_studies" ADD CONSTRAINT "case_studies_related_case_study_id_case_studies_id_fk" FOREIGN KEY ("related_case_study_id") REFERENCES "payload"."case_studies"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."_case_studies_v_version_challenges" ADD CONSTRAINT "_case_studies_v_version_challenges_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."_case_studies_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."_case_studies_v_version_deliverables" ADD CONSTRAINT "_case_studies_v_version_deliverables_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."_case_studies_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."_case_studies_v_version_tools" ADD CONSTRAINT "_case_studies_v_version_tools_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."_case_studies_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."_case_studies_v_version_outcome_metrics" ADD CONSTRAINT "_case_studies_v_version_outcome_metrics_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."_case_studies_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."_case_studies_v_version_tags" ADD CONSTRAINT "_case_studies_v_version_tags_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."_case_studies_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."_case_studies_v" ADD CONSTRAINT "_case_studies_v_parent_id_case_studies_id_fk" FOREIGN KEY ("parent_id") REFERENCES "payload"."case_studies"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."_case_studies_v" ADD CONSTRAINT "_case_studies_v_version_category_id_categories_id_fk" FOREIGN KEY ("version_category_id") REFERENCES "payload"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."_case_studies_v" ADD CONSTRAINT "_case_studies_v_version_cover_image_id_media_id_fk" FOREIGN KEY ("version_cover_image_id") REFERENCES "payload"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."_case_studies_v" ADD CONSTRAINT "_case_studies_v_version_related_case_study_id_case_studies_id_fk" FOREIGN KEY ("version_related_case_study_id") REFERENCES "payload"."case_studies"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "payload"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "payload"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "payload"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "payload"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_case_studies_fk" FOREIGN KEY ("case_studies_id") REFERENCES "payload"."case_studies"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "payload"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "payload"."users"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "users_sessions_order_idx" ON "payload"."users_sessions" USING btree ("_order");
  CREATE INDEX "users_sessions_parent_id_idx" ON "payload"."users_sessions" USING btree ("_parent_id");
  CREATE INDEX "users_updated_at_idx" ON "payload"."users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "payload"."users" USING btree ("created_at");
  CREATE UNIQUE INDEX "users_email_idx" ON "payload"."users" USING btree ("email");
  CREATE UNIQUE INDEX "categories_name_idx" ON "payload"."categories" USING btree ("name");
  CREATE UNIQUE INDEX "categories_slug_idx" ON "payload"."categories" USING btree ("slug");
  CREATE INDEX "categories_updated_at_idx" ON "payload"."categories" USING btree ("updated_at");
  CREATE INDEX "categories_created_at_idx" ON "payload"."categories" USING btree ("created_at");
  CREATE INDEX "media_updated_at_idx" ON "payload"."media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "payload"."media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "payload"."media" USING btree ("filename");
  CREATE INDEX "case_studies_challenges_order_idx" ON "payload"."case_studies_challenges" USING btree ("_order");
  CREATE INDEX "case_studies_challenges_parent_id_idx" ON "payload"."case_studies_challenges" USING btree ("_parent_id");
  CREATE INDEX "case_studies_deliverables_order_idx" ON "payload"."case_studies_deliverables" USING btree ("_order");
  CREATE INDEX "case_studies_deliverables_parent_id_idx" ON "payload"."case_studies_deliverables" USING btree ("_parent_id");
  CREATE INDEX "case_studies_tools_order_idx" ON "payload"."case_studies_tools" USING btree ("_order");
  CREATE INDEX "case_studies_tools_parent_id_idx" ON "payload"."case_studies_tools" USING btree ("_parent_id");
  CREATE INDEX "case_studies_outcome_metrics_order_idx" ON "payload"."case_studies_outcome_metrics" USING btree ("_order");
  CREATE INDEX "case_studies_outcome_metrics_parent_id_idx" ON "payload"."case_studies_outcome_metrics" USING btree ("_parent_id");
  CREATE INDEX "case_studies_tags_order_idx" ON "payload"."case_studies_tags" USING btree ("_order");
  CREATE INDEX "case_studies_tags_parent_id_idx" ON "payload"."case_studies_tags" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "case_studies_slug_idx" ON "payload"."case_studies" USING btree ("slug");
  CREATE INDEX "case_studies_category_idx" ON "payload"."case_studies" USING btree ("category_id");
  CREATE INDEX "case_studies_cover_image_idx" ON "payload"."case_studies" USING btree ("cover_image_id");
  CREATE INDEX "case_studies_related_case_study_idx" ON "payload"."case_studies" USING btree ("related_case_study_id");
  CREATE INDEX "case_studies_updated_at_idx" ON "payload"."case_studies" USING btree ("updated_at");
  CREATE INDEX "case_studies_created_at_idx" ON "payload"."case_studies" USING btree ("created_at");
  CREATE INDEX "case_studies__status_idx" ON "payload"."case_studies" USING btree ("_status");
  CREATE INDEX "_case_studies_v_version_challenges_order_idx" ON "payload"."_case_studies_v_version_challenges" USING btree ("_order");
  CREATE INDEX "_case_studies_v_version_challenges_parent_id_idx" ON "payload"."_case_studies_v_version_challenges" USING btree ("_parent_id");
  CREATE INDEX "_case_studies_v_version_deliverables_order_idx" ON "payload"."_case_studies_v_version_deliverables" USING btree ("_order");
  CREATE INDEX "_case_studies_v_version_deliverables_parent_id_idx" ON "payload"."_case_studies_v_version_deliverables" USING btree ("_parent_id");
  CREATE INDEX "_case_studies_v_version_tools_order_idx" ON "payload"."_case_studies_v_version_tools" USING btree ("_order");
  CREATE INDEX "_case_studies_v_version_tools_parent_id_idx" ON "payload"."_case_studies_v_version_tools" USING btree ("_parent_id");
  CREATE INDEX "_case_studies_v_version_outcome_metrics_order_idx" ON "payload"."_case_studies_v_version_outcome_metrics" USING btree ("_order");
  CREATE INDEX "_case_studies_v_version_outcome_metrics_parent_id_idx" ON "payload"."_case_studies_v_version_outcome_metrics" USING btree ("_parent_id");
  CREATE INDEX "_case_studies_v_version_tags_order_idx" ON "payload"."_case_studies_v_version_tags" USING btree ("_order");
  CREATE INDEX "_case_studies_v_version_tags_parent_id_idx" ON "payload"."_case_studies_v_version_tags" USING btree ("_parent_id");
  CREATE INDEX "_case_studies_v_parent_idx" ON "payload"."_case_studies_v" USING btree ("parent_id");
  CREATE INDEX "_case_studies_v_version_version_slug_idx" ON "payload"."_case_studies_v" USING btree ("version_slug");
  CREATE INDEX "_case_studies_v_version_version_category_idx" ON "payload"."_case_studies_v" USING btree ("version_category_id");
  CREATE INDEX "_case_studies_v_version_version_cover_image_idx" ON "payload"."_case_studies_v" USING btree ("version_cover_image_id");
  CREATE INDEX "_case_studies_v_version_version_related_case_study_idx" ON "payload"."_case_studies_v" USING btree ("version_related_case_study_id");
  CREATE INDEX "_case_studies_v_version_version_updated_at_idx" ON "payload"."_case_studies_v" USING btree ("version_updated_at");
  CREATE INDEX "_case_studies_v_version_version_created_at_idx" ON "payload"."_case_studies_v" USING btree ("version_created_at");
  CREATE INDEX "_case_studies_v_version_version__status_idx" ON "payload"."_case_studies_v" USING btree ("version__status");
  CREATE INDEX "_case_studies_v_created_at_idx" ON "payload"."_case_studies_v" USING btree ("created_at");
  CREATE INDEX "_case_studies_v_updated_at_idx" ON "payload"."_case_studies_v" USING btree ("updated_at");
  CREATE INDEX "_case_studies_v_latest_idx" ON "payload"."_case_studies_v" USING btree ("latest");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload"."payload_kv" USING btree ("key");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload"."payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload"."payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload"."payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload"."payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload"."payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload"."payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "payload"."payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_locked_documents_rels_categories_id_idx" ON "payload"."payload_locked_documents_rels" USING btree ("categories_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload"."payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_locked_documents_rels_case_studies_id_idx" ON "payload"."payload_locked_documents_rels" USING btree ("case_studies_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload"."payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload"."payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload"."payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload"."payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload"."payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload"."payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "payload"."payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload"."payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload"."payload_migrations" USING btree ("created_at");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "payload"."users_sessions" CASCADE;
  DROP TABLE "payload"."users" CASCADE;
  DROP TABLE "payload"."categories" CASCADE;
  DROP TABLE "payload"."media" CASCADE;
  DROP TABLE "payload"."case_studies_challenges" CASCADE;
  DROP TABLE "payload"."case_studies_deliverables" CASCADE;
  DROP TABLE "payload"."case_studies_tools" CASCADE;
  DROP TABLE "payload"."case_studies_outcome_metrics" CASCADE;
  DROP TABLE "payload"."case_studies_tags" CASCADE;
  DROP TABLE "payload"."case_studies" CASCADE;
  DROP TABLE "payload"."_case_studies_v_version_challenges" CASCADE;
  DROP TABLE "payload"."_case_studies_v_version_deliverables" CASCADE;
  DROP TABLE "payload"."_case_studies_v_version_tools" CASCADE;
  DROP TABLE "payload"."_case_studies_v_version_outcome_metrics" CASCADE;
  DROP TABLE "payload"."_case_studies_v_version_tags" CASCADE;
  DROP TABLE "payload"."_case_studies_v" CASCADE;
  DROP TABLE "payload"."payload_kv" CASCADE;
  DROP TABLE "payload"."payload_locked_documents" CASCADE;
  DROP TABLE "payload"."payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload"."payload_preferences" CASCADE;
  DROP TABLE "payload"."payload_preferences_rels" CASCADE;
  DROP TABLE "payload"."payload_migrations" CASCADE;
  DROP TYPE "payload"."enum_users_role";
  DROP TYPE "payload"."enum_case_studies_theme";
  DROP TYPE "payload"."enum_case_studies_status";
  DROP TYPE "payload"."enum__case_studies_v_version_theme";
  DROP TYPE "payload"."enum__case_studies_v_version_status";`)
}
