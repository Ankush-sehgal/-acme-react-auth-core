import React from "react";
import { useAuth } from "../hooks/useAuth";

interface CanProps {
  roles?: string[];
  permissions?: string[];
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export const Can = ({
  roles,
  permissions,
  fallback = null,
  children,
}: CanProps) => {
  const { canAccess } = useAuth();
  return canAccess({ roles, permissions }) ? <>{children}</> : <>{fallback}</>;
};
