import type { Access, FieldAccess } from 'payload';

export const isAdmin: Access = ({ req: { user } }) => {
  return Boolean(user && user.role === 'admin');
};

export const isAdminFieldLevel: FieldAccess = ({ req: { user } }) => {
  return Boolean(user && user.role === 'admin');
};
