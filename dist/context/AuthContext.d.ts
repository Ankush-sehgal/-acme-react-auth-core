import React from "react";
import { AuthState, LoginPayload, RefreshStrategy } from "../types";
import { StorageAdapter } from "../storage/StorageAdapter";
interface AuthContextValue extends AuthState {
    login(payload: LoginPayload): void;
    logout(): void;
    refreshAccessToken(): Promise<string>;
    verifyMfa(code: string): Promise<void>;
}
export declare const AuthContext: React.Context<AuthContextValue | null>;
export interface AuthProviderProps {
    children: React.ReactNode;
    refreshEndpoint: string;
    refreshStrategy?: RefreshStrategy;
    storage?: StorageAdapter;
    fetcher?: typeof fetch;
    mfaEndpoint?: string;
}
export declare const AuthProvider: ({ children, refreshEndpoint, refreshStrategy, storage, fetcher, mfaEndpoint, }: AuthProviderProps) => React.JSX.Element;
export {};
