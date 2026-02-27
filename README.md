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
✅ TypeScript-first  
✅ npm-publish ready

## Installation

```bash
npm install @acme/react-auth-core
```

## Peer Dependencies

```bash
npm install react react-router-dom
```

## Usage

### Cookie-Based (Secure)

```tsx
import { AuthProvider } from "@acme/react-auth-core";

<AuthProvider refreshEndpoint="/auth/refresh" refreshStrategy="cookie">
  <App />
</AuthProvider>;
```

### Storage-Based (Fallback)

```tsx
import { AuthProvider, localStorageAdapter } from "@acme/react-auth-core";

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

### useAuth Hook

```tsx
const {
  isAuthenticated,
  accessToken,
  user,
  login,
  logout,
  refreshAccessToken,
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
import { ProtectedRoute } from "@acme/react-auth-core";

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
import { Can } from "@acme/react-auth-core";

<Can roles={["admin"]} permissions={["write:data"]} fallback={<AccessDenied />}>
  <DeleteButton />
</Can>;
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
// With refresh token (storage strategy)
type LoginPayload = {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: User;
};

// Without refresh token (cookie strategy)
type LoginPayload = {
  accessToken: string;
  expiresIn: number;
  user: User;
};
```

## License

MIT
