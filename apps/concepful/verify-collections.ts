import { getPayload } from 'payload'
import config from './payload.config'
import fs from 'fs'

async function run() {
  const payload = await getPayload({ config })

  console.log('\n--- TEST 1: Create valid category ---');
  try {
    const validCategory = await payload.create({
      collection: 'categories',
      data: { name: 'Valid Cat', slug: 'valid-cat' },
    });
    console.log('SUCCESS: Created valid category:', validCategory.id);
  } catch(e) {
    console.error('FAIL:', e.message);
  }

  console.log('\n--- TEST 2: Duplicate category ---');
  try {
    await payload.create({
      collection: 'categories',
      data: { name: 'Valid Cat', slug: 'valid-cat' },
    });
    console.error('FAIL: Should have rejected duplicate.');
  } catch(e) {
    console.log('SUCCESS: Rejected duplicate category:', e.message);
  }

  console.log('\n--- TEST 3: Invalid slug ---');
  try {
    await payload.create({
      collection: 'categories',
      data: { name: 'Invalid Cat', slug: 'Invalid Slug!' },
    });
    console.error('FAIL: Should have rejected invalid slug.');
  } catch(e) {
    console.log('SUCCESS: Rejected invalid slug:', e.message);
  }

  console.log('\n--- TEST 4: Create valid media ---');
  try {
    fs.writeFileSync('test-image.png', 'fake image content');
    const validMedia = await payload.create({
      collection: 'media',
      data: { alt: 'A valid alt text' },
      file: {
        data: fs.readFileSync('test-image.png'),
        mimetype: 'image/png',
        name: 'test-image.png',
        size: 16,
      }
    });
    console.log('SUCCESS: Created valid media:', validMedia.id);
  } catch(e) {
    console.error('FAIL:', e.message);
  }

  console.log('\n--- TEST 5: Create media WITHOUT alt ---');
  try {
    const invalidMedia = await payload.create({
      collection: 'media',
      data: { },
      file: {
        data: fs.readFileSync('test-image.png'),
        mimetype: 'image/png',
        name: 'test-image.png',
        size: 16,
      }
    });
    console.error('FAIL: Should have rejected missing alt.');
  } catch(e) {
    console.log('SUCCESS: Rejected missing alt:', e.message);
  }

  console.log('\n--- TEST 6: Non-image upload ---');
  try {
    fs.writeFileSync('test.txt', 'not an image');
    await payload.create({
      collection: 'media',
      data: { alt: 'Some alt' },
      file: {
        data: fs.readFileSync('test.txt'),
        mimetype: 'text/plain',
        name: 'test.txt',
        size: 12,
      }
    });
    console.error('FAIL: Should have rejected text file.');
  } catch(e) {
    console.log('SUCCESS: Rejected text file:', e.message);
  }

  console.log('\nDONE');
  process.exit(0);
}

run();
