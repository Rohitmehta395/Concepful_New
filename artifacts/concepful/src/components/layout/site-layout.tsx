import { Link } from "wouter";

export function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[100dvh] flex flex-col bg-background selection:bg-primary/20 selection:text-primary">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="font-serif text-xl font-bold tracking-tight">Concepful</Link>
          <nav className="flex items-center gap-6 text-sm font-medium">
            <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">Plans</Link>
            <Link href="/pricing" className="text-muted-foreground hover:text-foreground transition-colors">Breakdown</Link>
            <Link href="/dashboard" className="text-primary hover:text-primary/80 transition-colors font-semibold">Client Portal</Link>
          </nav>
        </div>
      </header>
      <main className="flex-1 flex flex-col">
        {children}
      </main>
      <footer className="border-t bg-card mt-auto">
        <div className="container mx-auto px-6 py-10 text-sm text-muted-foreground flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <p className="font-semibold text-foreground mb-1">Concepful</p>
            <p>Creative Department-as-a-Service · © {new Date().getFullYear()}</p>
          </div>
          <div className="flex gap-6">
            <Link href="/" className="hover:text-foreground transition-colors">Plans</Link>
            <Link href="/pricing" className="hover:text-foreground transition-colors">Pricing</Link>
            <Link href="/dashboard" className="hover:text-foreground transition-colors">Portal</Link>
            <Link href="/admin" className="hover:text-foreground transition-colors">Admin</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
