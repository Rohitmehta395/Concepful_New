import { postgresAdapter } from '@payloadcms/db-postgres';
import { lexicalEditor } from '@payloadcms/richtext-lexical';
import { gcsStorage } from '@payloadcms/storage-gcs';
import { buildConfig } from 'payload';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { Users } from './collections/Users';
import { Categories } from './collections/Categories';
import { Media } from './collections/Media';
import { CaseStudies } from './collections/CaseStudies';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export default buildConfig({
  admin: {
    user: 'users',
  },
  routes: {
    admin: '/payload-admin',
  },
  collections: [
    Users,
    Categories,
    Media,
    CaseStudies,
  ],
  editor: lexicalEditor({}),
  secret: process.env.PAYLOAD_SECRET || 'fallback-secret',
  db: postgresAdapter({
    pool: {
      connectionString: (process.env.DATABASE_URL || '').replace('?sslmode=require', ''),
      ssl: {
        rejectUnauthorized: false,
      },
    },
    schemaName: 'payload',
  }),
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  plugins: [
    gcsStorage({
      collections: {
        media: true,
      },
      bucket: process.env.GCS_BUCKET || '',
      options: {
        projectId: process.env.GCS_PROJECT_ID,
        credentials: {
          client_email: process.env.GCS_CLIENT_EMAIL,
          private_key: process.env.GCS_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        },
      },
    }),
  ],
});
