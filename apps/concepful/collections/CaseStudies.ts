import type { CollectionConfig, Validate, CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload';
import { validations } from 'payload/shared';
import { revalidatePath } from 'next/cache';

const revalidateCaseStudy: CollectionAfterChangeHook = ({ doc, previousDoc }) => {
  try {
    revalidatePath('/work');
    if (doc?.slug) {
      revalidatePath(`/work/${doc.slug}`);
    }
    if (previousDoc?.slug && previousDoc.slug !== doc.slug) {
      revalidatePath(`/work/${previousDoc.slug}`);
    }
  } catch (err) {
    // In background workers or isolated contexts without Next.js cache context
    console.error('Failed to revalidate cache:', err);
  }
  return doc;
};

const revalidateDeleteCaseStudy: CollectionAfterDeleteHook = ({ doc }) => {
  try {
    revalidatePath('/work');
    if (doc?.slug) {
      revalidatePath(`/work/${doc.slug}`);
    }
  } catch (err) {
    console.error('Failed to revalidate cache on delete:', err);
  }
  return doc;
};

const arrayHasItems: Validate = (val, { siblingData }) => {
  if (siblingData?._status === 'published') {
    if (!val || !Array.isArray(val) || val.length === 0) {
      return 'This field must have at least one item to publish.';
    }
  }
  return true;
};

const THEME_OPTIONS = [
  { label: 'Rose', value: 'rose' },
];

const VALID_THEMES = THEME_OPTIONS.map(o => o.value);

const requiredTextToPublish: Validate = (val, options) => {
  if (options.siblingData?._status === 'published') {
    if (val === undefined || val === null || val === '') {
      return 'This field is required to publish.';
    }
  }
  if (val !== undefined && val !== null && val !== '') {
    return validations.text(val, options as any);
  }
  return true;
};

const createRelationshipValidator = (relationTo: any, hasMany: boolean = false): Validate => {
  return async (val, options) => {
    if (options.siblingData?._status === 'published') {
      if (val === undefined || val === null || val === '') {
        return 'This field is required to publish.';
      }
    }
    if (val !== undefined && val !== null && val !== '') {
      const builtIn = await validations.relationship(val, { ...options, relationTo, hasMany } as any);
      if (builtIn !== true) return builtIn;

      try {
        const idsToCheck = Array.isArray(val) ? val : [val];
        for (const item of idsToCheck) {
          const idToCheck = typeof item === 'object' ? item.value || item.id : item;
          if (idToCheck) {
            const exists = await options.req.payload.find({
              collection: relationTo,
              where: { id: { equals: idToCheck } },
              depth: 0,
              limit: 1,
              overrideAccess: true,
            });
            if (exists.totalDocs === 0) {
              return `Referenced ${relationTo} document does not exist.`;
            }
          }
        }
      } catch (err) {
        return `Failed to verify ${relationTo} existence.`;
      }
    }
    return true;
  };
};

const createUploadValidator = (relationTo: any): Validate => {
  return async (val, options) => {
    if (options.siblingData?._status === 'published') {
      if (val === undefined || val === null || val === '') {
        return 'This field is required to publish.';
      }
    }
    if (val !== undefined && val !== null && val !== '') {
      const builtIn = await validations.upload(val, { ...options, relationTo } as any);
      if (builtIn !== true) return builtIn;

      try {
        const idsToCheck = Array.isArray(val) ? val : [val];
        for (const item of idsToCheck) {
          const idToCheck = typeof item === 'object' ? item.value || item.id : item;
          if (idToCheck) {
            const exists = await options.req.payload.find({
              collection: relationTo,
              where: { id: { equals: idToCheck } },
              depth: 0,
              limit: 1,
              overrideAccess: true,
            });
            if (exists.totalDocs === 0) {
              return `Referenced ${relationTo} document does not exist.`;
            }
          }
        }
      } catch (err) {
        return `Failed to verify ${relationTo} existence.`;
      }
    }
    return true;
  };
};

const validateTheme: Validate = (val, options) => {
  if (options.siblingData?._status === 'published') {
    if (val === undefined || val === null || val === '') {
      return 'This field is required to publish.';
    }
  }
  
  if (val !== undefined && val !== null && val !== '') {
    if (!VALID_THEMES.includes(val)) {
      return 'Please select a valid theme.';
    }
  }
  
  return true;
};

export const CaseStudies: CollectionConfig = {
  slug: 'case-studies',
  admin: {
    useAsTitle: 'title',
  },
  hooks: {
    afterChange: [revalidateCaseStudy],
    afterDelete: [revalidateDeleteCaseStudy],
  },
  versions: {
    drafts: true,
  },
  fields: [
    {
      name: 'slug',
      type: 'text',
      unique: true,
      validate: requiredTextToPublish,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'title',
      type: 'text',
      validate: requiredTextToPublish,
    },
    {
      name: 'client',
      type: 'text',
      validate: requiredTextToPublish,
    },
    {
      name: 'category',
      type: 'relationship',
      relationTo: 'categories',
      hasMany: false,
      validate: createRelationshipValidator('categories', false),
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'teaser',
      type: 'textarea',
      validate: requiredTextToPublish,
    },
    {
      name: 'coverImage',
      type: 'upload',
      relationTo: 'media',
      validate: createUploadValidator('media'),
    },
    {
      name: 'theme',
      type: 'select',
      options: THEME_OPTIONS,
      validate: validateTheme,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'brief',
      type: 'textarea',
      validate: requiredTextToPublish,
    },
    {
      name: 'challenges',
      type: 'array',
      validate: arrayHasItems,
      fields: [
        {
          name: 'text',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      name: 'deliverables',
      type: 'array',
      validate: arrayHasItems,
      fields: [
        {
          name: 'text',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      name: 'tools',
      type: 'array',
      validate: arrayHasItems,
      fields: [
        {
          name: 'text',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      name: 'outcome',
      type: 'textarea',
      validate: requiredTextToPublish,
    },
    {
      name: 'outcomeMetrics',
      type: 'array',
      validate: arrayHasItems,
      fields: [
        {
          name: 'label',
          type: 'text',
          required: true,
        },
        {
          name: 'value',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      name: 'featured',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'ctaText',
      label: 'CTA Text',
      type: 'text',
      admin: {
        description: 'Dynamic highlight text displayed in the Work page hero ("We build [CTA Text] for our clients.") when this case study is featured.',
        condition: (data) => Boolean(data?.featured),
      },
    },
    {
      name: 'sortOrder',
      type: 'number',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'relatedCaseStudy',
      type: 'relationship',
      relationTo: 'case-studies',
      hasMany: false,
      admin: {
        position: 'sidebar',
      },
      filterOptions: ({ id }) => {
        if (id) {
          return {
            id: { not_equals: id },
          };
        }
        return true;
      },
    },
    {
      name: 'tags',
      type: 'array',
      fields: [
        {
          name: 'text',
          type: 'text',
          required: true,
        },
      ],
    },
  ],
};
