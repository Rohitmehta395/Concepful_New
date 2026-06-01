import { useState, useEffect } from "react";

const AUTH_KEY = "concepful_session";

export type AuthSession = {
  email: string;
  plan: string;
  activatedAt: string;
} | null;

export function useAuthState() {
  const [session, setSession] = useState<AuthSession>(() => {
    try {
      const raw = localStorage.getItem(AUTH_KEY);
      return raw ? (JSON.parse(raw) as AuthSession) : null;
    } catch {
      return null;
    }
  });

  const login = (email: string, plan: string) => {
    const s: AuthSession = { email, plan, activatedAt: new Date().toISOString() };
    localStorage.setItem(AUTH_KEY, JSON.stringify(s));
    setSession(s);
  };

  const logout = () => {
    localStorage.removeItem(AUTH_KEY);
    setSession(null);
  };

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === AUTH_KEY) {
        try {
          setSession(e.newValue ? (JSON.parse(e.newValue) as AuthSession) : null);
        } catch {
          setSession(null);
        }
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  return { session, isLoggedIn: !!session, login, logout };
}
