import type { CollectionConfig } from 'payload';
import { isAdmin, isAdminFieldLevel, isAdminOrSelf, isAdminOrEditor } from '../access';

/**
 * Users Collection (Payload Admin Authentication & Roles)
 * 
 * Roles:
 * - admin: Full administrative access, user management, and content management.
 * - editor: Can create, edit, publish, and delete individual content documents (CaseStudies, Categories, Media),
 *           but CANNOT access or manage other users, and CANNOT change user roles.
 * 
 * NOTE ON MIGRATION / BOOTSTRAP:
 * When adding the `role` field to an existing Payload instance with pre-existing users (e.g., initial superuser
 * created before Phase 6), those accounts must be explicitly backfilled to role = 'admin' via database update:
 *   UPDATE payload.users SET role = 'admin' WHERE email = '<superuser_email>';
 * If left unset, missing values will default to 'editor', locking out the superuser from user management.
 */
export const Users: CollectionConfig = {
  slug: 'users',
  auth: true,
  admin: {
    useAsTitle: 'email',
    hidden: ({ user }) => user?.role !== 'admin',
    defaultColumns: ['email', 'role', 'createdAt'],
  },
  access: {
    // Only admins can create new users
    create: isAdmin,
    // Admins can read all users; non-admins (editors) can only read their own record
    read: isAdminOrSelf,
    // Admins can update any user; non-admins (editors) can only update their own record
    update: isAdminOrSelf,
    // Only admins can delete users
    delete: isAdmin,
    // Allow both admins and editors to log in to the Payload admin panel
    admin: isAdminOrEditor,
  },
  fields: [
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'editor',
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'Editor', value: 'editor' },
      ],
      access: {
        // Only admins can mutate the role field (prevents self-escalation by editors)
        create: isAdminFieldLevel,
        update: isAdminFieldLevel,
      },
      admin: {
        position: 'sidebar',
        description: 'Admin users have full access including user management. Editors can manage content only.',
      },
    },
  ],
};
