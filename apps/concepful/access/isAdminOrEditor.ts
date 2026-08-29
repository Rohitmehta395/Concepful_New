import type { PayloadRequest } from 'payload';

export const isAdminOrEditor = ({ req: { user } }: { req: PayloadRequest }): boolean => {
  return Boolean(user && (user.role === 'admin' || user.role === 'editor'));
};
