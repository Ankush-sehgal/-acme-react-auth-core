import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

interface ProtectedRouteProps {
  children: React.ReactElement;
  roles?: string[];
  permissions?: string[];
  redirectTo?: string;
  forbiddenTo?: string;
}

export const ProtectedRoute = ({
  children,
  roles,
  permissions,
  redirectTo = "/login",
  forbiddenTo = "/403",
}: ProtectedRouteProps) => {
  const { isAuthenticated, canAccess } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  if (!canAccess({ roles, permissions })) {
    return <Navigate to={forbiddenTo} replace />;
  }

  return children;
};
