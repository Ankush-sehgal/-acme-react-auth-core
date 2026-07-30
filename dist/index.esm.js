import React, { createContext, useState, useRef, useEffect, useContext } from 'react';
import { Navigate } from 'react-router-dom';

let refreshing = false;
let refreshPromise = null;
const createRefreshManager = (refreshFn) => {
    return async () => {
        if (!refreshing) {
            refreshing = true;
            refreshPromise = refreshFn().finally(() => {
                refreshing = false;
            });
        }
        return refreshPromise;
    };
};

const AuthContext = createContext(null);
const AuthProvider = ({ children, refreshEndpoint, refreshStrategy = "storage", storage, fetcher = fetch, mfaEndpoint, }) => {
    const [state, setState] = useState({
        isAuthenticated: false,
        accessToken: null,
        user: null,
        isMfaRequired: false,
        mfaToken: null,
    });
    const refreshTimer = useRef(undefined);
    const scheduleRefresh = (expiresIn) => {
        window.clearTimeout(refreshTimer.current);
        refreshTimer.current = window.setTimeout(() => refreshAccessToken(), (expiresIn - 30) * 1000);
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
    const baseRefresh = async () => {
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
    const login = (payload) => {
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
    const verifyMfa = async (code) => {
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
    return (React.createElement(AuthContext.Provider, { value: {
            ...state,
            login,
            logout,
            refreshAccessToken,
            verifyMfa,
        } }, children));
};

const hasRole = (userRoles = [], required = []) => required.some((r) => userRoles.includes(r));
const hasPermission = (userPermissions = [], required = []) => required.every((p) => userPermissions.includes(p));

const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) {
        throw new Error("useAuth must be used within AuthProvider");
    }
    const canAccess = ({ roles, permissions, }) => {
        if (!ctx.user)
            return false;
        if (roles && !hasRole(ctx.user.roles ?? [], roles))
            return false;
        if (permissions && !hasPermission(ctx.user.permissions ?? [], permissions))
            return false;
        return true;
    };
    return {
        ...ctx,
        canAccess,
    };
};

const ProtectedRoute = ({ children, roles, permissions, redirectTo = "/login", forbiddenTo = "/403", }) => {
    const { isAuthenticated, canAccess } = useAuth();
    if (!isAuthenticated) {
        return React.createElement(Navigate, { to: redirectTo, replace: true });
    }
    if (!canAccess({ roles, permissions })) {
        return React.createElement(Navigate, { to: forbiddenTo, replace: true });
    }
    return children;
};

const Can = ({ roles, permissions, fallback = null, children, }) => {
    const { canAccess } = useAuth();
    return canAccess({ roles, permissions }) ? React.createElement(React.Fragment, null, children) : React.createElement(React.Fragment, null, fallback);
};

const localStorageAdapter = (key = "refresh_token") => ({
    get: () => localStorage.getItem(key),
    set: (value) => localStorage.setItem(key, value),
    clear: () => localStorage.removeItem(key),
});

const useRole = (roleOrRoles) => {
    const { canAccess, isAuthenticated } = useAuth();
    if (!isAuthenticated)
        return false;
    const roles = Array.isArray(roleOrRoles) ? roleOrRoles : [roleOrRoles];
    return canAccess({ roles });
};

const usePermissions = (permissionOrPermissions) => {
    const { canAccess, isAuthenticated } = useAuth();
    if (!isAuthenticated)
        return false;
    const permissions = Array.isArray(permissionOrPermissions)
        ? permissionOrPermissions
        : [permissionOrPermissions];
    return canAccess({ permissions });
};

const withAuth = (WrappedComponent, options) => {
    const WithAuth = (props) => {
        const { isAuthenticated } = useAuth();
        const redirectTo = options?.redirectTo || "/login";
        if (!isAuthenticated) {
            return React.createElement(Navigate, { to: redirectTo, replace: true });
        }
        return React.createElement(WrappedComponent, { ...props });
    };
    WithAuth.displayName = `withAuth(${WrappedComponent.displayName || WrappedComponent.name || "Component"})`;
    return WithAuth;
};

const withRole = (WrappedComponent, options) => {
    const WithRole = (props) => {
        const { isAuthenticated, canAccess } = useAuth();
        const redirectTo = options.redirectTo || "/403";
        const loginPath = options.loginPath || "/login";
        if (!isAuthenticated) {
            return React.createElement(Navigate, { to: loginPath, replace: true });
        }
        if (!canAccess({ roles: options.roles })) {
            return React.createElement(Navigate, { to: redirectTo, replace: true });
        }
        return React.createElement(WrappedComponent, { ...props });
    };
    WithRole.displayName = `withRole(${WrappedComponent.displayName || WrappedComponent.name || "Component"})`;
    return WithRole;
};

export { AuthProvider, Can, ProtectedRoute, localStorageAdapter, useAuth, usePermissions, useRole, withAuth, withRole };
//# sourceMappingURL=index.esm.js.map
