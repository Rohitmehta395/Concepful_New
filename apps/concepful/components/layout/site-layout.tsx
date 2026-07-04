"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useAuthState } from "@/hooks/use-auth-state";
import { LayoutDashboard, Menu, X, ShieldCheck, ChevronRight } from "lucide-react";

function cap(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function SiteLayout({ children }: { children: React.ReactNode }) {
  const { isLoggedIn, isAdmin, hasPricingInterest, session, role } = useAuthState();
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  const closeMobile = () => setMobileOpen(false);

  const portalLabel = session?.plan ? `${cap(session.plan)} Portal` : "My Portal";

  // Which nav links are visible in the desktop bar
  const showBreakdown = role !== "prospect-cold"; // hot prospect, client, or admin

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background selection:bg-primary/20 selection:text-primary">
      {/* ── Header ── */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="font-serif text-xl font-bold tracking-tight shrink-0">
            Concepful
          </Link>

          {/* Desktop nav */}
          <nav className="hidden sm:flex items-center gap-5 text-sm font-medium">
            <Link href="/work" className="text-muted-foreground hover:text-foreground transition-colors">Work</Link>
            <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">Plans</Link>

            {showBreakdown && (
              <Link href="/pricing" className="text-muted-foreground hover:text-foreground transition-colors">
                Breakdown
              </Link>
            )}

            {isAdmin && (
              <Link href="/admin">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full bg-amber-400/15 text-amber-600 border border-amber-400/30">
                  <ShieldCheck className="h-3 w-3" /> Admin
                </span>
              </Link>
            )}

            {isLoggedIn ? (
              <Link href="/dashboard">
                <Button size="sm" variant="outline" className="h-8 px-4 text-sm font-semibold gap-2 border-primary/30 text-primary hover:bg-primary/5 hover:text-primary">
                  <LayoutDashboard className="h-3.5 w-3.5" />
                  {portalLabel}
                </Button>
              </Link>
            ) : (
              <Link href="/checkout">
                <Button size="sm" className="h-8 px-4 text-sm font-semibold">
                  Get Started
                </Button>
              </Link>
            )}
          </nav>

          {/* Mobile: hamburger */}
          <button
            className="sm:hidden p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
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
            />

            {/* Panel */}
            <motion.div
              key="panel"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="fixed right-0 top-0 bottom-0 z-50 w-72 flex flex-col sm:hidden"
              style={{ backgroundColor: "hsl(349, 90%, 54%)" }}
            >
              {/* Close */}
              <div className="flex items-center justify-between px-6 h-16 border-b border-white/15">
                <span className="font-serif text-lg font-bold text-white">Concepful</span>
                <button
                  onClick={closeMobile}
                  className="p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Links */}
              <nav className="flex flex-col gap-1 px-4 py-6 flex-1">
                {[
                  { href: "/work", label: "Work" },
                  { href: "/", label: "Plans" },
                  ...(showBreakdown ? [{ href: "/pricing", label: "Breakdown" }] : []),
                  ...(isAdmin ? [{ href: "/admin", label: "Admin" }] : []),
                ].map(({ href, label }) => (
                  <Link
                    key={href}
                    href={href}
                    onClick={closeMobile}
                    className="flex items-center justify-between px-4 py-3.5 rounded-xl text-white/90 hover:text-white hover:bg-white/10 transition-colors font-medium"
                  >
                    {label}
                    <ChevronRight className="h-4 w-4 opacity-40" />
                  </Link>
                ))}
              </nav>

              {/* CTA */}
              <div className="px-4 pb-8">
                {isLoggedIn ? (
                  <Link href="/dashboard" onClick={closeMobile}>
                    <button className="w-full flex items-center justify-center gap-2 bg-white text-primary font-semibold px-4 py-3.5 rounded-xl hover:bg-white/90 transition-colors text-sm">
                      <LayoutDashboard className="h-4 w-4" />
                      {portalLabel}
                    </button>
                  </Link>
                ) : (
                  <Link href="/checkout" onClick={closeMobile}>
                    <button className="w-full bg-white text-primary font-semibold px-4 py-3.5 rounded-xl hover:bg-white/90 transition-colors text-sm">
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
      <main className="flex-1 flex flex-col">
        {children}
      </main>

      {/* ── Footer ── */}
      <footer className="border-t bg-card mt-auto">
        <div className="container mx-auto px-6 py-10 text-sm text-muted-foreground flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <p className="font-semibold text-foreground mb-1">Concepful</p>
            <p>Creative Department-as-a-Service · © {new Date().getFullYear()}</p>
          </div>
          <div className="flex gap-6">
            <Link href="/work" className="hover:text-foreground transition-colors">Work</Link>
            <Link href="/" className="hover:text-foreground transition-colors">Plans</Link>
            {showBreakdown && (
              <Link href="/pricing" className="hover:text-foreground transition-colors">Pricing</Link>
            )}
            {isLoggedIn && (
              <Link href="/dashboard" className="hover:text-foreground transition-colors">Portal</Link>
            )}
            {isAdmin && (
              <Link href="/admin" className="hover:text-foreground transition-colors">Admin</Link>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}
