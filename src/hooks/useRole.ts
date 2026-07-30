import { useAuth } from "./useAuth";

export const useRole = (roleOrRoles: string | string[]) => {
  const { canAccess, isAuthenticated } = useAuth();
  
  if (!isAuthenticated) return false;

  const roles = Array.isArray(roleOrRoles) ? roleOrRoles : [roleOrRoles];
  return canAccess({ roles });
};
