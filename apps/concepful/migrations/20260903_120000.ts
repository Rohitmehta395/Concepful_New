import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres';

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "payload"."case_studies" ADD COLUMN IF NOT EXISTS "cta_text" varchar;
    ALTER TABLE "payload"."_case_studies_v" ADD COLUMN IF NOT EXISTS "version_cta_text" varchar;
  `);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "payload"."case_studies" DROP COLUMN IF EXISTS "cta_text";
    ALTER TABLE "payload"."_case_studies_v" DROP COLUMN IF EXISTS "version_cta_text";
  `);
}
