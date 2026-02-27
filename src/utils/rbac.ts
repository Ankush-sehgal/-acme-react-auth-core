export const hasRole = (
  userRoles: string[] = [],
  required: string[] = [],
): boolean => required.some((r) => userRoles.includes(r));

export const hasPermission = (
  userPermissions: string[] = [],
  required: string[] = [],
): boolean => required.every((p) => userPermissions.includes(p));
