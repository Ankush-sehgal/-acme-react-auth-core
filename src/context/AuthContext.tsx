import React, { createContext, useEffect, useRef, useState } from "react";
import { AuthState, LoginPayload, RefreshStrategy } from "../types";
import { StorageAdapter } from "../storage/StorageAdapter";
import { createRefreshManager } from "../utils/refreshManager";

interface AuthContextValue extends AuthState {
  login(payload: LoginPayload): void;
  logout(): void;
  refreshAccessToken(): Promise<string>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export interface AuthProviderProps {
  children: React.ReactNode;
  refreshEndpoint: string;
  refreshStrategy?: RefreshStrategy;
  storage?: StorageAdapter;
  fetcher?: typeof fetch;
}

export const AuthProvider = ({
  children,
  refreshEndpoint,
  refreshStrategy = "storage",
  storage,
  fetcher = fetch,
}: AuthProviderProps) => {
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    accessToken: null,
    user: null,
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
    if ("refreshToken" in payload && storage) {
      storage.set(payload.refreshToken);
    }

    setState({
      accessToken: payload.accessToken,
      user: payload.user,
      isAuthenticated: true,
    });

    scheduleRefresh(payload.expiresIn);
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
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
