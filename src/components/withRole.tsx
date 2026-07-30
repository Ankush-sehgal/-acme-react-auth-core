import React, { ComponentType } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export interface WithRoleProps {
  roles: string[];
  redirectTo?: string;
  loginPath?: string;
}

export const withRole = <P extends object>(
  WrappedComponent: ComponentType<P>,
  options: WithRoleProps
) => {
  const WithRole = (props: P) => {
    const { isAuthenticated, canAccess } = useAuth();
    const redirectTo = options.redirectTo || "/403";
    const loginPath = options.loginPath || "/login";

    if (!isAuthenticated) {
      return <Navigate to={loginPath} replace />;
    }

    if (!canAccess({ roles: options.roles })) {
      return <Navigate to={redirectTo} replace />;
    }

    return <WrappedComponent {...props} />;
  };

  WithRole.displayName = `withRole(${WrappedComponent.displayName || WrappedComponent.name || "Component"})`;

  return WithRole;
};
