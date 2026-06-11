import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import {
  MessageSquare, CheckSquare, Paperclip, Plus, X,
  ChevronDown, Settings, LayoutDashboard, Layers,
  Bell, MoreHorizontal,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Ping, PingKind, PingSubtype,
  MessageSubtype, TodoSubtype, MediaSubtype,
  loadPings, savePings, addPing,
  KIND_META, SUBTYPE_META,
} from "@/lib/pings";

const KIND_SUBTYPES: Record<PingKind, PingSubtype[]> = {
  message: ["chat", "note", "followup"],
  todo:    ["task", "project", "meeting"],
  media:   ["document", "asset"],
};

const KIND_ICON = {
  message: MessageSquare,
  todo:    CheckSquare,
  media:   Paperclip,
} as const;

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

interface ComposePanelProps {
  onSend: (ping: Omit<Ping, "id" | "date">) => void;
  onClose: () => void;
}

function ComposePanel({ onSend, onClose }: ComposePanelProps) {
  const [kind,    setKind]    = useState<PingKind>("message");
  const [subtype, setSubtype] = useState<PingSubtype>("chat");
  const [title,   setTitle]   = useState("");
  const [body,    setBody]    = useState("");

  const subtypes = KIND_SUBTYPES[kind];

  const handleKind = (k: PingKind) => {
    setKind(k);
    setSubtype(KIND_SUBTYPES[k][0]);
  };

  const handleSend = () => {
    if (!title.trim() && !body.trim()) return;
    onSend({ kind, subtype, title: title.trim() || body.slice(0, 60), body: body.trim(), author: "client" });
    setTitle(""); setBody("");
  };

  return (
    <div className="border-t bg-card p-3 space-y-3">
      {/* Kind selector */}
      <div className="flex gap-1">
        {(["message", "todo", "media"] as PingKind[]).map(k => {
          const Icon = KIND_ICON[k];
          const m    = KIND_META[k];
          return (
            <button
              key={k}
              onClick={() => handleKind(k)}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold transition-all border",
                kind === k
                  ? cn(m.bg, m.color, m.border)
                  : "border-transparent text-muted-foreground hover:bg-secondary",
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{m.label}</span>
            </button>
          );
        })}
      </div>

      {/* Subtype selector */}
      <div className="flex gap-1 flex-wrap">
        {subtypes.map(s => (
          <button
            key={s}
            onClick={() => setSubtype(s)}
            className={cn(
              "text-[11px] px-2.5 py-1 rounded-full border transition-all font-medium",
              subtype === s
                ? "bg-foreground text-background border-foreground"
                : "border-border text-muted-foreground hover:border-foreground/30",
            )}
          >
            {SUBTYPE_META[s].emoji} {SUBTYPE_META[s].label}
          </button>
        ))}
      </div>

      {/* Title (optional) */}
      <Input
        value={title}
        onChange={e => setTitle(e.target.value)}
        placeholder="Title (optional)"
        className="text-sm h-8"
      />

      {/* Body */}
      <Textarea
        value={body}
        onChange={e => setBody(e.target.value)}
        placeholder={
          kind === "message" ? "What do you want to say?" :
          kind === "todo"    ? "Describe the task or action item…" :
          "Add a note about this file or asset…"
        }
        className="text-sm resize-none min-h-[64px]"
        onKeyDown={e => { if (e.key === "Enter" && e.metaKey) handleSend(); }}
      />

      <div className="flex items-center justify-between">
        <p className="text-[10px] text-muted-foreground">⌘+Enter to send</p>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={onClose}>Cancel</Button>
          <Button size="sm" className="h-7 text-xs" onClick={handleSend} disabled={!body.trim() && !title.trim()}>
            Send Ping
          </Button>
        </div>
      </div>
    </div>
  );
}

interface PingItemProps {
  ping: Ping;
  isExpanded: boolean;
  onToggle: () => void;
  onToggleDone?: () => void;
}

function PingItem({ ping, isExpanded, onToggle, onToggleDone }: PingItemProps) {
  const m  = KIND_META[ping.kind];
  const sm = SUBTYPE_META[ping.subtype];
  const Icon = KIND_ICON[ping.kind];

  return (
    <div
      className={cn(
        "border-b border-border/40 last:border-0 transition-colors",
        isExpanded ? cn(m.bg, "border-l-2", m.border.replace("border-", "border-l-")) : "hover:bg-secondary/30",
      )}
    >
      {/* Collapsed row */}
      <button
        onClick={onToggle}
        className="w-full text-left px-3 py-2.5 flex items-start gap-2.5"
      >
        <div className={cn(
          "h-7 w-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 text-sm",
          m.bg, m.border, "border",
        )}>
          {sm.emoji}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className={cn("text-[10px] font-semibold uppercase tracking-wide", m.color)}>
              {sm.label}
            </span>
            {ping.done === false && ping.kind === "todo" && (
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400 shrink-0" />
            )}
            {ping.author === "team" && (
              <span className="text-[10px] text-muted-foreground/60">· Team</span>
            )}
          </div>
          <p className={cn(
            "text-xs leading-snug line-clamp-1 font-medium",
            ping.done ? "line-through text-muted-foreground" : "",
          )}>
            {ping.title || ping.body}
          </p>
          <p className="text-[10px] text-muted-foreground mt-0.5">{timeAgo(ping.date)}</p>
        </div>

        <ChevronDown className={cn(
          "h-3.5 w-3.5 text-muted-foreground/50 shrink-0 mt-1 transition-transform",
          isExpanded && "rotate-180",
        )} />
      </button>

      {/* Expanded body */}
      {isExpanded && (
        <div className="px-3 pb-3 space-y-2">
          <p className="text-xs leading-relaxed text-foreground/80">{ping.body}</p>

          {ping.fileName && (
            <div className="inline-flex items-center gap-1.5 text-[11px] bg-background border rounded-lg px-2.5 py-1.5 font-medium">
              <Paperclip className="h-3 w-3 text-muted-foreground" />
              {ping.fileName}
            </div>
          )}

          {ping.kind === "todo" && ping.done === false && onToggleDone && (
            <button
              onClick={e => { e.stopPropagation(); onToggleDone(); }}
              className="text-[11px] font-semibold text-amber-600 hover:text-amber-700 transition-colors"
            >
              Mark complete ✓
            </button>
          )}
          {ping.kind === "todo" && ping.done === true && (
            <span className="text-[11px] text-emerald-600 font-semibold">✓ Completed</span>
          )}
        </div>
      )}
    </div>
  );
}

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [location]   = useLocation();
  const [pings, setPings]       = useState<Ping[]>(() => loadPings());
  const [expanded, setExpanded] = useState<string | null>(null);
  const [composing, setComposing] = useState(false);
  const [filterKind, setFilterKind] = useState<PingKind | "all">("all");

  useEffect(() => { savePings(pings); }, [pings]);

  const handleSend = (ping: Omit<Ping, "id" | "date">) => {
    setPings(prev => addPing(prev, ping));
    setComposing(false);
  };

  const toggleDone = (id: string) => {
    setPings(prev => prev.map(p => p.id === id ? { ...p, done: true } : p));
  };

  const visiblePings = filterKind === "all"
    ? pings
    : pings.filter(p => p.kind === filterKind);

  const unread = pings.filter(p => p.kind === "todo" && p.done === false).length;

  const isOnDashboard = location === "/dashboard" || location.startsWith("/dashboard/project");

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">

      {/* ── Ping sidebar ── */}
      <aside className="w-full md:w-72 border-r bg-card shrink-0 flex flex-col min-h-0 md:min-h-screen md:sticky md:top-0 md:max-h-screen">

        {/* Brand header */}
        <div className="px-4 py-4 border-b flex items-center justify-between shrink-0">
          <div>
            <Link href="/" className="font-serif text-lg font-bold tracking-tight">Concepful</Link>
            <div className="text-[11px] text-muted-foreground">Client Portal</div>
          </div>
          <div className="flex items-center gap-1">
            {unread > 0 && (
              <div className="h-5 min-w-5 px-1 rounded-full bg-amber-400 text-white text-[10px] font-bold flex items-center justify-center">
                {unread}
              </div>
            )}
            <Link href="/dashboard/settings">
              <button className={cn(
                "h-7 w-7 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-secondary transition-colors",
                location === "/dashboard/settings" && "bg-secondary",
              )}>
                <Settings className="h-3.5 w-3.5" />
              </button>
            </Link>
          </div>
        </div>

        {/* Quick nav */}
        <div className="px-3 py-2 border-b flex items-center gap-1 shrink-0">
          <Link href="/dashboard">
            <button className={cn(
              "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors",
              isOnDashboard ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary",
            )}>
              <LayoutDashboard className="h-3.5 w-3.5" /> Overview
            </button>
          </Link>
          <Link href="/dashboard/requests">
            <button className={cn(
              "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors",
              location === "/dashboard/requests" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary",
            )}>
              <Layers className="h-3.5 w-3.5" /> Requests
            </button>
          </Link>
          <Link href="/dashboard/history">
            <button className={cn(
              "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors",
              location === "/dashboard/history" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary",
            )}>
              <MoreHorizontal className="h-3.5 w-3.5" />
            </button>
          </Link>
        </div>

        {/* Ping stream header */}
        <div className="px-3 py-2 border-b flex items-center justify-between shrink-0">
          <div className="flex items-center gap-1">
            <Bell className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Pings</span>
          </div>
          <button
            onClick={() => setComposing(c => !c)}
            className={cn(
              "h-6 w-6 rounded-lg flex items-center justify-center transition-colors",
              composing ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary",
            )}
          >
            {composing ? <X className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
          </button>
        </div>

        {/* Kind filter pills */}
        <div className="px-3 py-2 flex gap-1 shrink-0 border-b">
          {(["all", "message", "todo", "media"] as const).map(k => (
            <button
              key={k}
              onClick={() => setFilterKind(k)}
              className={cn(
                "text-[11px] px-2 py-0.5 rounded-full font-medium capitalize transition-all",
                filterKind === k
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {k === "all" ? "All" : KIND_META[k].label}
            </button>
          ))}
        </div>

        {/* Ping list */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {visiblePings.length === 0 ? (
            <div className="py-10 text-center text-xs text-muted-foreground px-4">
              No pings yet. Hit + to send one.
            </div>
          ) : (
            visiblePings.map(ping => (
              <PingItem
                key={ping.id}
                ping={ping}
                isExpanded={expanded === ping.id}
                onToggle={() => setExpanded(expanded === ping.id ? null : ping.id)}
                onToggleDone={ping.kind === "todo" ? () => toggleDone(ping.id) : undefined}
              />
            ))
          )}
        </div>

        {/* Compose panel */}
        {composing && (
          <ComposePanel onSend={handleSend} onClose={() => setComposing(false)} />
        )}
      </aside>

      {/* ── Main content ── */}
      <main className="flex-1 flex flex-col min-h-0">
        <div className="flex-1 p-6 md:p-10 overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
