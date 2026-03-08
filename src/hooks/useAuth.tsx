import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";
import { useNavigate } from "react-router-dom";

export type UserRole = "admin" | "staff" | "viewer" | "student";

export interface AuthUser {
  id: string;
  name: string;
  role: UserRole;
  token: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (user: AuthUser) => void;
  logout: () => void;
  hasPermission: (required: UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  login: () => {},
  logout: () => {},
  hasPermission: () => false,
});

const STORAGE_KEY = "sms_auth";

// Role hierarchy — higher index = more permissions
const ROLE_HIERARCHY: Record<UserRole, number> = {
  viewer: 1,
  student: 1,
  staff: 2,
  admin: 3,
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch { /* ignore */ }
    // Migrate legacy session
    const legacyRole = localStorage.getItem("userRole");
    if (legacyRole === "admin" || legacyRole === "student") {
      const migrated: AuthUser = {
        id: legacyRole === "admin" ? "admin-1" : localStorage.getItem("studentId") || "1001",
        name: localStorage.getItem("userName") || legacyRole,
        role: legacyRole as UserRole,
        token: `demo-token-${Date.now()}`,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
      return migrated;
    }
    return null;
  });

  const login = useCallback((u: AuthUser) => {
    setUser(u);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
    // Clean up legacy keys
    localStorage.removeItem("userRole");
    localStorage.removeItem("userName");
    localStorage.removeItem("studentId");
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem("userRole");
    localStorage.removeItem("userName");
    localStorage.removeItem("studentId");
  }, []);

  const hasPermission = useCallback(
    (required: UserRole[]) => {
      if (!user) return false;
      return required.some((r) => ROLE_HIERARCHY[user.role] >= ROLE_HIERARCHY[r]);
    },
    [user]
  );

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
