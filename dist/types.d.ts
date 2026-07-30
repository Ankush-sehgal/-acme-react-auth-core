export interface User {
    id: string;
    roles?: string[];
    permissions?: string[];
}
export type RefreshStrategy = "cookie" | "storage";
export type LoginPayload = {
    mfaRequired?: false;
    accessToken: string;
    expiresIn: number;
    user: User;
} | {
    mfaRequired?: false;
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    user: User;
} | {
    mfaRequired: true;
    mfaToken: string;
};
export interface AuthState {
    isAuthenticated: boolean;
    accessToken: string | null;
    user: User | null;
    isMfaRequired: boolean;
    mfaToken: string | null;
}
