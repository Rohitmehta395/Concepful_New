import { CollectionConfig } from 'payload';

export const Categories: CollectionConfig = {
  slug: 'categories',
  admin: {
    useAsTitle: 'name',
  },
  access: {
    read: () => true, // Publicly accessible on the frontend
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      unique: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      validate: (val: any) => {
        if (!val) return 'Slug is required.';
        if (typeof val !== 'string') return 'Slug must be a string.';
        
        // Only lowercase, numbers, and hyphens. No leading/trailing hyphens.
        const regex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
        if (!regex.test(val)) {
          return 'Slug must be lowercase, alphanumeric, and hyphen-separated (e.g., "my-slug-123"). No spaces, uppercase letters, or special characters allowed.';
        }
        return true;
      },
    },
    {
      name: 'sortOrder',
      type: 'number',
    },
  ],
};
