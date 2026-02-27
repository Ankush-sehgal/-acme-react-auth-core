import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { hasRole, hasPermission } from "../utils/rbac";

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  const canAccess = ({
    roles,
    permissions,
  }: {
    roles?: string[];
    permissions?: string[];
  }): boolean => {
    if (!ctx.user) return false;
    if (roles && !hasRole(ctx.user.roles ?? [], roles)) return false;
    if (permissions && !hasPermission(ctx.user.permissions ?? [], permissions))
      return false;
    return true;
  };

  return {
    ...ctx,
    canAccess,
  };
};
