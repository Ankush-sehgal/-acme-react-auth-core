import React, { ComponentType } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export interface WithAuthProps {
  redirectTo?: string;
}

export const withAuth = <P extends object>(
  WrappedComponent: ComponentType<P>,
  options?: WithAuthProps
) => {
  const WithAuth = (props: P) => {
    const { isAuthenticated } = useAuth();
    const redirectTo = options?.redirectTo || "/login";

    if (!isAuthenticated) {
      return <Navigate to={redirectTo} replace />;
    }

    return <WrappedComponent {...props} />;
  };

  WithAuth.displayName = `withAuth(${WrappedComponent.displayName || WrappedComponent.name || "Component"})`;

  return WithAuth;
};
