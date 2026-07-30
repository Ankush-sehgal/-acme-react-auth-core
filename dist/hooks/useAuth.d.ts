export declare const useAuth: () => {
    canAccess: ({ roles, permissions, }: {
        roles?: string[];
        permissions?: string[];
    }) => boolean;
    login(payload: import("..").LoginPayload): void;
    logout(): void;
    refreshAccessToken(): Promise<string>;
    verifyMfa(code: string): Promise<void>;
    isAuthenticated: boolean;
    accessToken: string | null;
    user: import("..").User | null;
    isMfaRequired: boolean;
    mfaToken: string | null;
};
