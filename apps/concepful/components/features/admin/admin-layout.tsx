"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, Briefcase, BookOpen, UserCheck } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_SECTIONS = [
  {
    label: "Overview",
    items: [
      { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
      { name: "Leads", href: "/admin/leads", icon: Users },
    ],
  },
  {
    label: "Content",
    items: [
      { name: "Portfolio", href: "/admin/portfolio", icon: Briefcase },
      { name: "Blog", href: "/admin/blog", icon: BookOpen },
    ],
  },
  {
    label: "CRM",
    items: [
      { name: "Contacts", href: "/admin/crm", icon: UserCheck },
    ],
  },
];

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      <aside className="w-full md:w-56 border-r bg-card shrink-0 flex flex-col">
        <div className="p-5 border-b">
          <Link href="/" className="font-serif text-lg font-bold tracking-tight">Concepful</Link>
          <div className="text-xs text-muted-foreground mt-0.5">Admin Portal</div>
        </div>
        <nav className="flex-1 p-3 space-y-5 overflow-y-auto">
          {NAV_SECTIONS.map(section => (
            <div key={section.label}>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-2 mb-1.5">
                {section.label}
              </p>
              <div className="space-y-0.5">
                {section.items.map(item => {
                  const isActive = pathname === item.href ||
                    (item.href !== "/admin" && pathname.startsWith(item.href));
                  return (
                    <Link key={item.href} href={item.href}>
                      <div className={cn(
                        "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer",
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "text-foreground hover:bg-secondary",
                      )}>
                        <item.icon className="h-4 w-4 shrink-0" />
                        {item.name}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
        <div className="p-3 border-t">
          <Link href="/dashboard">
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-muted-foreground hover:bg-secondary transition-colors cursor-pointer">
              ← Client Portal
            </div>
          </Link>
        </div>
      </aside>
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
