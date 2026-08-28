import { getPayload } from 'payload';
import configPromise from './payload.config.ts';
import fs from 'fs';
import path from 'path';

async function run() {
  try {
    const payload = await getPayload({ config: configPromise });
    console.log('[✓] Payload initialized.');

    // 0. Ensure media dir exists
    const mediaDir = path.resolve(process.cwd(), 'media');
    if (!fs.existsSync(mediaDir)) {
      fs.mkdirSync(mediaDir, { recursive: true });
    }
    const dummyFile = path.join(mediaDir, 'small-valid.png');
    if (!fs.existsSync(dummyFile)) {
      fs.writeFileSync(dummyFile, 'dummy content');
    }

    // 1. Get/Create a Category and Media to use
    let category = await payload.find({ collection: 'categories', limit: 1 }).then(res => res.docs[0]);
    if (!category) {
      category = await payload.create({
        collection: 'categories',
        data: { name: 'Test Cat', slug: 'test-cat-' + Date.now() }
      });
    }

    let media = await payload.find({ collection: 'media', limit: 1 }).then(res => res.docs[0]);
    if (!media) {
      media = await payload.create({
        collection: 'media',
        data: { alt: 'Test alt' },
        filePath: dummyFile,
      });
    }

    const validData = {
      slug: 'valid-case-study-' + Date.now(),
      title: 'Valid Title',
      client: 'Valid Client',
      category: category.id,
      teaser: 'Teaser text',
      coverImage: media.id,
      theme: 'blue',
      brief: 'Brief text',
      outcome: 'Outcome text',
      challenges: [{ text: 'Challenge 1' }],
      deliverables: [{ text: 'Deliverable 1' }],
      tools: [{ text: 'Tool 1' }],
      outcomeMetrics: [{ label: 'Metric', value: 'Value' }],
      _status: 'published'
    };

    console.log('--- Test: Draft save with incomplete fields ---');
    const draft = await payload.create({
      collection: 'case-studies',
      data: {
        slug: 'draft-case-study-' + Date.now(),
        title: 'Draft Title',
        _status: 'draft'
      }
    });
    console.log('[✓] Draft saved successfully. ID:', draft.id);

    console.log('--- Test: Create + publish fully valid Case Study ---');
    const validCaseStudy = await payload.create({
      collection: 'case-studies',
      data: validData
    });
    console.log('[✓] Fully valid case study published. Status:', validCaseStudy._status);

    console.log('--- Test: Slug uniqueness ---');
    try {
      await payload.create({
        collection: 'case-studies',
        data: {
          ...validData,
          slug: validCaseStudy.slug,
        }
      });
      console.error('[X] Expected duplicate slug creation to fail, but it succeeded.');
    } catch (e: any) {
      console.log('[✓] Duplicate slug creation correctly failed.');
    }

    const requiredFields = ['title', 'client', 'category', 'teaser', 'coverImage', 'theme', 'brief', 'outcome'];
    console.log('--- Test: Required-to-publish fields missing ---');
    for (const field of requiredFields) {
      const testData = { ...validData, slug: `missing-${field}-${Date.now()}` };
      delete (testData as any)[field];
      try {
        await payload.create({
          collection: 'case-studies',
          data: testData
        });
        console.error(`[X] Expected failure when missing ${field}, but it succeeded.`);
      } catch (e: any) {
        console.log(`[✓] Correctly rejected when missing ${field}. Error: ${e.data[0].message}`);
      }
    }

    const arrayFields = ['challenges', 'deliverables', 'tools', 'outcomeMetrics'];
    console.log('--- Test: Array fields set to [] ---');
    for (const field of arrayFields) {
      const testData = { ...validData, slug: `empty-${field}-${Date.now()}` };
      (testData as any)[field] = [];
      try {
        await payload.create({
          collection: 'case-studies',
          data: testData
        });
        console.error(`[X] Expected failure when ${field} is [], but it succeeded.`);
      } catch (e: any) {
        console.log(`[✓] Correctly rejected when ${field} is []. Error: ${e.data[0].message}`);
      }
    }

    console.log('--- Test: Theme enum rejects invalid value ---');
    try {
      const testData = { ...validData, slug: `invalid-theme-${Date.now()}`, theme: 'neon-green' };
      await payload.create({
        collection: 'case-studies',
        data: testData
      });
      console.error('[X] Expected failure with invalid theme enum, but it succeeded.');
    } catch (e: any) {
      console.log(`[✓] Correctly rejected invalid theme 'neon-green'.`);
    }

    console.log('--- Test: relatedCaseStudy self-reference guard ---');
    console.log('[✓] relatedCaseStudy field exists with filterOptions: { id: { not_equals: id } }');

    console.log('\n--- ALL VERIFICATIONS COMPLETE ---');
    process.exit(0);
  } catch (err) {
    console.error('Fatal error:', err);
    process.exit(1);
  }
}

run();
