"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useAuthState } from "@/hooks/use-auth-state";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Menu,
  X,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";

// ── Constants ──────────────────────────────────────────────────────────────

/** Scroll distance (px) after which the transparent home-page header solidifies. */
const SCROLL_THRESHOLD = 20;

type NavItem = {
  href: string;
  label: string;
  /** Only rendered when this returns true. Omit for links always shown. */
  show?: (ctx: { showBreakdown: boolean; isAdmin: boolean }) => boolean;
};

/** Single source of truth for nav links — desktop, mobile, and footer all derive from this. */
const NAV_ITEMS: NavItem[] = [
  { href: "/work", label: "Work" },
  { href: "/#plan-selector", label: "Plans" },
  {
    href: "/pricing",
    label: "Breakdown",
    show: ({ showBreakdown }) => showBreakdown,
  },
  { href: "/contact", label: "Contact" },
];

function capitalize(value?: string | null) {
  if (!value) return "";
  return value.charAt(0).toUpperCase() + value.slice(1);
}

// ── Component ────────────────────────────────────────────────────────────

export function SiteLayout({ children }: { children: ReactNode }) {
  const { isLoggedIn, isAdmin, session, role } = useAuthState();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const showBreakdown = role !== "prospect-cold"; // hot prospect, client, or admin

  const isHome = pathname === "/";
  const isTransparent = isHome && !scrolled;

  const portalLabel = session?.plan
    ? `${capitalize(session.plan)} Portal`
    : "My Portal";

  const visibleNavItems = useMemo(
    () =>
      NAV_ITEMS.filter(
        (item) => !item.show || item.show({ showBreakdown, isAdmin }),
      ),
    [showBreakdown, isAdmin],
  );

  const closeMobile = useCallback(() => setMobileOpen(false), []);

  // Track scroll position for the header's transparent -> solid transition.
  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        setScrolled(window.scrollY > SCROLL_THRESHOLD);
        ticking = false;
      });
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close the mobile panel on route change (covers back/forward nav, not just link clicks).
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Lock body scroll, support Escape-to-close, and restore focus to the trigger on close.
  useEffect(() => {
    if (!mobileOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeMobile();
    };
    document.addEventListener("keydown", handleKeyDown);

    panelRef.current?.querySelector<HTMLElement>("a, button")?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
      menuButtonRef.current?.focus();
    };
  }, [mobileOpen, closeMobile]);

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background selection:bg-primary/20 selection:text-primary">
      {/* ── Header ── */}
      <header
        className={cn(
          "fixed top-0 z-50 w-full transition-all duration-300",
          isTransparent
            ? "bg-black/40 backdrop-blur-sm border-transparent"
            : "border-b border-gray-200 bg-white shadow-sm",
        )}
      >
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex flex-1 justify-start">
            <Link
              href="/"
              className={cn(
                "font-serif text-xl font-bold tracking-tight shrink-0 transition-colors",
                isTransparent ? "text-white" : "text-black",
              )}
            >
              Concepful
            </Link>
          </div>

          {/* Desktop nav */}
          <nav
            aria-label="Primary"
            className="hidden sm:flex flex-none items-center justify-center gap-5 text-sm font-medium"
          >
            {visibleNavItems.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  "transition-colors",
                  isTransparent
                    ? "text-white/80 hover:text-white"
                    : "text-black/70 hover:text-black",
                )}
              >
                {label}
              </Link>
            ))}

            {isAdmin && (
              <Link href="/admin">
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full border transition-colors",
                    isTransparent
                      ? "bg-white/10 text-white border-white/20"
                      : "bg-amber-400/15 text-amber-600 border-amber-400/30",
                  )}
                >
                  <ShieldCheck className="h-3 w-3" aria-hidden="true" /> Admin
                </span>
              </Link>
            )}
          </nav>

          {/* Right section: Auth Buttons & Mobile Menu */}
          <div className="flex flex-1 justify-end items-center gap-4">
            <div className="hidden sm:block">
              {isLoggedIn ? (
                <Link href="/dashboard">
                  <Button
                    size="sm"
                    variant={isTransparent ? "ghost" : "outline"}
                    className={cn(
                      "h-8 px-4 text-sm font-semibold gap-2 transition-colors",
                      isTransparent
                        ? "text-white hover:bg-white/10 hover:text-white border-white/20 border"
                        : "border-primary/30 text-primary hover:bg-primary/5 hover:text-primary",
                    )}
                  >
                    <LayoutDashboard
                      className="h-3.5 w-3.5"
                      aria-hidden="true"
                    />
                    {portalLabel}
                  </Button>
                </Link>
              ) : (
                <Link href="/checkout">
                  <Button
                    size="sm"
                    className={cn(
                      "h-8 px-4 text-sm font-semibold transition-colors",
                      isTransparent &&
                        "bg-white text-primary hover:bg-white/90",
                    )}
                  >
                    Get Started
                  </Button>
                </Link>
              )}
            </div>

            {/* Mobile: hamburger */}
            <button
              ref={menuButtonRef}
              type="button"
              className={cn(
                "sm:hidden p-2 rounded-lg transition-colors",
                isTransparent
                  ? "text-white hover:bg-white/10"
                  : "text-black hover:bg-gray-100",
              )}
              onClick={() => setMobileOpen(true)}
              aria-haspopup="dialog"
              aria-expanded={mobileOpen}
              aria-controls="mobile-nav-panel"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </header>

      {/* ── Mobile slide-in panel ── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Overlay */}
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/50 sm:hidden"
              onClick={closeMobile}
              aria-hidden="true"
            />

            {/* Panel */}
            <motion.div
              key="panel"
              id="mobile-nav-panel"
              ref={panelRef}
              role="dialog"
              aria-modal="true"
              aria-label="Site navigation"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="fixed right-0 top-0 bottom-0 z-50 w-72 flex flex-col sm:hidden bg-primary"
            >
              {/* Close */}
              <div className="flex items-center justify-between px-6 h-16 border-b border-white/15">
                <span className="font-serif text-lg font-bold text-white">
                  Concepful
                </span>
                <button
                  type="button"
                  onClick={closeMobile}
                  className="p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>

              {/* Links */}
              <nav
                aria-label="Mobile"
                className="flex flex-col gap-1 px-4 py-6 flex-1"
              >
                {visibleNavItems.map(({ href, label }) => (
                  <Link
                    key={href}
                    href={href}
                    onClick={closeMobile}
                    className="flex items-center justify-between px-4 py-3.5 rounded-xl text-white/90 hover:text-white hover:bg-white/10 transition-colors font-medium"
                  >
                    {label}
                    <ChevronRight
                      className="h-4 w-4 opacity-40"
                      aria-hidden="true"
                    />
                  </Link>
                ))}
                {isAdmin && (
                  <Link
                    href="/admin"
                    onClick={closeMobile}
                    className="flex items-center justify-between px-4 py-3.5 rounded-xl text-white/90 hover:text-white hover:bg-white/10 transition-colors font-medium"
                  >
                    Admin
                    <ChevronRight
                      className="h-4 w-4 opacity-40"
                      aria-hidden="true"
                    />
                  </Link>
                )}
              </nav>

              {/* CTA */}
              <div className="px-4 pb-8">
                {isLoggedIn ? (
                  <Link href="/dashboard" onClick={closeMobile}>
                    <button
                      type="button"
                      className="w-full flex items-center justify-center gap-2 bg-white text-primary font-semibold px-4 py-3.5 rounded-xl hover:bg-white/90 transition-colors text-sm"
                    >
                      <LayoutDashboard className="h-4 w-4" aria-hidden="true" />
                      {portalLabel}
                    </button>
                  </Link>
                ) : (
                  <Link href="/checkout" onClick={closeMobile}>
                    <button
                      type="button"
                      className="w-full bg-white text-primary font-semibold px-4 py-3.5 rounded-xl hover:bg-white/90 transition-colors text-sm"
                    >
                      Get Started
                    </button>
                  </Link>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Page content ── */}
      <main className={cn("flex-1 flex flex-col", !isHome && "pt-16")}>
        {children}
      </main>

      {/* ── Footer ── */}
      <footer className="border-t bg-card mt-auto">
        <div className="container mx-auto px-6 py-10 text-sm text-muted-foreground flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <p className="font-semibold text-foreground mb-1">Concepful</p>
            <p>
              Creative Department-as-a-Service · © {new Date().getFullYear()}
            </p>
          </div>
          <div className="flex gap-6">
            {visibleNavItems.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="hover:text-foreground transition-colors"
              >
                {label === "Breakdown" ? "Pricing" : label}
              </Link>
            ))}
            {isLoggedIn && (
              <Link
                href="/dashboard"
                className="hover:text-foreground transition-colors"
              >
                Portal
              </Link>
            )}
            {isAdmin && (
              <Link
                href="/admin"
                className="hover:text-foreground transition-colors"
              >
                Admin
              </Link>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}
