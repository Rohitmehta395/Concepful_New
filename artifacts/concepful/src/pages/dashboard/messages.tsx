import { useState, useMemo } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { loadPings, savePings, Ping, PingSubtype, SUBTYPE_META, KIND_META } from "@/lib/pings";
import { cn } from "@/lib/utils";
import {
  MessageSquare, Search, Send, X, Check,
  Paperclip, ChevronRight, Inbox,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

/* ── helpers ── */
function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function getProjectName(projectId?: string): string | null {
  if (!projectId) return null;
  try {
    const known: Array<{id:string;title:string}> = JSON.parse(localStorage.getItem("concepful_projects") ?? "[]");
    const found = known.find(p => p.id === projectId);
    if (found) return found.title;
  } catch {}
  const fallback: Record<string,string> = {
    "1": "Q3 Campaign Asset System", "2": "Investor Deck",
    "3": "Brand Voice Guidelines",   "4": "Social Media Template Pack",
  };
  return fallback[projectId] ?? `Project #${projectId}`;
}

/* ── Detail Modal ── */
function DetailModal({ ping, onClose, onMarkDone, onReply }: {
  ping: Ping;
  onClose: () => void;
  onMarkDone: () => void;
  onReply: (body: string) => void;
}) {
  const [reply, setReply] = useState("");
  const m  = KIND_META[ping.kind];
  const sm = SUBTYPE_META[ping.subtype];

  const send = () => {
    if (!reply.trim()) return;
    onReply(reply.trim());
    setReply("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}>
      <div className="w-full max-w-lg bg-card rounded-2xl border shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-200"
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <div className="flex items-center gap-3">
            <div className={cn("h-9 w-9 rounded-xl flex items-center justify-center text-lg border shrink-0", m.bg, m.border)}>
              {sm.emoji}
            </div>
            <div>
              <p className={cn("text-[10px] font-bold uppercase tracking-wide", m.color)}>{sm.label}</p>
              <p className="text-[10px] text-muted-foreground">
                {ping.author === "team" ? "Creative Team" : "You"} · {timeAgo(ping.date)}
                {ping.projectId && <span className="ml-1">· {getProjectName(ping.projectId)}</span>}
              </p>
            </div>
          </div>
          <button onClick={onClose}
            className="h-7 w-7 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-secondary transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="px-5 py-5 space-y-3">
          <h3 className="font-serif text-lg font-bold leading-snug">{ping.title}</h3>
          {ping.body && <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">{ping.body}</p>}
          <p className="text-[10px] text-muted-foreground pt-1">
            {new Date(ping.date).toLocaleDateString("en-US", {
              weekday: "long", month: "long", day: "numeric",
              hour: "numeric", minute: "2-digit",
            })}
          </p>
        </div>
        <div className="border-t px-5 py-4 bg-secondary/20 space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Reply</p>
          <div className="relative">
            <Textarea value={reply} onChange={e => setReply(e.target.value)}
              placeholder="Type a response… (⌘+Enter)"
              className="text-sm resize-none min-h-[56px] pr-10"
              onKeyDown={e => { if (e.key === "Enter" && e.metaKey) send(); }}
            />
            <button onClick={send} disabled={!reply.trim()}
              className="absolute right-2 bottom-2 h-7 w-7 rounded-lg flex items-center justify-center bg-primary text-primary-foreground disabled:opacity-30 hover:bg-primary/90 transition-all">
              <Send className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Message row card ── */
function MessageCard({ ping, onClick }: { ping: Ping; onClick: () => void }) {
  const sm  = SUBTYPE_META[ping.subtype];
  const m   = KIND_META[ping.kind];
  const proj = getProjectName(ping.projectId);

  return (
    <button onClick={onClick}
      className="w-full flex items-start gap-4 p-4 bg-card border border-border/50 rounded-2xl text-left hover:border-border hover:shadow-sm transition-all group">
      <div className={cn(
        "h-10 w-10 rounded-xl flex items-center justify-center text-lg border shrink-0",
        m.bg, m.border,
      )}>
        {sm.emoji}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <span className={cn("text-[9px] font-bold uppercase tracking-widest", m.color)}>{sm.label}</span>
          {ping.author === "team" && (
            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-secondary/60 text-muted-foreground font-medium">Team</span>
          )}
          {proj && (
            <span className="text-[9px] px-1.5 py-0.5 rounded-full border border-border/50 text-muted-foreground font-medium truncate max-w-[120px]">
              {proj}
            </span>
          )}
          <span className="text-[9px] text-muted-foreground ml-auto">{timeAgo(ping.date)}</span>
        </div>
        <p className="text-sm font-semibold leading-snug line-clamp-1 mb-0.5">{ping.title}</p>
        {ping.body && (
          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{ping.body}</p>
        )}
      </div>
      <ChevronRight className="h-4 w-4 text-muted-foreground/30 shrink-0 mt-3 group-hover:text-muted-foreground transition-colors" />
    </button>
  );
}

/* ── MESSAGES PAGE ── */
type MFilter = "all" | "chat" | "note" | "followup";
const FILTERS: Array<{ key: MFilter; label: string }> = [
  { key: "all",      label: "All" },
  { key: "chat",     label: "Chat" },
  { key: "note",     label: "Note" },
  { key: "followup", label: "Follow-up" },
];

export default function Messages() {
  const [pings,    setPings]    = useState(() => loadPings());
  const [filter,   setFilter]   = useState<MFilter>("all");
  const [search,   setSearch]   = useState("");
  const [selected, setSelected] = useState<Ping | null>(null);

  const all = pings.filter(p => p.kind === "message");

  const filtered = useMemo(() => all
    .filter(p => filter === "all" || p.subtype === filter)
    .filter(p => {
      if (!search) return true;
      const q = search.toLowerCase();
      return p.title.toLowerCase().includes(q) || p.body.toLowerCase().includes(q);
    }),
  [all, filter, search]);

  const handleReply = (body: string) => {
    if (!selected) return;
    const updated = [...pings, {
      id: crypto.randomUUID(), kind: "message" as const, subtype: "chat" as const,
      title: body.slice(0, 60), body, author: "client" as const,
      projectId: selected.projectId, date: new Date().toISOString(),
    }];
    setPings(updated);
    savePings(updated);
    setSelected(null);
  };

  const stats = {
    total:    all.length,
    chat:     all.filter(p => p.subtype === "chat").length,
    note:     all.filter(p => p.subtype === "note").length,
    followup: all.filter(p => p.subtype === "followup").length,
    team:     all.filter(p => p.author === "team").length,
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto pb-20 space-y-6">

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/[0.08] border border-primary/20 flex items-center justify-center">
            <MessageSquare className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="font-serif text-2xl font-bold leading-none">Messages</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Chats, notes, and follow-ups</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: "Total",    value: stats.total,    sub: "messages" },
            { label: "Chat",     value: stats.chat,     sub: "threads"  },
            { label: "Note",     value: stats.note,     sub: "notes"    },
            { label: "Follow-up",value: stats.followup, sub: "pending"  },
          ].map(s => (
            <div key={s.label} className="bg-card border border-border/50 rounded-xl p-3">
              <p className="text-xl font-bold font-serif">{s.value}</p>
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Filters + search */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-0.5 p-1 bg-secondary/30 rounded-xl border border-border/40">
            {FILTERS.map(f => (
              <button key={f.key} onClick={() => setFilter(f.key)}
                className={cn(
                  "px-3 py-1 rounded-lg text-xs font-medium transition-all",
                  filter === f.key
                    ? "bg-background shadow-sm text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}>
                {f.label}
                {f.key !== "all" && (
                  <span className="ml-1 text-[9px] opacity-60">
                    {f.key === "chat" ? stats.chat : f.key === "note" ? stats.note : stats.followup}
                  </span>
                )}
              </button>
            ))}
          </div>
          <div className="relative flex-1 min-w-[180px]">
            <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search messages…" className="pl-8 text-sm h-8" />
          </div>
        </div>

        {/* Team indicator */}
        {stats.team > 0 && (
          <div className="flex items-center gap-2 px-3 py-2 bg-primary/[0.05] rounded-xl border border-primary/15">
            <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            <p className="text-xs text-primary font-medium">
              {stats.team} message{stats.team !== 1 ? "s" : ""} from your creative team
            </p>
          </div>
        )}

        {/* List */}
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <Inbox className="h-10 w-10 text-muted-foreground/20 mx-auto mb-3" />
            <p className="text-sm font-medium text-muted-foreground">
              {search ? "No messages match your search" : "No messages yet"}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map(ping => (
              <MessageCard key={ping.id} ping={ping} onClick={() => setSelected(ping)} />
            ))}
          </div>
        )}
      </div>

      {selected && (
        <DetailModal
          ping={selected}
          onClose={() => setSelected(null)}
          onMarkDone={() => {}}
          onReply={handleReply}
        />
      )}
    </DashboardLayout>
  );
}
