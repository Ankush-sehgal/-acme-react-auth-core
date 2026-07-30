import React from "react";
interface ProtectedRouteProps {
    children: React.ReactElement;
    roles?: string[];
    permissions?: string[];
    redirectTo?: string;
    forbiddenTo?: string;
}
export declare const ProtectedRoute: ({ children, roles, permissions, redirectTo, forbiddenTo, }: ProtectedRouteProps) => React.JSX.Element;
export {};
