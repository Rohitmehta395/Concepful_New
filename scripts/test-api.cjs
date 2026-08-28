const http = require('http');

async function request(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3005,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };
    if (data) {
      const dataString = JSON.stringify(data);
      options.headers['Content-Length'] = Buffer.byteLength(dataString);
    }
    const req = http.request(options, (res) => {
      let responseBody = '';
      res.on('data', chunk => responseBody += chunk);
      res.on('end', () => {
        try {
          if (responseBody) {
            const parsed = JSON.parse(responseBody);
            resolve({ status: res.statusCode, data: parsed });
          } else {
            resolve({ status: res.statusCode, data: null });
          }
        } catch(e) {
          resolve({ status: res.statusCode, data: responseBody });
        }
      });
    });
    req.on('error', reject);
    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function run() {
  try {
    const isUnauthTest = process.argv.includes('--unauth');

    if (isUnauthTest) {
      console.log('--- Test 0: Verify Unauthenticated Request is Rejected ---');
      const unauthRes = await request('POST', '/api/case-studies', { title: 'Unauth' });
      if (unauthRes.status === 403) {
        console.log('[✓] Unauthenticated POST request correctly rejected with 403.');
      } else {
        console.error('[X] Expected 403 for unauthenticated request, got:', unauthRes.status);
        process.exit(1);
      }
      return;
    }

    console.log('Fetching Categories...');
    let catRes = await request('GET', '/api/categories?limit=1');
    let catId = catRes.data.docs[0]?.id;
    if (!catId) {
      catRes = await request('POST', '/api/categories', { name: 'Test Cat', slug: 'test-cat-' + Date.now() });
      catId = catRes.data.doc.id;
    }

    console.log('Fetching Media...');
    let mediaRes = await request('GET', '/api/media?limit=1');
    let mediaId = mediaRes.data.docs[0]?.id;
    if (!mediaId) {
       console.log('Missing media item, you should create one first or the REST API requires multipart/form-data.');
       process.exit(1);
    }

    const validData = {
      slug: 'valid-case-study-' + Date.now(),
      title: 'Valid Title',
      client: 'Valid Client',
      category: catId,
      teaser: 'Teaser text',
      coverImage: mediaId,
      theme: 'blue',
      brief: 'Brief text',
      outcome: 'Outcome text',
      challenges: [{ text: 'Challenge 1' }],
      deliverables: [{ text: 'Deliverable 1' }],
      tools: [{ text: 'Tool 1' }],
      outcomeMetrics: [{ label: 'Metric', value: 'Value' }],
      _status: 'published'
    };

    console.log('\n--- Test 1: Draft save with incomplete fields ---');
    const draftRes = await request('POST', '/api/case-studies', {
      slug: 'draft-case-study-' + Date.now(),
      title: 'Draft Title',
      _status: 'draft'
    });
    if (draftRes.status >= 200 && draftRes.status < 300) {
      console.log('[✓] Draft saved successfully.');
    } else {
      console.error('[X] Draft save failed:', draftRes.data);
    }

    console.log('\n--- Test 2: Create + publish fully valid Case Study ---');
    const validRes = await request('POST', '/api/case-studies', validData);
    if (validRes.status >= 200 && validRes.status < 300) {
      console.log('[✓] Fully valid case study published. Status:', validRes.data.doc._status);
    } else {
      console.error('[X] Valid Case Study creation failed:', validRes.data);
      process.exit(1);
    }

    console.log('\n--- Test 3: Slug uniqueness ---');
    const slugRes = await request('POST', '/api/case-studies', {
      ...validData,
      slug: validRes.data.doc.slug
    });
    if (slugRes.status >= 400) {
      console.log('[✓] Duplicate slug creation correctly failed. Status:', slugRes.status);
    } else {
      console.error('[X] Expected duplicate slug creation to fail, but it succeeded.');
    }

    const requiredFields = ['slug', 'title', 'client', 'category', 'teaser', 'coverImage', 'theme', 'brief', 'outcome'];
    console.log('\n--- Test 4: Required-to-publish fields missing ---');
    for (const field of requiredFields) {
      const testData = { ...validData, slug: `missing-${field}-${Date.now()}` };
      delete testData[field];
      const res = await request('POST', '/api/case-studies', testData);
      if (res.status >= 400) {
        console.log(`[✓] Correctly rejected when missing ${field}. Status: ${res.status}`);
      } else {
        console.error(`[X] Expected failure when missing ${field}, but it succeeded.`);
      }
    }

    console.log('\n--- Test 4.5: Missing slug on draft save ---');
    const draftNoSlug = await request('POST', '/api/case-studies', {
      title: 'Draft No Slug',
      _status: 'draft'
    });
    if (draftNoSlug.status >= 200 && draftNoSlug.status < 300) {
      console.log('[✓] Draft saved successfully WITHOUT a slug.');
    } else {
      console.log(`[X] Draft save failed WITHOUT a slug. Status: ${draftNoSlug.status}`);
    }

    const arrayFields = ['challenges', 'deliverables', 'tools', 'outcomeMetrics'];
    console.log('\n--- Test 5: Array fields set to [] ---');
    for (const field of arrayFields) {
      const testData = { ...validData, slug: `empty-${field}-${Date.now()}` };
      testData[field] = [];
      const res = await request('POST', '/api/case-studies', testData);
      if (res.status >= 400) {
        console.log(`[✓] Correctly rejected when ${field} is []. Status: ${res.status}`);
      } else {
        console.error(`[X] Expected failure when ${field} is [], but it succeeded.`);
      }
    }

    console.log('\n--- Test 6: Theme enum rejects invalid value ---');
    const themeRes = await request('POST', '/api/case-studies', {
      ...validData,
      slug: `invalid-theme-${Date.now()}`,
      theme: 'neon-green'
    });
    if (themeRes.status >= 400) {
      console.log(`[✓] Correctly rejected invalid theme 'neon-green'. Status: ${themeRes.status}`);
    } else {
      console.error('[X] Expected failure with invalid theme enum, but it succeeded.');
    }

    console.log('\n--- ALL VERIFICATIONS COMPLETE ---');
  } catch (err) {
    console.error('Fatal error:', err);
  }
}

run();
