import { Role } from '../enums/role.enum';

export type Permission =
  // Account
  | 'CREATE_ACCOUNT'
  | 'EDIT_ACCOUNT'
  | 'VIEW_ACCOUNT'
  | 'CHANGE_PASSWORD'

  // Employees Management
  | 'CREATE_EMPLOYEE'
  | 'EDIT_EMPLOYEE'
  | 'VIEW_EMPLOYEE'
  | 'DELETE_EMPLOYEE'

  // Leave Management
  | 'APPLY_LEAVE'
  | 'APPROVE_LEAVE'
  | 'REJECT_LEAVE'
  | 'VIEW_LEAVE'

  // Attendance Management
  | 'CHECK_IN'
  | 'CHECK_OUT'
  | 'VIEW_ATTENDANCE'
  | 'MANAGE_ATTENDANCE'

  // Branch Management (For Admin)
  | 'CREATE_BRANCH'
  | 'EDIT_BRANCH'
  | 'VIEW_BRANCH'

  // Settings
  | 'MANAGE_SETTINGS'
  | 'VIEW_SETTINGS'

  // Notifications
  | 'MANAGE_NOTIFICATIONS'
  | 'VIEW_NOTIFICATIONS'

  // Billing
  | 'MANAGE_BILLING'
  | 'VIEW_BILLING';

/**
 * Role to Permission Mapping
 */
export const RolePermissions: Record<Role, Permission[]> = {
  [Role.PENDING]: ['CREATE_ACCOUNT'],

  [Role.EMPLOYEE]: [
    'VIEW_ACCOUNT',
    'CHANGE_PASSWORD',

    'APPLY_LEAVE',
    'VIEW_LEAVE',

    'CHECK_IN',
    'CHECK_OUT',
    'VIEW_ATTENDANCE',

    'VIEW_SETTINGS',
    'VIEW_NOTIFICATIONS',
  ],

  [Role.HR_USER]: [
    'EDIT_ACCOUNT',
    'VIEW_ACCOUNT',
    'CHANGE_PASSWORD',

    'CREATE_EMPLOYEE',
    'EDIT_EMPLOYEE',
    'VIEW_EMPLOYEE',

    'APPROVE_LEAVE',
    'REJECT_LEAVE',
    'VIEW_LEAVE',

    'VIEW_ATTENDANCE',
    'MANAGE_ATTENDANCE',

    'MANAGE_SETTINGS',
    'VIEW_SETTINGS',

    'MANAGE_NOTIFICATIONS',
    'VIEW_NOTIFICATIONS',

    'VIEW_BILLING',
  ],

  [Role.ADMIN]: [
    'CREATE_ACCOUNT',
    'EDIT_ACCOUNT',
    'VIEW_ACCOUNT',
    'CHANGE_PASSWORD',

    'CREATE_EMPLOYEE',
    'EDIT_EMPLOYEE',
    'VIEW_EMPLOYEE',
    'DELETE_EMPLOYEE',

    'APPLY_LEAVE',
    'APPROVE_LEAVE',
    'REJECT_LEAVE',
    'VIEW_LEAVE',

    'VIEW_ATTENDANCE',
    'MANAGE_ATTENDANCE',

    'CREATE_BRANCH',
    'EDIT_BRANCH',
    'VIEW_BRANCH',

    'MANAGE_SETTINGS',
    'VIEW_SETTINGS',

    'MANAGE_NOTIFICATIONS',
    'VIEW_NOTIFICATIONS',

    'MANAGE_BILLING',
    'VIEW_BILLING',
  ],
};

/**
 * Get permissions for specific role
 */
export const getPermissionsForRole = (role: Role): Permission[] => {
  return RolePermissions[role] ?? [];
};
