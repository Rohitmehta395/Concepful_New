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
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { LogoNew } from "@/components/ui/logo-new";
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
        <div className="container mx-auto pl-6 pr-6 sm:pr-0 flex h-[72px] items-stretch justify-between">
          {/* Logo */}
          <div className="flex shrink-0 items-center">
            <Link
              href="/"
              className="flex items-center shrink-0"
              aria-label="Concepful Home"
            >
              <LogoNew 
                className="h-10 w-auto transition-colors" 
                textColorClass={isTransparent ? "text-white" : "text-black"} 
              />
            </Link>
          </div>

          {/* Right section: Nav & Actions */}
          <div className="flex items-stretch gap-8">
            {/* Desktop nav */}
            <nav
              aria-label="Primary"
              className="hidden sm:flex items-center gap-8 text-sm font-medium"
            >
              {visibleNavItems.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "transition-colors py-2",
                    isTransparent
                      ? "text-white/80 hover:text-white"
                      : "text-black/70 hover:text-black",
                  )}
                >
                  {label}
                </Link>
              ))}

              {isAdmin && (
                <Link href="/admin" className="flex items-center">
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
            <div className="flex items-center sm:items-stretch gap-6 sm:gap-0">
              <div className="hidden sm:flex items-stretch">
                {isLoggedIn ? (
                  <Link
                    href="/dashboard"
                    className={cn(
                      "flex items-center justify-center h-full px-8 text-sm font-semibold gap-2 transition-colors border-l",
                      isTransparent
                        ? "text-white hover:bg-white/10 border-white/20"
                        : "text-primary hover:bg-primary/5 border-border",
                    )}
                  >
                    <LayoutDashboard
                      className="h-4 w-4"
                      aria-hidden="true"
                    />
                    {portalLabel}
                  </Link>
                ) : (
                  <Link
                    href="/checkout"
                    className="flex items-center justify-center h-full px-10 bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
                  >
                    Get Started
                  </Link>
                )}
              </div>

              {/* Mobile: hamburger */}
              <div className="flex items-center sm:hidden">
                <button
                  ref={menuButtonRef}
                  type="button"
                  className={cn(
                    "p-2 rounded-lg transition-colors",
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
                <span className="flex items-center">
                  <LogoNew 
                    className="h-8 w-auto" 
                    textColorClass="text-white" 
                  />
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
