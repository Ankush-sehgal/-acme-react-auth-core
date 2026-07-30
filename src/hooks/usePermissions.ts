import { useAuth } from "./useAuth";

export const usePermissions = (permissionOrPermissions: string | string[]) => {
  const { canAccess, isAuthenticated } = useAuth();
  
  if (!isAuthenticated) return false;

  const permissions = Array.isArray(permissionOrPermissions) 
    ? permissionOrPermissions 
    : [permissionOrPermissions];
    
  return canAccess({ permissions });
};
