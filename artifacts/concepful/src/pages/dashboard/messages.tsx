import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { loadPings, savePings, Ping, SUBTYPE_META, KIND_META } from "@/lib/pings";
import { cn } from "@/lib/utils";
import {
  MessageSquare, Search, Send, X, Inbox,
  Plus, FolderOpen, Sparkles, FileText,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

/* ══════════════════════════════════════════════════════
   HELPERS
══════════════════════════════════════════════════════ */
function timeAgo(iso: string) {
  const d = Date.now() - new Date(iso).getTime();
  const m = Math.floor(d / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

const SEED_PROJECTS = [
  { id: "1", title: "Q3 Campaign Asset System" },
  { id: "2", title: "Investor Deck" },
  { id: "3", title: "Brand Voice Guidelines" },
  { id: "4", title: "Social Media Template Pack" },
];

function getKnownProjects(): Array<{ id: string; title: string }> {
  try {
    const stored: Array<{ id: string; title: string }> = JSON.parse(
      localStorage.getItem("concepful_projects") ?? "[]",
    );
    if (stored.length > 0) return stored;
  } catch {}
  return SEED_PROJECTS;
}

function getProjectName(projectId?: string): string | null {
  if (!projectId) return null;
  const known = getKnownProjects();
  return known.find(p => p.id === projectId)?.title
    ?? SEED_PROJECTS.find(p => p.id === projectId)?.title
    ?? `Project #${projectId}`;
}

/* ══════════════════════════════════════════════════════
   SELECTION TOOLBAR
   Floats above any text selected inside the conversation
══════════════════════════════════════════════════════ */
function SelectionToolbar({
  text, x, y, onAddToProject, onStartProject, onNewRequest, onDismiss,
}: {
  text: string;
  x: number; y: number;
  onAddToProject: () => void;
  onStartProject: () => void;
  onNewRequest: () => void;
  onDismiss: () => void;
}) {
  return (
    <div
      className="fixed z-[70] animate-in fade-in slide-in-from-bottom-1 duration-150"
      style={{ left: x, top: y - 8, transform: "translateX(-50%) translateY(-100%)" }}
      onMouseDown={e => e.preventDefault()}
    >
      <div className="flex items-center gap-0.5 bg-gray-900 text-white rounded-xl px-1 py-1 shadow-2xl border border-white/10">
        <button
          onClick={onAddToProject}
          className="flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1.5 rounded-lg hover:bg-white/15 transition-colors whitespace-nowrap"
        >
          <FolderOpen className="h-3 w-3 text-primary" />
          Add to project
        </button>
        <div className="w-px h-4 bg-white/10 mx-0.5" />
        <button
          onClick={onStartProject}
          className="flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1.5 rounded-lg hover:bg-white/15 transition-colors whitespace-nowrap"
        >
          <Sparkles className="h-3 w-3 text-yellow-400" />
          Start project
        </button>
        <div className="w-px h-4 bg-white/10 mx-0.5" />
        <button
          onClick={onNewRequest}
          className="flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1.5 rounded-lg hover:bg-white/15 transition-colors whitespace-nowrap"
        >
          <Plus className="h-3 w-3 text-green-400" />
          New request
        </button>
      </div>
      {/* Caret */}
      <div className="flex justify-center mt-[-1px]">
        <div className="w-0 h-0 border-l-[5px] border-r-[5px] border-t-[5px] border-l-transparent border-r-transparent border-t-gray-900" />
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   PROJECT PICKER (for "Add to project")
══════════════════════════════════════════════════════ */
function ProjectPicker({
  onPick, onCancel,
}: {
  onPick: (projectId: string) => void;
  onCancel: () => void;
}) {
  const projects = getKnownProjects();
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={onCancel}>
      <div className="bg-card rounded-2xl border shadow-2xl p-4 min-w-[240px] animate-in zoom-in-95 duration-150"
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Add to project</p>
          <button onClick={onCancel} className="text-muted-foreground hover:text-foreground">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
        <div className="space-y-1">
          {projects.map(p => (
            <button key={p.id} onClick={() => onPick(p.id)}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm hover:bg-secondary transition-colors text-left">
              <FolderOpen className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              {p.title}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   CONVERSATION MODAL
   Full thread for messages in same project (or standalone)
══════════════════════════════════════════════════════ */
function ConversationModal({
  seed, allPings, onClose, onAddPing, onNavigate,
}: {
  seed: Ping;
  allPings: Ping[];
  onClose: () => void;
  onAddPing: (p: Ping) => void;
  onNavigate: (path: string) => void;
}) {
  const [reply, setReply] = useState("");
  const threadRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  /* Build thread: all messages sharing the same projectId (or all standalone) */
  const thread = useMemo(() =>
    allPings
      .filter(p => p.kind === "message" && p.projectId === seed.projectId)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
  [allPings, seed.projectId]);

  const proj = getProjectName(seed.projectId);

  /* Scroll to bottom on open */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  /* Text selection detection */
  const [selCtx, setSelCtx] = useState<{ text: string; x: number; y: number } | null>(null);
  const [showPicker, setShowPicker] = useState(false);

  useEffect(() => {
    const handle = () => {
      const sel = window.getSelection();
      const txt = sel?.toString().trim() ?? "";
      if (txt && sel?.rangeCount && threadRef.current?.contains(sel.anchorNode)) {
        const rect = sel.getRangeAt(0).getBoundingClientRect();
        setSelCtx({ text: txt, x: rect.left + rect.width / 2, y: rect.top });
      } else if (!txt) {
        setSelCtx(null);
      }
    };
    document.addEventListener("selectionchange", handle);
    return () => document.removeEventListener("selectionchange", handle);
  }, []);

  /* Reply */
  const send = useCallback(() => {
    if (!reply.trim()) return;
    onAddPing({
      id: crypto.randomUUID(), kind: "message", subtype: "chat",
      title: reply.slice(0, 60), body: reply, author: "client",
      projectId: seed.projectId, date: new Date().toISOString(),
    });
    setReply("");
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
  }, [reply, seed.projectId, onAddPing]);

  /* Selection actions */
  const handleAddToProject = (projectId: string) => {
    const sel = selCtx?.text ?? "";
    onAddPing({
      id: crypto.randomUUID(), kind: "message", subtype: "note",
      title: sel.slice(0, 80), body: sel, author: "client",
      projectId, date: new Date().toISOString(),
    });
    setShowPicker(false);
    setSelCtx(null);
    window.getSelection()?.removeAllRanges();
  };

  const handleStartProject = () => {
    const txt = selCtx?.text ?? "";
    sessionStorage.setItem("concepful_new_request_brief", txt);
    setSelCtx(null);
    onClose();
    onNavigate("/dashboard/requests");
  };

  const handleNewRequest = () => {
    const txt = selCtx?.text ?? "";
    sessionStorage.setItem("concepful_new_request_brief", txt);
    setSelCtx(null);
    onClose();
    onNavigate("/dashboard/requests");
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
        <div className="w-full max-w-lg bg-card rounded-2xl border shadow-2xl flex flex-col"
          style={{ maxHeight: "min(80vh, 640px)" }}>

          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b shrink-0">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-xl bg-primary/[0.08] border border-primary/20 flex items-center justify-center">
                <MessageSquare className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-bold leading-none">{proj ?? "General"}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  {thread.length} message{thread.length !== 1 ? "s" : ""}
                  {proj && (
                    <button onClick={() => onNavigate(`/dashboard/project/${seed.projectId}`)}
                      className="ml-2 text-primary hover:underline">
                      View project →
                    </button>
                  )}
                </p>
              </div>
            </div>
            <button onClick={onClose}
              className="h-7 w-7 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-secondary transition-colors">
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Hint */}
          <div className="px-5 py-2 border-b bg-secondary/20 shrink-0">
            <p className="text-[10px] text-muted-foreground">
              Select any text in the conversation to add it to a project, start a new project, or create a request.
            </p>
          </div>

          {/* Thread */}
          <div ref={threadRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-4 min-h-0">
            {thread.map((msg, i) => {
              const isTeam   = msg.author === "team";
              const sm       = SUBTYPE_META[msg.subtype];
              const prevMsg  = thread[i - 1];
              const showDate = !prevMsg || fmtDate(prevMsg.date) !== fmtDate(msg.date);

              return (
                <div key={msg.id}>
                  {showDate && (
                    <div className="flex items-center gap-3 my-2">
                      <div className="h-px flex-1 bg-border/30" />
                      <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
                        {fmtDate(msg.date)}
                      </span>
                      <div className="h-px flex-1 bg-border/30" />
                    </div>
                  )}
                  <div className={cn("flex gap-2.5 items-end", isTeam ? "justify-start" : "justify-end")}>
                    {isTeam && (
                      <div className="h-7 w-7 rounded-full bg-secondary border border-border/50 flex items-center justify-center text-[9px] font-bold text-muted-foreground shrink-0 mb-0.5">
                        CT
                      </div>
                    )}
                    <div className={cn(
                      "max-w-[78%] space-y-1",
                      isTeam ? "items-start" : "items-end",
                    )}>
                      <div className={cn(
                        "rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed select-text cursor-text",
                        isTeam
                          ? "bg-secondary/60 text-foreground rounded-tl-sm"
                          : "bg-primary text-primary-foreground rounded-tr-sm",
                      )}>
                        <div className={cn(
                          "text-[9px] font-bold uppercase tracking-wider mb-1.5",
                          isTeam ? "text-muted-foreground" : "text-primary-foreground/60",
                        )}>
                          {sm.label}
                        </div>
                        {msg.title && msg.title !== msg.body && msg.body && (
                          <p className="font-semibold mb-1 text-[13px]">{msg.title}</p>
                        )}
                        <p className="leading-relaxed">{msg.body || msg.title}</p>
                      </div>
                      <p className={cn(
                        "text-[9px] text-muted-foreground px-1",
                        isTeam ? "text-left" : "text-right",
                      )}>
                        {fmtTime(msg.date)}
                      </p>
                    </div>
                    {!isTeam && (
                      <div className="h-7 w-7 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-[9px] font-bold text-primary shrink-0 mb-0.5">
                        Me
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>

          {/* Reply */}
          <div className="border-t px-4 py-3 bg-secondary/10 shrink-0">
            <div className="relative">
              <Textarea
                value={reply}
                onChange={e => setReply(e.target.value)}
                placeholder="Reply to this conversation… (⌘+Enter to send)"
                className="text-sm resize-none min-h-[44px] pr-10 bg-background"
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

      {/* Selection toolbar */}
      {selCtx && !showPicker && (
        <SelectionToolbar
          text={selCtx.text}
          x={selCtx.x}
          y={selCtx.y}
          onAddToProject={() => setShowPicker(true)}
          onStartProject={handleStartProject}
          onNewRequest={handleNewRequest}
          onDismiss={() => setSelCtx(null)}
        />
      )}

      {/* Project picker */}
      {showPicker && (
        <ProjectPicker
          onPick={handleAddToProject}
          onCancel={() => { setShowPicker(false); setSelCtx(null); }}
        />
      )}
    </>
  );
}

/* ══════════════════════════════════════════════════════
   MESSAGE LIST CARD
══════════════════════════════════════════════════════ */
function MessageCard({ ping, threadCount, onClick }: {
  ping: Ping;
  threadCount: number;
  onClick: () => void;
}) {
  const sm   = SUBTYPE_META[ping.subtype];
  const m    = KIND_META[ping.kind];
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
      {/* Thread count badge */}
      {threadCount > 1 && (
        <div className="flex items-center gap-1 shrink-0 mt-1">
          <MessageSquare className="h-3 w-3 text-muted-foreground/40" />
          <span className="text-[9px] text-muted-foreground">{threadCount}</span>
        </div>
      )}
    </button>
  );
}

/* ══════════════════════════════════════════════════════
   MESSAGES PAGE
══════════════════════════════════════════════════════ */
type MFilter = "all" | "chat" | "note" | "followup";
const FILTERS: Array<{ key: MFilter; label: string }> = [
  { key: "all",      label: "All" },
  { key: "chat",     label: "Chat" },
  { key: "note",     label: "Note" },
  { key: "followup", label: "Follow-up" },
];

export default function Messages() {
  const [, setLocation]    = useLocation();
  const [pings,    setPings]    = useState(() => loadPings());
  const [filter,   setFilter]   = useState<MFilter>("all");
  const [search,   setSearch]   = useState("");
  const [selected, setSelected] = useState<Ping | null>(null);

  const all = pings.filter(p => p.kind === "message");

  /* Group messages by projectId to get thread counts */
  const threadMap = useMemo(() => {
    const map: Record<string, number> = {};
    all.forEach(p => {
      const key = p.projectId ?? "__standalone__";
      map[key] = (map[key] ?? 0) + 1;
    });
    return map;
  }, [all]);

  /* One card per conversation thread (de-dupe by projectId) */
  const threads = useMemo(() => {
    const seen = new Set<string>();
    const result: Ping[] = [];
    const sorted = [...all].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    for (const p of sorted) {
      const key = p.projectId ?? `__${p.id}__`;
      if (!seen.has(key)) {
        seen.add(key);
        result.push(p);
      }
    }
    return result;
  }, [all]);

  const filtered = useMemo(() => threads
    .filter(p => filter === "all" || p.subtype === filter)
    .filter(p => {
      if (!search) return true;
      const q = search.toLowerCase();
      return p.title.toLowerCase().includes(q) || p.body.toLowerCase().includes(q);
    }),
  [threads, filter, search]);

  const handleAddPing = useCallback((p: Ping) => {
    const updated = [...pings, p];
    setPings(updated);
    savePings(updated);
  }, [pings]);

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
            { label: "Total",     value: stats.total    },
            { label: "Chat",      value: stats.chat     },
            { label: "Note",      value: stats.note     },
            { label: "Follow-up", value: stats.followup },
          ].map(s => (
            <div key={s.label} className="bg-card border border-border/50 rounded-xl p-3">
              <p className="text-xl font-bold font-serif">{s.value}</p>
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Filter + search */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-0.5 p-1 bg-secondary/30 rounded-xl border border-border/40">
            {FILTERS.map(f => (
              <button key={f.key} onClick={() => setFilter(f.key)}
                className={cn(
                  "px-3 py-1 rounded-lg text-xs font-medium transition-all",
                  filter === f.key ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground",
                )}>
                {f.label}
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

        {/* Thread list */}
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
              <MessageCard
                key={ping.id}
                ping={ping}
                threadCount={threadMap[ping.projectId ?? `__${ping.id}__`] ?? 1}
                onClick={() => setSelected(ping)}
              />
            ))}
          </div>
        )}
      </div>

      {selected && (
        <ConversationModal
          seed={selected}
          allPings={pings}
          onClose={() => setSelected(null)}
          onAddPing={p => { handleAddPing(p); }}
          onNavigate={path => { setSelected(null); setLocation(path); }}
        />
      )}
    </DashboardLayout>
  );
}
