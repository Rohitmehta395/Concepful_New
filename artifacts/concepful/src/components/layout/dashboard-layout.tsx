import { Link, useLocation } from "wouter";
import { LayoutDashboard, CheckSquare, History, Palette, ShieldCheck, Cpu } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { name: "Requests", href: "/dashboard/requests", icon: CheckSquare },
  { name: "History", href: "/dashboard/history", icon: History },
  { name: "Brand Center", href: "/dashboard/brand", icon: Palette },
  { name: "Brand Check", href: "/dashboard/brand-check", icon: ShieldCheck },
  { name: "AI Collaboration", href: "/dashboard/ai-collaboration", icon: Cpu },
];

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 border-r bg-card shrink-0 flex flex-col">
        <div className="p-6 border-b">
          <Link href="/" className="font-serif text-xl font-bold tracking-tight">Concepful</Link>
          <div className="text-xs text-muted-foreground mt-1">Client Portal</div>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = location === item.href || (item.href !== "/dashboard" && location.startsWith(item.href));
            return (
              <Link key={item.href} href={item.href}>
                <div
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground hover:bg-secondary hover:text-secondary-foreground"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.name}
                </div>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-0">
        <div className="flex-1 p-6 md:p-10 overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
