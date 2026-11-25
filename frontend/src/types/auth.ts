
export interface AuthUser {
  id: string;
  email: string;
  username: string;
  role: "admin" | "user";
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  session_id: string;
  user: AuthUser;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface SignupPayload {
  email: string;
  username: string;
  password: string;
}

export interface ApiError {
  detail?: string;
  message?: string;
}
