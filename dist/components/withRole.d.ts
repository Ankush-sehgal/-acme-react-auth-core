import React, { ComponentType } from "react";
export interface WithRoleProps {
    roles: string[];
    redirectTo?: string;
    loginPath?: string;
}
export declare const withRole: <P extends object>(WrappedComponent: ComponentType<P>, options: WithRoleProps) => {
    (props: P): React.JSX.Element;
    displayName: string;
};
