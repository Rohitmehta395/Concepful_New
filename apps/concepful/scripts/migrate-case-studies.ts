/**
 * Phase 8 Content Migration Script
 *
 * Seeds Payload CMS collections (Categories, Media, CaseStudies) from data/case-studies.ts.
 * - Idempotent: safe to run multiple times.
 * - Category sort order matches CATEGORY_FILTERS curated order.
 * - Cover images are fetched from Unsplash and uploaded to Media collection.
 * - Fallback placeholder used if Unsplash fetch fails (flagged for review).
 * - Reruns retry placeholders if the network was previously down.
 * - All Case Studies created strictly with _status: 'draft'.
 */

import { getPayload, type Payload } from 'payload';
import configPromise from '../payload.config';
import { CASE_STUDIES, CATEGORY_FILTERS } from '../data/case-studies';
import fs from 'fs';
import path from 'path';

/**
 * Shared theme applied across all case studies to match the brand primary color:
 * hsl(349, 90%, 54%) = #F32047
 */
export const SHARED_THEME = 'rose';

export const CURATED_CATEGORIES = [
  { slug: 'brand', name: 'Brand', sortOrder: 1 },
  { slug: 'website', name: 'Website', sortOrder: 2 },
  { slug: 'product-app', name: 'Product & App', sortOrder: 3 },
  { slug: 'content-story', name: 'Content & Story', sortOrder: 4 },
  { slug: 'marketing-launch', name: 'Marketing & Launch', sortOrder: 5 },
  { slug: 'experimental', name: 'Experimental', sortOrder: 6 },
];

const FALLBACK_PNG_BASE64 =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

export interface MigrationResult {
  categoriesCreated: number;
  categoriesReused: number;
  mediaCreated: number;
  mediaReused: number;
  placeholdersCreated: number;
  caseStudiesCreated: number;
  caseStudiesUpdated: number;
  warnings: string[];
}

async function fetchImageBuffer(url: string): Promise<{ buffer: Buffer; mimetype: string } | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000);
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);
    if (!res.ok) {
      return null;
    }
    const contentType = res.headers.get('content-type') || 'image/jpeg';
    const arrayBuffer = await res.arrayBuffer();
    return {
      buffer: Buffer.from(arrayBuffer),
      mimetype: contentType.split(';')[0].trim() || 'image/jpeg',
    };
  } catch (err) {
    return null;
  }
}

export async function migrateCaseStudies(injectedPayload?: Payload): Promise<MigrationResult> {
  const payload = injectedPayload || (await getPayload({ config: configPromise }));

  const result: MigrationResult = {
    categoriesCreated: 0,
    categoriesReused: 0,
    mediaCreated: 0,
    mediaReused: 0,
    placeholdersCreated: 0,
    caseStudiesCreated: 0,
    caseStudiesUpdated: 0,
    warnings: [],
  };

  console.log('====================================================');
  console.log(' Starting Phase 8 Case Studies & Categories Migration');
  console.log('====================================================');

  // Step 1: Migrate / Re-use Categories
  console.log('\n[1/3] Seeding / Verifying Categories...');
  const categoryMap = new Map<string, string>(); // slug -> ID

  for (const cat of CURATED_CATEGORIES) {
    const existing = await payload.find({
      collection: 'categories',
      where: { slug: { equals: cat.slug } },
      limit: 1,
      overrideAccess: true,
    });

    if (existing.totalDocs > 0) {
      const doc = existing.docs[0];
      categoryMap.set(cat.slug, String(doc.id));
      result.categoriesReused++;
      // Ensure sortOrder is up to date
      if (doc.sortOrder !== cat.sortOrder || doc.name !== cat.name) {
        await payload.update({
          collection: 'categories',
          id: doc.id,
          data: { name: cat.name, sortOrder: cat.sortOrder },
          overrideAccess: true,
        });
      }
      console.log(`  ✓ Reused category: "${cat.name}" (slug: ${cat.slug}, sortOrder: ${cat.sortOrder}) [ID: ${doc.id}]`);
    } else {
      const created = await payload.create({
        collection: 'categories',
        data: {
          name: cat.name,
          slug: cat.slug,
          sortOrder: cat.sortOrder,
        },
        overrideAccess: true,
      });
      categoryMap.set(cat.slug, String(created.id));
      result.categoriesCreated++;
      console.log(`  + Created category: "${cat.name}" (slug: ${cat.slug}, sortOrder: ${cat.sortOrder}) [ID: ${created.id}]`);
    }
  }

  // Step 2: Migrate Media and Case Studies
  console.log(`\n[2/3] Processing ${CASE_STUDIES.length} Case Studies from data/case-studies.ts...`);

  for (let i = 0; i < CASE_STUDIES.length; i++) {
    const cs = CASE_STUDIES[i];
    const targetTheme = SHARED_THEME;

    const categoryId = categoryMap.get(cs.category);
    if (!categoryId) {
      throw new Error(`Category slug "${cs.category}" for case study "${cs.slug}" not found in category map.`);
    }

    console.log(`\n--- [${i + 1}/${CASE_STUDIES.length}] Processing "${cs.title}" (${cs.slug}) ---`);

    // Check if Case Study already exists
    const existingCs = await payload.find({
      collection: 'case-studies',
      where: { slug: { equals: cs.slug } },
      draft: true,
      limit: 1,
      overrideAccess: true,
    });

    let mediaId: string | null = null;
    let shouldFetchImage = true;

    if (existingCs.totalDocs > 0) {
      const existingDoc = existingCs.docs[0];
      const existingCoverImage = existingDoc.coverImage;

      if (existingCoverImage) {
        const coverId = typeof existingCoverImage === 'object' ? existingCoverImage.id : existingCoverImage;
        try {
          const mediaDoc = await payload.findByID({
            collection: 'media',
            id: coverId,
            overrideAccess: true,
          });

          const isPlaceholder =
            mediaDoc?.alt?.includes('[NEEDS REVIEW]') ||
            (mediaDoc as any)?.filename?.startsWith('placeholder-');

          if (isPlaceholder) {
            console.log(`  ℹ Existing cover image is a placeholder. Retrying Unsplash fetch...`);
            shouldFetchImage = true;
          } else {
            console.log(`  ✓ Existing valid cover image found [ID: ${coverId}]. Reusing.`);
            mediaId = String(coverId);
            result.mediaReused++;
            shouldFetchImage = false;
          }
        } catch {
          shouldFetchImage = true;
        }
      }
    }

    if (shouldFetchImage) {
      console.log(`  → Fetching cover image from: ${cs.image}`);
      const fetched = await fetchImageBuffer(cs.image);

      if (fetched) {
        const ext = fetched.mimetype === 'image/png' ? 'png' : 'jpg';
        const filename = `${cs.slug}-cover.${ext}`;

        const mediaDoc = await payload.create({
          collection: 'media',
          data: {
            alt: `${cs.title} cover image`,
            caption: `${cs.client} - ${cs.title}`,
          },
          file: {
            data: fetched.buffer,
            mimetype: fetched.mimetype,
            name: filename,
            size: fetched.buffer.length,
          },
          overrideAccess: true,
        });

        mediaId = String(mediaDoc.id);
        result.mediaCreated++;
        console.log(`  ✓ Image uploaded to Media collection [ID: ${mediaId}, filename: ${filename}]`);
      } else {
        const warningMsg = `[WARNING][MANUAL ACTION REQUIRED] Failed to fetch image for "${cs.slug}" (${cs.image}). Uploading fallback placeholder.`;
        console.warn(`  ⚠ ${warningMsg}`);
        result.warnings.push(warningMsg);

        const placeholderBuffer = Buffer.from(FALLBACK_PNG_BASE64, 'base64');
        const placeholderFilename = `placeholder-${cs.slug}.png`;

        const placeholderMedia = await payload.create({
          collection: 'media',
          data: {
            alt: `[NEEDS REVIEW] Placeholder for ${cs.slug}`,
            caption: `Failed image fetch placeholder for ${cs.slug}`,
          },
          file: {
            data: placeholderBuffer,
            mimetype: 'image/png',
            name: placeholderFilename,
            size: placeholderBuffer.length,
          },
          overrideAccess: true,
        });

        mediaId = String(placeholderMedia.id);
        result.placeholdersCreated++;
        console.log(`  ⚠ Fallback placeholder uploaded to Media [ID: ${mediaId}]`);
      }
    }

    if (!mediaId) {
      throw new Error(`Failed to resolve a media ID for case study "${cs.slug}".`);
    }

    const caseStudyData = {
      slug: cs.slug,
      title: cs.title,
      client: cs.client,
      category: categoryId,
      teaser: cs.teaser,
      coverImage: mediaId,
      theme: targetTheme as any,
      brief: cs.brief,
      challenges: cs.challenges.map((text) => ({ text })),
      deliverables: cs.deliverables.map((text) => ({ text })),
      tools: cs.tools.map((text) => ({ text })),
      outcome: cs.outcome,
      outcomeMetrics: cs.outcomeMetrics.map((m) => ({ label: m.label, value: m.value })),
      featured: cs.featured,
      tags: cs.tags.map((text) => ({ text })),
      sortOrder: i + 1,
      _status: 'draft' as const,
    };

    if (existingCs.totalDocs > 0) {
      const existingDoc = existingCs.docs[0];
      const updated = await payload.update({
        collection: 'case-studies',
        id: existingDoc.id,
        data: caseStudyData,
        draft: true,
        overrideAccess: true,
      });

      if ((updated as any)._status !== 'draft') {
        throw new Error(`CRITICAL: Case study "${cs.slug}" was updated with status "${(updated as any)._status}" instead of "draft"!`);
      }

      result.caseStudiesUpdated++;
      console.log(`  ✓ Updated existing Case Study draft [ID: ${existingDoc.id}, slug: ${cs.slug}, theme: ${targetTheme}]`);
    } else {
      const created = await payload.create({
        collection: 'case-studies',
        data: caseStudyData,
        draft: true,
        overrideAccess: true,
      });

      if ((created as any)._status !== 'draft') {
        throw new Error(`CRITICAL: Case study "${cs.slug}" was created with status "${(created as any)._status}" instead of "draft"!`);
      }

      result.caseStudiesCreated++;
      console.log(`  + Created new Case Study draft [ID: ${created.id}, slug: ${cs.slug}, theme: ${targetTheme}]`);
    }
  }

  console.log('\n[3/3] Migration Complete!');
  console.log('====================================================');
  console.log(`Summary:`);
  console.log(`  Categories Created:     ${result.categoriesCreated}`);
  console.log(`  Categories Reused:      ${result.categoriesReused}`);
  console.log(`  Media Assets Created:   ${result.mediaCreated}`);
  console.log(`  Media Assets Reused:    ${result.mediaReused}`);
  console.log(`  Placeholders Created:   ${result.placeholdersCreated}`);
  console.log(`  Case Studies Created:   ${result.caseStudiesCreated}`);
  console.log(`  Case Studies Updated:   ${result.caseStudiesUpdated}`);
  console.log(`  Warnings / Review:      ${result.warnings.length}`);
  console.log('====================================================\n');

  return result;
}
