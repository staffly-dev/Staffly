import { Role } from '../enums/role.enum';

export type Permission =
  | 'CREATE_ACCOUNT'
  | 'EDIT_ACCOUNT'
  | 'VIEW_ACCOUNT'
  | 'CHANGE_PASSWORD'
  | 'MANAGE_SETTINGS'
  | 'VIEW_SETTINGS'
  | 'MANAGE_NOTIFICATIONS'
  | 'VIEW_NOTIFICATIONS'
  | 'MANAGE_BILLING'
  | 'VIEW_BILLING';

export const RolePermissions: Record<Role, Permission[]> = {
  [Role.PENDING]: ['CREATE_ACCOUNT'],

  [Role.HR_USER]: [
    'EDIT_ACCOUNT',
    'VIEW_ACCOUNT',
    'CHANGE_PASSWORD',
    'MANAGE_SETTINGS',
    'VIEW_SETTINGS',
    'MANAGE_NOTIFICATIONS',
    'VIEW_NOTIFICATIONS',
    'MANAGE_BILLING',
    'VIEW_BILLING',
  ],
};

export const getPermissionsForRole = (role: Role): Permission[] => {
  return RolePermissions[role] ?? [];
};
