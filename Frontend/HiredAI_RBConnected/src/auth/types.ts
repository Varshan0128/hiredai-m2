export interface AuthUser {
  id?: number;
  email: string;
  userName?: string;
  firstName?: string;
  lastName?: string;
  mobile?: string;
  avatarUrl?: string;
}

export type AuthStatus = "loading" | "authenticated" | "unauthenticated";
