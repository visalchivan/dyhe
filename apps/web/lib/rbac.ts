// Role-Based Access Control (RBAC) utilities

export enum Role {
  SUPER_ADMIN = "SUPER_ADMIN",
  ADMIN = "ADMIN",
  USER = "USER",
  DRIVER = "DRIVER",
  MERCHANT = "MERCHANT",
}

export interface Permission {
  canView: boolean;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
}

// Define permissions for each role
export const rolePermissions: Record<string, Record<string, Permission>> = {
  // SUPER_ADMIN has full access to everything
  [Role.SUPER_ADMIN]: {
    dashboard: {
      canView: true,
      canCreate: true,
      canEdit: true,
      canDelete: true,
    },
    packages: {
      canView: true,
      canCreate: true,
      canEdit: true,
      canDelete: true,
    },
    merchants: {
      canView: true,
      canCreate: true,
      canEdit: true,
      canDelete: true,
    },
    drivers: { canView: true, canCreate: true, canEdit: true, canDelete: true },
    team: { canView: true, canCreate: true, canEdit: true, canDelete: true },
    reports: { canView: true, canCreate: true, canEdit: true, canDelete: true },
    settings: {
      canView: true,
      canCreate: true,
      canEdit: true,
      canDelete: true,
    },
  },

  // ADMIN has most access except team management
  [Role.ADMIN]: {
    dashboard: {
      canView: true,
      canCreate: true,
      canEdit: true,
      canDelete: true,
    },
    packages: {
      canView: true,
      canCreate: true,
      canEdit: true,
      canDelete: true,
    },
    merchants: {
      canView: true,
      canCreate: true,
      canEdit: true,
      canDelete: true,
    },
    drivers: { canView: true, canCreate: true, canEdit: true, canDelete: true },
    team: {
      canView: false,
      canCreate: false,
      canEdit: false,
      canDelete: false,
    },
    reports: {
      canView: true,
      canCreate: false,
      canEdit: false,
      canDelete: false,
    },
    settings: {
      canView: true,
      canCreate: false,
      canEdit: true,
      canDelete: false,
    },
  },

  // USER has limited access - can view and create packages only
  [Role.USER]: {
    dashboard: {
      canView: true,
      canCreate: false,
      canEdit: false,
      canDelete: false,
    },
    packages: {
      canView: true,
      canCreate: true,
      canEdit: true,
      canDelete: false,
    },
    merchants: {
      canView: true,
      canCreate: false,
      canEdit: false,
      canDelete: false,
    },
    drivers: {
      canView: true,
      canCreate: false,
      canEdit: false,
      canDelete: false,
    },
    team: {
      canView: false,
      canCreate: false,
      canEdit: false,
      canDelete: false,
    },
    reports: {
      canView: false,
      canCreate: false,
      canEdit: false,
      canDelete: false,
    },
    settings: {
      canView: false,
      canCreate: false,
      canEdit: false,
      canDelete: false,
    },
  },

  // DRIVER has access to their own packages
  [Role.DRIVER]: {
    dashboard: {
      canView: true,
      canCreate: false,
      canEdit: false,
      canDelete: false,
    },
    packages: {
      canView: true,
      canCreate: false,
      canEdit: true,
      canDelete: false,
    },
    merchants: {
      canView: false,
      canCreate: false,
      canEdit: false,
      canDelete: false,
    },
    drivers: {
      canView: false,
      canCreate: false,
      canEdit: false,
      canDelete: false,
    },
    team: {
      canView: false,
      canCreate: false,
      canEdit: false,
      canDelete: false,
    },
    reports: {
      canView: false,
      canCreate: false,
      canEdit: false,
      canDelete: false,
    },
    settings: {
      canView: false,
      canCreate: false,
      canEdit: false,
      canDelete: false,
    },
  },

  // MERCHANT has access to their own packages
  [Role.MERCHANT]: {
    dashboard: {
      canView: true,
      canCreate: false,
      canEdit: false,
      canDelete: false,
    },
    packages: {
      canView: true,
      canCreate: true,
      canEdit: false,
      canDelete: false,
    },
    merchants: {
      canView: false,
      canCreate: false,
      canEdit: false,
      canDelete: false,
    },
    drivers: {
      canView: false,
      canCreate: false,
      canEdit: false,
      canDelete: false,
    },
    team: {
      canView: false,
      canCreate: false,
      canEdit: false,
      canDelete: false,
    },
    reports: {
      canView: false,
      canCreate: false,
      canEdit: false,
      canDelete: false,
    },
    settings: {
      canView: false,
      canCreate: false,
      canEdit: false,
      canDelete: false,
    },
  },
};

// Check if user has permission for a specific resource and action
export function hasPermission(
  userRole: string | undefined,
  resource: string,
  action: keyof Permission
): boolean {
  if (!userRole) return false;

  const permissions = rolePermissions[userRole]?.[resource];
  if (!permissions) return false;

  return permissions[action];
}

// Check if user can view a resource
export function canView(
  userRole: string | undefined,
  resource: string
): boolean {
  return hasPermission(userRole, resource, "canView");
}

// Check if user can create a resource
export function canCreate(
  userRole: string | undefined,
  resource: string
): boolean {
  return hasPermission(userRole, resource, "canCreate");
}

// Check if user can edit a resource
export function canEdit(
  userRole: string | undefined,
  resource: string
): boolean {
  return hasPermission(userRole, resource, "canEdit");
}

// Check if user can delete a resource
export function canDelete(
  userRole: string | undefined,
  resource: string
): boolean {
  return hasPermission(userRole, resource, "canDelete");
}

// Check if user is admin or super admin
export function isAdmin(userRole: string | undefined): boolean {
  return userRole === Role.SUPER_ADMIN || userRole === Role.ADMIN;
}

// Check if user is super admin
export function isSuperAdmin(userRole: string | undefined): boolean {
  return userRole === Role.SUPER_ADMIN;
}
