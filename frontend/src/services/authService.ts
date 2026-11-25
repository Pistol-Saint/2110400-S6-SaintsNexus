
import { apiRequest } from "./api";

import type {
  AuthResponse,
  AuthUser,
  LoginPayload,
  SignupPayload,
} from "../types/auth";

export async function loginUser(
  credentials: LoginPayload
): Promise<AuthResponse> {
  return apiRequest<AuthResponse>(
    "/api/auth/login",
    {
      method: "POST",
      body: JSON.stringify(credentials),
    }
  );
}

export async function registerUser(
  details: SignupPayload
): Promise<AuthResponse> {
  return apiRequest<AuthResponse>(
    "/api/auth/signup",
    {
      method: "POST",
      body: JSON.stringify(details),
    }
  );
}

export async function getCurrentUser(): Promise<AuthUser> {
  return apiRequest<AuthUser>(
    "/api/auth/me",
    {},
    true
  );
}

export async function logoutUser(
  refreshToken: string
): Promise<{ message: string }> {
  return apiRequest<{ message: string }>(
    "/api/auth/logout",
    {
      method: "POST",
      body: JSON.stringify({
        refresh_token: refreshToken,
      }),
    }
  );
}
