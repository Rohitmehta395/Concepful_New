import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import {
  MessageSquare, CheckSquare, Paperclip, Plus, X,
  Settings, LayoutDashboard, Layers,
  ChevronLeft, ChevronRight, ArrowUpDown,
  Folder, Send, Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Link as WouterLink } from "wouter";
import {
  Ping, PingKind, PingSubtype,
  loadPings, savePings, addPing,
  KIND_META, SUBTYPE_META,
} from "@/lib/pings";
import { DashboardContext, useDashboard } from "@/lib/dashboard-context";

const KIND_SUBTYPES: Record<PingKind, PingSubtype[]> = {
  message: ["chat", "note", "followup"],
  todo:    ["task", "project", "meeting"],
  media:   ["document", "asset"],
};

const PINGS_PER_PAGE = 10;

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

/* ═══════════════════════════════════════════════════
   COMPOSE PANEL (middle column — spacious)
═══════════════════════════════════════════════════ */
function ComposePanel({ onSend, onClose }: {
  onSend: (p: Omit<Ping, "id" | "date">) => void;
  onClose: () => void;
}) {
  const [kind,    setKind]    = useState<PingKind>("message");
  const [subtype, setSubtype] = useState<PingSubtype>("chat");
  const [title,   setTitle]   = useState("");
  const [body,    setBody]    = useState("");
  const { activeProjectId } = useDashboard();

  const subtypes = KIND_SUBTYPES[kind];

  const handleKind = (k: PingKind) => {
    setKind(k);
    setSubtype(KIND_SUBTYPES[k][0]);
  };

  const handleSend = () => {
    if (!title.trim() && !body.trim()) return;
    onSend({
      kind, subtype,
      title: title.trim() || body.slice(0, 60),
      body: body.trim(),
      author: "client",
      projectId: activeProjectId?.toString(),
    });
    setTitle(""); setBody("");
  };

  const kindDefs = [
    { k: "message" as PingKind, Icon: MessageSquare, label: "Message" },
    { k: "todo"    as PingKind, Icon: CheckSquare,   label: "Task"    },
    { k: "media"   as PingKind, Icon: Paperclip,     label: "File"    },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-6 py-4 border-b shrink-0 flex items-center justify-between">
        <div>
          <p className="font-semibold text-sm">New Action</p>
          <p className="text-[11px] text-muted-foreground">Log a message, task, or file</p>
        </div>
        <button onClick={onClose}
          className="h-7 w-7 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-secondary transition-colors">
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
        {/* Kind selector */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Type</p>
          <div className="grid grid-cols-3 gap-2">
            {kindDefs.map(({ k, Icon, label }) => {
              const m = KIND_META[k];
              return (
                <button key={k} onClick={() => handleKind(k)}
                  className={cn(
                    "flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all text-xs font-semibold",
                    kind === k
                      ? cn("border-primary bg-primary/[0.06]", m.color)
                      : "border-border/50 text-muted-foreground hover:border-border",
                  )}>
                  <Icon className="h-4 w-4" />
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Subtype */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Category</p>
          <div className="flex flex-wrap gap-1.5">
            {subtypes.map(s => {
              const sm = SUBTYPE_META[s];
              return (
                <button key={s} onClick={() => setSubtype(s)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all border",
                    subtype === s
                      ? "bg-foreground text-background border-transparent"
                      : "border-border/60 text-muted-foreground hover:border-border hover:text-foreground",
                  )}>
                  {sm.emoji} {sm.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Title */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Subject</p>
          <Input value={title} onChange={e => setTitle(e.target.value)}
            placeholder="Brief subject line…" className="text-sm" />
        </div>

        {/* Body */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Details</p>
          <Textarea
            value={body} onChange={e => setBody(e.target.value)}
            placeholder={
              kind === "message" ? "What do you want to say?" :
              kind === "todo"    ? "Describe the task or action item…" :
                                   "Notes about this file or asset…"
            }
            className="text-sm resize-none min-h-[120px]"
            onKeyDown={e => { if (e.key === "Enter" && e.metaKey) handleSend(); }}
          />
          <p className="text-[10px] text-muted-foreground mt-1.5">⌘+Enter to send</p>
        </div>

        {activeProjectId && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground p-3 bg-secondary/30 rounded-xl border border-border/40">
            <Folder className="h-3.5 w-3.5 shrink-0" />
            Linked to current project
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t shrink-0">
        <Button className="w-full gap-2" onClick={handleSend}
          disabled={!body.trim() && !title.trim()}>
          <Send className="h-3.5 w-3.5" /> Create Action
        </Button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   PING DETAIL PANEL (middle column)
═══════════════════════════════════════════════════ */
function PingDetailPanel({ ping, onClose, onReply, onMarkDone }: {
  ping: Ping;
  onClose: () => void;
  onReply: (body: string) => void;
  onMarkDone: () => void;
}) {
  const [reply, setReply] = useState("");
  const m  = KIND_META[ping.kind];
  const sm = SUBTYPE_META[ping.subtype];

  const handleReply = () => {
    if (!reply.trim()) return;
    onReply(reply.trim());
    setReply("");
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b shrink-0">
        <div className="flex items-center gap-2.5">
          <div className={cn("h-8 w-8 rounded-xl flex items-center justify-center text-lg border", m.bg, m.border)}>
            {sm.emoji}
          </div>
          <div>
            <span className={cn("text-[10px] font-bold uppercase tracking-wider", m.color)}>
              {m.label} · {sm.label}
            </span>
            {ping.author === "team" && (
              <p className="text-[10px] text-muted-foreground">From Creative Team</p>
            )}
          </div>
        </div>
        <button onClick={onClose}
          className="h-7 w-7 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-secondary transition-colors">
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
        <h2 className="font-serif text-xl font-bold leading-snug">{ping.title}</h2>
        <p className="text-sm leading-relaxed text-foreground/80">{ping.body}</p>

        {ping.fileName && (
          <div className="inline-flex items-center gap-2 border rounded-xl px-3 py-2.5 text-sm font-medium bg-secondary/40">
            <Paperclip className="h-4 w-4 text-muted-foreground" /> {ping.fileName}
          </div>
        )}

        {ping.projectId && (
          <WouterLink href={`/dashboard/project/${ping.projectId}`}>
            <div className="text-xs font-semibold text-primary hover:underline cursor-pointer">
              View related project →
            </div>
          </WouterLink>
        )}

        <div className="text-[10px] text-muted-foreground pt-2 border-t border-border/40">
          {new Date(ping.date).toLocaleDateString("en-US", {
            weekday: "long", month: "long", day: "numeric",
            hour: "numeric", minute: "2-digit",
          })}
        </div>

        {ping.kind === "todo" && ping.done === false && (
          <Button size="sm" variant="outline" onClick={onMarkDone} className="gap-1.5">
            <CheckSquare className="h-3.5 w-3.5" /> Mark complete
          </Button>
        )}
        {ping.kind === "todo" && ping.done && (
          <p className="text-xs font-semibold text-primary flex items-center gap-1.5">
            <CheckSquare className="h-3.5 w-3.5" /> Completed
          </p>
        )}
      </div>

      {/* Reply */}
      <div className="border-t px-6 py-4 space-y-2.5 shrink-0 bg-secondary/20">
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Reply</p>
        <Textarea
          value={reply} onChange={e => setReply(e.target.value)}
          placeholder="Type a response…"
          className="text-sm resize-none min-h-[60px]"
          onKeyDown={e => { if (e.key === "Enter" && e.metaKey) handleReply(); }}
        />
        <div className="flex items-center justify-between">
          <p className="text-[10px] text-muted-foreground">⌘+Enter to send</p>
          <Button size="sm" onClick={handleReply} disabled={!reply.trim()} className="gap-1.5 h-7 text-xs">
            <Send className="h-3 w-3" /> Send
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   ACTION ITEM ROW (sidebar — compact, clicking opens middle)
═══════════════════════════════════════════════════ */
function ActionItem({ ping, isActive, onClick }: {
  ping: Ping;
  isActive: boolean;
  onClick: () => void;
}) {
  const m  = KIND_META[ping.kind];
  const sm = SUBTYPE_META[ping.subtype];

  return (
    <button onClick={onClick}
      className={cn(
        "w-full flex items-start gap-2.5 px-3 py-2.5 text-left transition-colors border-b border-border/30 last:border-0",
        isActive ? "bg-primary/[0.06]" : "hover:bg-secondary/40",
      )}>
      <div className={cn(
        "h-7 w-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 text-sm border",
        m.bg, m.border,
        isActive && "ring-2 ring-primary/30",
      )}>
        {sm.emoji}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1 mb-0.5">
          <span className={cn("text-[9px] font-bold uppercase tracking-wider", m.color)}>{sm.label}</span>
          {ping.done === false && ping.kind === "todo" && (
            <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
          )}
          {ping.author === "team" && (
            <span className="text-[9px] text-muted-foreground/70 ml-0.5">· Team</span>
          )}
          <span className="text-[9px] text-muted-foreground ml-auto">{timeAgo(ping.date)}</span>
        </div>
        <p className={cn(
          "text-xs font-medium leading-snug line-clamp-1",
          ping.done && "line-through text-muted-foreground",
        )}>
          {ping.title || ping.body}
        </p>
        <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1">{ping.body}</p>
      </div>
    </button>
  );
}

/* ═══════════════════════════════════════════════════
   DASHBOARD LAYOUT
═══════════════════════════════════════════════════ */
export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  /* Context */
  const [activePing,         setActivePingState]    = useState<Ping | null>(null);
  const [activeProjectId,    setActiveProjectId]    = useState<number | null>(null);
  const [activeProjectTitle, setActiveProjectTitle] = useState<string | null>(null);

  const setActivePing    = (p: Ping | null) => { setActivePingState(p); if (p) setComposing(false); };
  const setActiveProject = (id: number | null, title: string | null) => {
    setActiveProjectId(id);
    setActiveProjectTitle(title);
  };

  /* Action stream */
  const [pings,      setPings]      = useState<Ping[]>(() => loadPings());
  const [pingPage,   setPingPage]   = useState(1);
  const [pingSort,   setPingSort]   = useState<"newest"|"oldest"|"kind">("newest");
  const [filterKind, setFilterKind] = useState<PingKind|"all">("all");
  const [composing,  setComposing]  = useState(false);

  useEffect(() => { savePings(pings); }, [pings]);

  /* Handlers */
  const handleSend = (ping: Omit<Ping, "id"|"date">) => {
    const updated = addPing(pings, ping);
    setPings(updated);
    setComposing(false);
    setActivePingState(updated[0]);
  };

  const handleReply = (body: string) => {
    if (!activePing) return;
    const newPing = { kind: "message" as const, subtype: "chat" as const, title: body.slice(0, 60), body, author: "client" as const, projectId: activePing.projectId };
    setPings(prev => addPing(prev, newPing));
  };

  const handleMarkDone = (id: string) => {
    setPings(prev => prev.map(p => p.id === id ? { ...p, done: true } : p));
    if (activePing?.id === id) setActivePingState(prev => prev ? { ...prev, done: true } : null);
  };

  /* Filter + sort + paginate */
  const kindFiltered = filterKind === "all" ? pings : pings.filter(p => p.kind === filterKind);
  const sorted = [...kindFiltered].sort((a, b) => {
    if (pingSort === "oldest") return new Date(a.date).getTime() - new Date(b.date).getTime();
    if (pingSort === "kind")   return a.kind.localeCompare(b.kind);
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });
  const totalPages = Math.max(1, Math.ceil(sorted.length / PINGS_PER_PAGE));
  const pagedPings = sorted.slice((pingPage - 1) * PINGS_PER_PAGE, pingPage * PINGS_PER_PAGE);
  const openTodos  = pings.filter(p => p.kind === "todo" && p.done === false).length;

  /* Middle column visibility — same on ALL pages */
  const showMiddle = activePing !== null || composing;

  /* Nav */
  const isOnProject  = location.startsWith("/dashboard/project/");
  const secondTabHref  = isOnProject && activeProjectId ? `/dashboard/project/${activeProjectId}` : "/dashboard/requests";
  const secondTabLabel = isOnProject && activeProjectTitle ? activeProjectTitle : "Requests";
  const SecondIcon     = isOnProject ? Folder : Layers;

  const ctx = { activePing, setActivePing, activeProjectId, activeProjectTitle, setActiveProject };

  return (
    <DashboardContext.Provider value={ctx}>
      <div className="min-h-screen bg-background flex overflow-x-hidden">

        {/* ══ COLUMN 1: ACTIONS SIDEBAR ══════════════════ */}
        <aside className="w-[250px] border-r bg-card shrink-0 flex flex-col min-h-screen sticky top-0 max-h-screen z-20">

          {/* Brand */}
          <div className="px-4 py-4 border-b flex items-center justify-between shrink-0">
            <div>
              <Link href="/">
                <span className="font-serif text-lg font-bold tracking-tight cursor-pointer">Concepful</span>
              </Link>
              <div className="text-[11px] text-muted-foreground">
                {activeProjectId ? activeProjectTitle ?? "Project" : "Client Portal"}
              </div>
            </div>
            <div className="flex items-center gap-1">
              {openTodos > 0 && (
                <div className="h-5 min-w-5 px-1 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
                  {openTodos}
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
                location === "/dashboard" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary",
              )}>
                <LayoutDashboard className="h-3.5 w-3.5" /> Overview
              </button>
            </Link>
            <Link href={secondTabHref}>
              <button className={cn(
                "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors max-w-[110px] truncate",
                (location === "/dashboard/requests" || isOnProject) ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary",
              )}>
                <SecondIcon className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{secondTabLabel}</span>
              </button>
            </Link>
          </div>

          {/* Actions header */}
          <div className="px-3 py-2 border-b flex items-center justify-between shrink-0">
            <div className="flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Actions</span>
            </div>
            <div className="flex items-center gap-1">
              {/* Sort */}
              <div className="relative group">
                <button className="h-6 w-6 rounded flex items-center justify-center text-muted-foreground hover:bg-secondary transition-colors">
                  <ArrowUpDown className="h-3 w-3" />
                </button>
                <div className="absolute right-0 top-7 hidden group-hover:flex flex-col bg-popover border rounded-xl shadow-lg z-50 min-w-24 py-1">
                  {(["newest","oldest","kind"] as const).map(s => (
                    <button key={s} onClick={() => { setPingSort(s); setPingPage(1); }}
                      className={cn(
                        "text-xs px-3 py-1.5 text-left hover:bg-secondary transition-colors capitalize",
                        pingSort === s && "font-semibold text-primary",
                      )}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              {/* New Action */}
              <button
                onClick={() => {
                  if (composing) { setComposing(false); }
                  else { setComposing(true); setActivePingState(null); }
                }}
                className={cn(
                  "h-6 w-6 rounded-lg flex items-center justify-center transition-colors",
                  composing ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary",
                )}>
                {composing ? <X className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
              </button>
            </div>
          </div>

          {/* Kind filter */}
          <div className="px-3 py-1.5 flex gap-0.5 shrink-0 border-b flex-wrap">
            {(["all","message","todo","media"] as const).map(k => (
              <button key={k} onClick={() => { setFilterKind(k); setPingPage(1); }}
                className={cn(
                  "text-[11px] px-2 py-0.5 rounded-full font-medium capitalize transition-all",
                  filterKind === k ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground",
                )}>
                {k === "all" ? "All" : KIND_META[k].label}
              </button>
            ))}
          </div>

          {/* Action list */}
          <div className="flex-1 overflow-y-auto min-h-0">
            {pagedPings.length === 0 ? (
              <div className="py-10 text-center text-xs text-muted-foreground px-4">
                No actions yet.{!composing && <><br /><button className="text-primary font-semibold mt-1" onClick={() => setComposing(true)}>Create one →</button></>}
              </div>
            ) : (
              pagedPings.map(ping => (
                <ActionItem
                  key={ping.id}
                  ping={ping}
                  isActive={activePing?.id === ping.id}
                  onClick={() => {
                    if (activePing?.id === ping.id) { setActivePingState(null); }
                    else { setActivePing(ping); }
                  }}
                />
              ))
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="border-t px-3 py-2 flex items-center justify-between shrink-0">
              <button onClick={() => setPingPage(p => Math.max(1, p - 1))} disabled={pingPage <= 1}
                className="h-6 w-6 rounded flex items-center justify-center text-muted-foreground hover:bg-secondary disabled:opacity-30 transition-colors">
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>
              <p className="text-[11px] text-muted-foreground">{pingPage} / {totalPages}</p>
              <button onClick={() => setPingPage(p => Math.min(totalPages, p + 1))} disabled={pingPage >= totalPages}
                className="h-6 w-6 rounded flex items-center justify-center text-muted-foreground hover:bg-secondary disabled:opacity-30 transition-colors">
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </aside>

        {/* ══ COLUMN 2: MIDDLE PANEL (slides in) ═════════ */}
        {showMiddle && (
          <div className="flex-1 border-r bg-card flex flex-col min-h-screen sticky top-0 max-h-screen z-10 animate-in slide-in-from-left-4 duration-200">
            {composing ? (
              <ComposePanel
                onSend={handleSend}
                onClose={() => setComposing(false)}
              />
            ) : activePing ? (
              <PingDetailPanel
                ping={activePing}
                onClose={() => { setActivePingState(null); }}
                onReply={handleReply}
                onMarkDone={() => handleMarkDone(activePing.id)}
              />
            ) : null}
          </div>
        )}

        {/* ══ COLUMN 3: MAIN CONTENT ══════════════════════ */}
        <main className={cn(
          "overflow-y-auto min-h-screen transition-all duration-200",
          showMiddle
            ? "w-[380px] shrink-0 p-4 md:p-6"   /* mobile-width when panel open */
            : "flex-1 p-6 md:p-10",
        )}>
          {children}
        </main>

      </div>
    </DashboardContext.Provider>
  );
}
