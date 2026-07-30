import React, { createContext, useEffect, useRef, useState } from "react";
import { AuthState, LoginPayload, RefreshStrategy } from "../types";
import { StorageAdapter } from "../storage/StorageAdapter";
import { createRefreshManager } from "../utils/refreshManager";

interface AuthContextValue extends AuthState {
  login(payload: LoginPayload): void;
  logout(): void;
  refreshAccessToken(): Promise<string>;
  verifyMfa(code: string): Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export interface AuthProviderProps {
  children: React.ReactNode;
  refreshEndpoint: string;
  refreshStrategy?: RefreshStrategy;
  storage?: StorageAdapter;
  fetcher?: typeof fetch;
  mfaEndpoint?: string;
}

export const AuthProvider = ({
  children,
  refreshEndpoint,
  refreshStrategy = "storage",
  storage,
  fetcher = fetch,
  mfaEndpoint,
}: AuthProviderProps) => {
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    accessToken: null,
    user: null,
    isMfaRequired: false,
    mfaToken: null,
  });

  const refreshTimer = useRef<number | undefined>(undefined);

  const scheduleRefresh = (expiresIn: number) => {
    window.clearTimeout(refreshTimer.current);
    refreshTimer.current = window.setTimeout(
      () => refreshAccessToken(),
      (expiresIn - 30) * 1000,
    );
  };

  const logout = () => {
    storage?.clear();
    window.clearTimeout(refreshTimer.current);

    setState({
      accessToken: null,
      user: null,
      isAuthenticated: false,
      isMfaRequired: false,
      mfaToken: null,
    });
  };

  const baseRefresh = async (): Promise<string> => {
    const response = await fetcher(refreshEndpoint, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      ...(refreshStrategy === "storage"
        ? {
            body: JSON.stringify({
              refreshToken: storage?.get(),
            }),
          }
        : {}),
    });

    if (!response.ok) {
      logout();
      throw new Error("Refresh failed");
    }

    const data = await response.json();

    setState((prev) => ({
      ...prev,
      accessToken: data.accessToken,
      isAuthenticated: true,
    }));

    scheduleRefresh(data.expiresIn);

    return data.accessToken;
  };

  const refreshAccessToken = createRefreshManager(baseRefresh);

  const login = (payload: LoginPayload) => {
    if ("mfaRequired" in payload && payload.mfaRequired) {
      setState({
        accessToken: null,
        user: null,
        isAuthenticated: false,
        isMfaRequired: true,
        mfaToken: payload.mfaToken,
      });
      return;
    }

    if ("refreshToken" in payload && storage) {
      storage.set(payload.refreshToken);
    }

    setState({
      accessToken: payload.accessToken,
      user: payload.user,
      isAuthenticated: true,
      isMfaRequired: false,
      mfaToken: null,
    });

    scheduleRefresh(payload.expiresIn);
  };

  const verifyMfa = async (code: string) => {
    if (!state.mfaToken || !mfaEndpoint) {
      throw new Error("MFA verification is not configured or no token found");
    }

    const response = await fetcher(mfaEndpoint, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mfaToken: state.mfaToken, code }),
    });

    if (!response.ok) {
      throw new Error("MFA verification failed");
    }

    const data = await response.json();
    login(data);
  };

  useEffect(() => {
    refreshAccessToken().catch(() => logout());
  }, []);

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        logout,
        refreshAccessToken,
        verifyMfa,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
