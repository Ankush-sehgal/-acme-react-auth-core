import React from "react";
interface CanProps {
    roles?: string[];
    permissions?: string[];
    fallback?: React.ReactNode;
    children: React.ReactNode;
}
export declare const Can: ({ roles, permissions, fallback, children, }: CanProps) => React.JSX.Element;
export {};
