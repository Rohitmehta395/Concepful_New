import { useState, useEffect, useCallback } from "react";

const AUTH_KEY    = "concepful_session";
const ADMIN_KEY   = "concepful_admin";
const PRICING_KEY = "concepful_pricing_interest";

export type UserRole = "admin" | "client" | "prospect-hot" | "prospect-cold";

export type AuthSession = {
  email: string;
  plan: string;
  activatedAt: string;
  role?: string;
} | null;

function readSession(): AuthSession {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    return raw ? (JSON.parse(raw) as AuthSession) : null;
  } catch { return null; }
}

function readBool(key: string): boolean {
  try { return localStorage.getItem(key) === "true"; } catch { return false; }
}

function computeIsAdmin(session: AuthSession): boolean {
  return session?.role === "admin" || readBool(ADMIN_KEY);
}

export function useAuthState() {
  const [session, setSession]                   = useState<AuthSession>(readSession);
  const [isAdmin, setIsAdmin]                   = useState(() => computeIsAdmin(readSession()));
  const [hasPricingInterest, setPricingInterest] = useState(() => readBool(PRICING_KEY));

  const role: UserRole =
    isAdmin            ? "admin" :
    !!session          ? "client" :
    hasPricingInterest ? "prospect-hot" :
                         "prospect-cold";

  const login = useCallback((email: string, plan: string, sessionRole?: string) => {
    const s: AuthSession = { email, plan, activatedAt: new Date().toISOString(), role: sessionRole };
    localStorage.setItem(AUTH_KEY, JSON.stringify(s));
    setSession(s);
    setIsAdmin(computeIsAdmin(s));
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(AUTH_KEY);
    setSession(null);
    setIsAdmin(readBool(ADMIN_KEY));
  }, []);

  const markPricingInterest = useCallback(() => {
    localStorage.setItem(PRICING_KEY, "true");
    setPricingInterest(true);
  }, []);

  const enableAdmin = useCallback(() => {
    localStorage.setItem(ADMIN_KEY, "true");
    setIsAdmin(true);
  }, []);

  const disableAdmin = useCallback(() => {
    localStorage.removeItem(ADMIN_KEY);
    const s = readSession();
    setIsAdmin(s?.role === "admin");
  }, []);

  // Cross-tab sync
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === AUTH_KEY) {
        const s: AuthSession = e.newValue ? JSON.parse(e.newValue) : null;
        setSession(s);
        setIsAdmin(computeIsAdmin(s));
      }
      if (e.key === ADMIN_KEY)   setIsAdmin(computeIsAdmin(readSession()));
      if (e.key === PRICING_KEY) setPricingInterest(e.newValue === "true");
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  return {
    session,
    isLoggedIn: !!session,
    isAdmin,
    hasPricingInterest,
    role,
    login,
    logout,
    markPricingInterest,
    enableAdmin,
    disableAdmin,
  };
}
