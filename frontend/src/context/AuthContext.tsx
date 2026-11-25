
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import type {
  AuthUser,
  LoginPayload,
  SignupPayload,
} from "../types/auth";

import {
  clearAuthSession,
  getStoredRefreshToken,
  hasStoredSession,
  saveAuthSession,
} from "../services/api";

import {
  getCurrentUser,
  loginUser,
  logoutUser,
  registerUser,
} from "../services/authService";

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (credentials: LoginPayload) => Promise<void>;
  signup: (details: SignupPayload) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function restoreSession() {
      if (!hasStoredSession()) {
        if (active) setLoading(false);
        return;
      }

      try {
        const currentUser = await getCurrentUser();

        if (active) {
          setUser(currentUser);
          sessionStorage.setItem(
            "saints_user",
            JSON.stringify(currentUser)
          );
        }
      } catch {
        clearAuthSession();

        if (active) {
          setUser(null);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    restoreSession();

    return () => {
      active = false;
    };
  }, []);

  async function login(credentials: LoginPayload) {
    const response = await loginUser(credentials);

    saveAuthSession(response);
    setUser(response.user);
  }

  async function signup(details: SignupPayload) {
    const response = await registerUser(details);

    saveAuthSession(response);
    setUser(response.user);
  }

  async function logout() {
    const refreshToken = getStoredRefreshToken();

    try {
      if (refreshToken) {
        await logoutUser(refreshToken);
      }
    } finally {
      clearAuthSession();
      setUser(null);
    }
  }

  const value: AuthContextType = {
    user,
    loading,
    isAuthenticated: Boolean(user),
    isAdmin: user?.role === "admin",
    login,
    signup,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside an AuthProvider"
    );
  }

  return context;
}
