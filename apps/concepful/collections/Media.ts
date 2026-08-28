import { CollectionConfig, APIError } from 'payload';

export const Media: CollectionConfig = {
  slug: 'media',
  upload: {
    staticDir: 'media', // Local disk upload handling for Phase 3
    mimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
  },
  access: {
    read: () => true,
  },
  hooks: {
    beforeValidate: [
      ({ data, req }) => {
        // Enforce a strict 10MB file size limit for uploads.
        // In Payload 3, filesize might be on data or req.file depending on the adapter.
        const size = data?.filesize || (req && req.file && req.file.size) || 0;
        if (size > 10 * 1024 * 1024) {
          throw new APIError('File exceeds the 10MB size limit.', 400, undefined, true);
        }
        return data;
      },
    ],
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
      label: 'Alt Text',
      admin: {
        description: 'Required. Provide a descriptive alternative text for screen readers and accessibility.',
      }
    },
    {
      name: 'caption',
      type: 'text',
      label: 'Caption',
    },
  ],
};
