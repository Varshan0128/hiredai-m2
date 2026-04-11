import type { AuthUser } from "./types";

const API_BASE = (import.meta.env.VITE_HEIREDAI_API_URL || "http://localhost:8080").replace(/\/$/, "");
const DEV_AUTH_STORAGE_KEY = "hired-ai.dev-auth-user";
const HAS_EXPLICIT_AUTH_API_URL = Boolean(import.meta.env.VITE_HEIREDAI_API_URL);

function isLocalDevAuthFallbackEnabled() {
  return import.meta.env.DEV && window.location.hostname === "localhost";
}

function readStoredDevAuthUser(): AuthUser | null {
  if (!isLocalDevAuthFallbackEnabled()) return null;

  try {
    const raw = window.localStorage.getItem(DEV_AUTH_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

function writeStoredDevAuthUser(user: AuthUser | null) {
  if (!isLocalDevAuthFallbackEnabled()) return;

  if (!user) {
    window.localStorage.removeItem(DEV_AUTH_STORAGE_KEY);
    return;
  }

  window.localStorage.setItem(DEV_AUTH_STORAGE_KEY, JSON.stringify(user));
}

export function createLocalDevAuthSession(email: string): AuthUser | null {
  if (!isLocalDevAuthFallbackEnabled()) return null;

  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail) return null;

  const nameSeed = normalizedEmail.split("@")[0] || "developer";
  const displayName = nameSeed
    .split(/[._-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

  const user: AuthUser = {
    id: -1,
    email: normalizedEmail,
    userName: displayName || "Local Developer",
    firstName: displayName.split(" ")[0] || "Local",
    lastName: displayName.split(" ").slice(1).join(" ") || "Developer",
    mobile: "",
  };

  writeStoredDevAuthUser(user);
  return user;
}

export function isDevAuthNetworkError(error: unknown): boolean {
  return isLocalDevAuthFallbackEnabled() && error instanceof TypeError;
}

export async function canReachAuthServer(): Promise<boolean> {
  if (!isLocalDevAuthFallbackEnabled()) {
    return true;
  }

  try {
    await fetch(`${API_BASE}/api/user/me`, {
      method: "GET",
      credentials: "include",
      headers: { Accept: "application/json" },
    });
    return true;
  } catch {
    return false;
  }
}

export interface UpdateProfilePayload {
  firstName: string;
  lastName: string;
  mobile: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export interface OtpPayload {
  email: string;
  otp?: string;
}

export interface ResetPasswordPayload {
  email: string;
  otp: string;
  password: string;
}

export async function fetchCurrentUser(signal?: AbortSignal): Promise<AuthUser | null> {
  if (isLocalDevAuthFallbackEnabled() && !HAS_EXPLICIT_AUTH_API_URL) {
    return readStoredDevAuthUser();
  }

  try {
    const response = await fetch(`${API_BASE}/api/user/me`, {
      method: "GET",
      credentials: "include",
      headers: { Accept: "application/json" },
      signal,
    });

    if (response.status === 401) return null;
    if (!response.ok) {
      throw new Error(`Failed to fetch current user (${response.status})`);
    }

    return (await response.json()) as AuthUser;
  } catch (error) {
    const devAuthUser = readStoredDevAuthUser();
    if (devAuthUser) {
      return devAuthUser;
    }
    if (isLocalDevAuthFallbackEnabled() && error instanceof TypeError) {
      return null;
    }
    throw error;
  }
}

export async function logoutRequest(): Promise<void> {
  try {
    const response = await fetch(`${API_BASE}/api/user/logout`, {
      method: "POST",
      credentials: "include",
      headers: { Accept: "application/json" },
    });

    if (!response.ok) {
      throw new Error(`Logout failed (${response.status})`);
    }
  } catch (error) {
    const devAuthUser = readStoredDevAuthUser();
    if (!devAuthUser) {
      throw error;
    }
  } finally {
    writeStoredDevAuthUser(null);
  }
}

export async function deleteAccountRequest(): Promise<void> {
  const response = await fetch(`${API_BASE}/api/user/me`, {
    method: "DELETE",
    credentials: "include",
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error(`Delete account failed (${response.status})`);
  }
}

export async function updateProfileRequest(payload: UpdateProfilePayload): Promise<AuthUser> {
  const response = await fetch(`${API_BASE}/api/user/me`, {
    method: "PUT",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Profile update failed (${response.status})`);
  }

  return (await response.json()) as AuthUser;
}

export async function changePasswordRequest(payload: ChangePasswordPayload): Promise<void> {
  const response = await fetch(`${API_BASE}/api/user/change-password`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Change password failed (${response.status})`);
  }
}

export async function sendOtpRequest(payload: OtpPayload): Promise<void> {
  const response = await fetch(`${API_BASE}/api/user/send-otp`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ email: payload.email }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Send OTP failed (${response.status})`);
  }
}

export async function verifyOtpRequest(payload: OtpPayload): Promise<void> {
  const response = await fetch(`${API_BASE}/api/user/verify-otp`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ email: payload.email, otp: payload.otp ?? "" }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Verify OTP failed (${response.status})`);
  }
}

export async function resetPasswordRequest(payload: ResetPasswordPayload): Promise<void> {
  const response = await fetch(`${API_BASE}/api/user/reset-password`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      email: payload.email,
      otp: payload.otp,
      password: payload.password,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Reset password failed (${response.status})`);
  }
}
