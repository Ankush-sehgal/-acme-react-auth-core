# react-auth-core

A production-ready React authentication library with enterprise-grade features.

## Features

✅ Access + refresh tokens  
✅ Optional cookie-based secure architecture  
✅ Storage-based fallback  
✅ Auto refresh + refresh locking  
✅ RBAC (roles & permissions)  
✅ Protected routes  
✅ UI-level access control  
✅ Multi-Factor Authentication (MFA)
✅ Dedicated permission hooks (`useRole`, `usePermissions`)
✅ Route guard Higher-Order Components (withAuth, withRole)
✅ TypeScript-first  
✅ npm-publish ready

## Installation

```bash
npm install @ankushsehgal909/react-auth-core
```

## Peer Dependencies

```bash
npm install react react-router-dom
```

## Usage

### Cookie-Based (Secure)

```tsx
import { AuthProvider } from "@ankushsehgal909/react-auth-core";

<AuthProvider refreshEndpoint="/auth/refresh" refreshStrategy="cookie">
  <App />
</AuthProvider>;
```

### Storage-Based (Fallback)

```tsx
import { AuthProvider, localStorageAdapter } from "@ankushsehgal909/react-auth-core";

<AuthProvider
  refreshEndpoint="/auth/refresh"
  refreshStrategy="storage"
  storage={localStorageAdapter()}
>
  <App />
</AuthProvider>;
```

## API

### AuthProvider

| Prop              | Type                    | Required | Description                      |
| ----------------- | ----------------------- | -------- | -------------------------------- |
| `refreshEndpoint` | `string`                | Yes      | Endpoint to refresh access token |
| `refreshStrategy` | `"cookie" \| "storage"` | No       | Default: `"storage"`             |
| `storage`         | `StorageAdapter`        | No       | Custom storage adapter           |
| `fetcher`         | `typeof fetch`          | No       | Custom fetch function            |
| `mfaEndpoint`     | `string`                | No       | Endpoint to verify MFA token     |

### useAuth Hook

```tsx
const {
  isAuthenticated,
  isMfaRequired,
  mfaToken,
  accessToken,
  user,
  login,
  logout,
  refreshAccessToken,
  verifyMfa,
  canAccess,
} = useAuth();
```

### canAccess

```tsx
const canAccess = useAuth().canAccess({
  roles: ["admin"],
  permissions: ["read:data", "write:data"],
});
```

### ProtectedRoute

```tsx
import { ProtectedRoute } from "@ankushsehgal909/react-auth-core";

<ProtectedRoute
  roles={["admin"]}
  permissions={["read:data"]}
  redirectTo="/login"
  forbiddenTo="/403"
>
  <Dashboard />
</ProtectedRoute>;
```

### Can Component

```tsx
import { Can } from "@ankushsehgal909/react-auth-core";

<Can roles={["admin"]} permissions={["write:data"]} fallback={<AccessDenied />}>
  <DeleteButton />
</Can>;
```

### useRole & usePermissions Hooks

```tsx
import { useRole, usePermissions } from "@ankushsehgal909/react-auth-core";

const isAdmin = useRole("admin");
const canWrite = usePermissions("write:data");
```

### Higher-Order Components (HOCs)

```tsx
import { withAuth, withRole } from "@ankushsehgal909/react-auth-core";

const ProtectedDashboard = withAuth(Dashboard, { redirectTo: "/login" });
const AdminPanel = withRole(Panel, { roles: ["admin"], redirectTo: "/403" });
```

### Multi-Factor Authentication (MFA)

If your login endpoint returns an MFA challenge (`{ mfaRequired: true, mfaToken: "..." }`), the context enters an intermediate state where `isMfaRequired` is `true`.

```tsx
const { isMfaRequired, verifyMfa } = useAuth();

// ... inside your component
if (isMfaRequired) {
  return (
    <button onClick={() => verifyMfa("123456")}>
      Submit MFA Code
    </button>
  );
}
```

## Types

### User

```ts
interface User {
  id: string;
  roles?: string[];
  permissions?: string[];
}
```

### LoginPayload

```ts
// With MFA Challenge
type LoginPayload = {
  mfaRequired: true;
  mfaToken: string;
};

// With refresh token (storage strategy)
type LoginPayload = {
  mfaRequired?: false;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: User;
};

// Without refresh token (cookie strategy)
type LoginPayload = {
  mfaRequired?: false;
  accessToken: string;
  expiresIn: number;
  user: User;
};
```

## License

MIT
