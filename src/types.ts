export interface User {
  id: string;
  roles?: string[];
  permissions?: string[];
}

export type RefreshStrategy = "cookie" | "storage";

export type LoginPayload =
  | {
      accessToken: string;
      expiresIn: number;
      user: User;
    }
  | {
      accessToken: string;
      refreshToken: string;
      expiresIn: number;
      user: User;
    };

export interface AuthState {
  isAuthenticated: boolean;
  accessToken: string | null;
  user: User | null;
}
