import React, { ComponentType } from "react";
export interface WithAuthProps {
    redirectTo?: string;
}
export declare const withAuth: <P extends object>(WrappedComponent: ComponentType<P>, options?: WithAuthProps) => {
    (props: P): React.JSX.Element;
    displayName: string;
};
