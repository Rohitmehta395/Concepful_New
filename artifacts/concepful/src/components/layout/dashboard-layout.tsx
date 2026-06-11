import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useLocation } from "wouter";
import {
  MessageSquare, CheckSquare, Paperclip, Plus, X,
  Settings, LayoutDashboard, ChevronDown,
  ChevronLeft, ChevronRight, ArrowUpDown,
  Folder, Send, Zap, Calendar, Hash,
  AtSign, Slash, Check, User,
} from "lucide-react";
import { useListWorkRequests } from "@workspace/api-client-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Ping, PingKind, PingSubtype,
  loadPings, savePings, addPing,
  KIND_META, SUBTYPE_META,
} from "@/lib/pings";
import { DashboardContext, useDashboard } from "@/lib/dashboard-context";

/* ══════════════════════════════════════════════════════
   CONSTANTS
══════════════════════════════════════════════════════ */
const KIND_SUBTYPES: Record<PingKind, PingSubtype[]> = {
  message: ["chat", "note", "followup"],
  todo:    ["task", "project", "meeting"],
  media:   ["document", "asset"],
};

const PINGS_PER_PAGE = 12;

const SLASH_COMMANDS = [
  { subtype: "chat"     as PingSubtype, kind: "message" as PingKind, label: "Chat",      emoji: "💬", desc: "Start a conversation thread"  },
  { subtype: "note"     as PingSubtype, kind: "message" as PingKind, label: "Note",      emoji: "📝", desc: "Save a reference or thought"   },
  { subtype: "followup" as PingSubtype, kind: "message" as PingKind, label: "Follow-up", emoji: "🔔", desc: "Set a follow-up reminder"       },
  { subtype: "task"     as PingSubtype, kind: "todo"    as PingKind, label: "Task",      emoji: "✓",  desc: "Create an action item"         },
  { subtype: "meeting"  as PingSubtype, kind: "todo"    as PingKind, label: "Meeting",   emoji: "◷",  desc: "Log or schedule a meeting"     },
  { subtype: "document" as PingSubtype, kind: "media"   as PingKind, label: "Document",  emoji: "▤",  desc: "Attach or reference a document" },
  { subtype: "asset"    as PingSubtype, kind: "media"   as PingKind, label: "Asset",     emoji: "⊞",  desc: "Link a media asset"            },
] as const;

const PEOPLE = [
  { key: "creative-team", label: "Creative Team", role: "Team"   },
  { key: "alex",          label: "Alex Chen",     role: "Admin"  },
  { key: "sarah",         label: "Sarah Kim",     role: "PM"     },
  { key: "you",           label: "You",           role: "Client" },
];

const SEED_PROJECTS = [
  { id: "1", title: "Q3 Campaign Asset System" },
  { id: "2", title: "Investor Deck" },
  { id: "3", title: "Brand Voice Guidelines" },
  { id: "4", title: "Social Media Template Pack" },
];

/* ══════════════════════════════════════════════════════
   HELPERS
══════════════════════════════════════════════════════ */
function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

type TriggerResult = { trigger: "/" | "#" | "@"; query: string; start: number } | null;

function detectTrigger(text: string): TriggerResult {
  for (let i = text.length - 1; i >= 0; i--) {
    const ch = text[i] as string;
    if (ch === "/" || ch === "#" || ch === "@") {
      if (i === 0 || /\s/.test(text[i - 1])) {
        const query = text.slice(i + 1).toLowerCase();
        if (!/\s/.test(query)) {
          return { trigger: ch as "/" | "#" | "@", query, start: i };
        }
      }
    }
    if (/\s/.test(ch)) break;
  }
  return null;
}

function getKnownProjects(): Array<{ id: string; title: string }> {
  try {
    const stored = JSON.parse(localStorage.getItem("concepful_projects") ?? "null");
    return stored?.length ? stored : SEED_PROJECTS;
  } catch { return SEED_PROJECTS; }
}

/* ══════════════════════════════════════════════════════
   SMART COMPOSE TEXTAREA
══════════════════════════════════════════════════════ */
function SmartComposeTextarea({
  value, onChange, placeholder, onCommandSelect, onProjectLink, className,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  onCommandSelect: (kind: PingKind, subtype: PingSubtype) => void;
  onProjectLink: (projectId: string, projectTitle: string) => void;
  className?: string;
}) {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const knownProjects = useRef(getKnownProjects());

  const trig = detectTrigger(value);

  const slashMatches = trig?.trigger === "/"
    ? SLASH_COMMANDS.filter(c => c.label.toLowerCase().startsWith(trig.query))
    : [];
  const projectMatches = trig?.trigger === "#"
    ? knownProjects.current.filter(p => p.title.toLowerCase().includes(trig.query))
    : [];
  const peopleMatches = trig?.trigger === "@"
    ? PEOPLE.filter(p => p.label.toLowerCase().startsWith(trig.query))
    : [];

  const hasSuggestions = slashMatches.length + projectMatches.length + peopleMatches.length > 0;
  const totalCount = slashMatches.length + projectMatches.length + peopleMatches.length;

  useEffect(() => { setSelectedIdx(0); }, [trig?.query, trig?.trigger]);

  const selectItem = useCallback((idx: number) => {
    if (!trig) return;
    if (trig.trigger === "/" && idx < slashMatches.length) {
      const cmd = slashMatches[idx];
      onCommandSelect(cmd.kind, cmd.subtype);
      onChange(value.slice(0, trig.start));
    } else if (trig.trigger === "#" && idx < projectMatches.length) {
      const proj = projectMatches[idx];
      onProjectLink(proj.id, proj.title);
      onChange(value.slice(0, trig.start) + `#${proj.title} `);
    } else if (trig.trigger === "@" && idx < peopleMatches.length) {
      const person = peopleMatches[idx];
      onChange(value.slice(0, trig.start) + `@${person.label} `);
    }
    setSelectedIdx(0);
  }, [trig, slashMatches, projectMatches, peopleMatches, value, onChange, onCommandSelect, onProjectLink]);

  return (
    <div className="relative">
      <Textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn("text-sm resize-none", className)}
        onKeyDown={e => {
          if (!hasSuggestions) return;
          if (e.key === "ArrowDown") { e.preventDefault(); setSelectedIdx(i => Math.min(i + 1, totalCount - 1)); }
          if (e.key === "ArrowUp")   { e.preventDefault(); setSelectedIdx(i => Math.max(i - 1, 0)); }
          if (e.key === "Enter")     { e.preventDefault(); selectItem(selectedIdx); }
          if (e.key === "Escape" && trig) { onChange(value.slice(0, trig.start)); }
        }}
      />

      {/* Floating suggestions dropdown */}
      {hasSuggestions && (
        <div className="absolute left-0 right-0 bottom-full mb-2 bg-popover border border-border rounded-xl shadow-2xl z-50 overflow-hidden animate-in slide-in-from-bottom-1 duration-100">
          <div className="flex items-center gap-2 px-3 py-2 border-b border-border/50">
            {trig?.trigger === "/" && <Slash   className="h-3 w-3 text-muted-foreground" />}
            {trig?.trigger === "#" && <Hash    className="h-3 w-3 text-muted-foreground" />}
            {trig?.trigger === "@" && <AtSign  className="h-3 w-3 text-muted-foreground" />}
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              {trig?.trigger === "/" ? "Action type" : trig?.trigger === "#" ? "Link project" : "Mention person"}
            </p>
          </div>
          {trig?.trigger === "/" && slashMatches.map((cmd, i) => (
            <button key={cmd.subtype} onMouseDown={e => { e.preventDefault(); selectItem(i); }}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors",
                i === selectedIdx ? "bg-secondary" : "hover:bg-secondary/60",
              )}>
              <span className="text-base shrink-0 w-6 text-center">{cmd.emoji}</span>
              <div>
                <p className="text-sm font-semibold leading-none mb-0.5">{cmd.label}</p>
                <p className="text-[11px] text-muted-foreground">{cmd.desc}</p>
              </div>
            </button>
          ))}
          {trig?.trigger === "#" && projectMatches.map((proj, i) => (
            <button key={proj.id} onMouseDown={e => { e.preventDefault(); selectItem(i); }}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors",
                i === selectedIdx ? "bg-secondary" : "hover:bg-secondary/60",
              )}>
              <Folder className="h-4 w-4 text-muted-foreground shrink-0" />
              <p className="text-sm font-medium">{proj.title}</p>
            </button>
          ))}
          {trig?.trigger === "@" && peopleMatches.map((person, i) => (
            <button key={person.key} onMouseDown={e => { e.preventDefault(); selectItem(i); }}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors",
                i === selectedIdx ? "bg-secondary" : "hover:bg-secondary/60",
              )}>
              <div className="h-6 w-6 rounded-full bg-secondary flex items-center justify-center shrink-0">
                <User className="h-3 w-3 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium leading-none mb-0.5">{person.label}</p>
                <p className="text-[10px] text-muted-foreground">{person.role}</p>
              </div>
            </button>
          ))}
          <div className="px-3 py-1.5 border-t border-border/40 flex items-center gap-2">
            <p className="text-[9px] text-muted-foreground">↑↓ navigate · Enter select · Esc close</p>
          </div>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   COMPOSE PANEL
══════════════════════════════════════════════════════ */
function ComposePanel({ onSend, onClose }: {
  onSend: (p: Omit<Ping, "id" | "date">) => void;
  onClose: () => void;
}) {
  const [kind,      setKind]      = useState<PingKind>("message");
  const [subtype,   setSubtype]   = useState<PingSubtype>("chat");
  const [title,     setTitle]     = useState("");
  const [body,      setBody]      = useState("");
  const [linkedProject, setLinkedProject] = useState<{ id: string; title: string } | null>(null);
  const { activeProjectId, activeProjectTitle } = useDashboard();

  const effectiveProjectId = linkedProject?.id ?? activeProjectId?.toString();
  const effectiveProjectTitle = linkedProject?.title ?? activeProjectTitle;

  const subtypes = KIND_SUBTYPES[kind];

  const handleKind = (k: PingKind) => {
    setKind(k);
    setSubtype(KIND_SUBTYPES[k][0]);
  };

  const handleCommandSelect = (k: PingKind, s: PingSubtype) => {
    setKind(k);
    setSubtype(s);
  };

  const handleProjectLink = (projectId: string, projectTitle: string) => {
    setLinkedProject({ id: projectId, title: projectTitle });
  };

  const handleSend = () => {
    if (!title.trim() && !body.trim()) return;
    onSend({
      kind, subtype,
      title: title.trim() || body.slice(0, 60),
      body: body.trim(),
      author: "client",
      projectId: effectiveProjectId,
    });
    setTitle(""); setBody(""); setLinkedProject(null);
  };

  const kindDefs = [
    { k: "message" as PingKind, Icon: MessageSquare, label: "Message" },
    { k: "todo"    as PingKind, Icon: CheckSquare,   label: "Task"    },
    { k: "media"   as PingKind, Icon: Paperclip,     label: "File"    },
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="px-5 py-4 border-b shrink-0 flex items-center justify-between">
        <div>
          <p className="font-semibold text-sm">New Action</p>
          <p className="text-[11px] text-muted-foreground">
            Use <span className="font-mono text-primary">/</span> for type · <span className="font-mono text-primary">#</span> to link project · <span className="font-mono text-primary">@</span> to mention
          </p>
        </div>
        <button onClick={onClose}
          className="h-7 w-7 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-secondary transition-colors">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4">
        {/* Kind chips */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Type</p>
          <div className="grid grid-cols-3 gap-1.5">
            {kindDefs.map(({ k, Icon, label }) => {
              const m = KIND_META[k];
              return (
                <button key={k} onClick={() => handleKind(k)}
                  className={cn(
                    "flex flex-col items-center gap-1 p-2.5 rounded-xl border-2 transition-all text-xs font-semibold",
                    kind === k
                      ? cn("border-primary bg-primary/[0.06]", m.color)
                      : "border-border/50 text-muted-foreground hover:border-border",
                  )}>
                  <Icon className="h-3.5 w-3.5" />
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
                    "flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium transition-all border",
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

        {/* Subject */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Subject</p>
          <Input value={title} onChange={e => setTitle(e.target.value)}
            placeholder="Brief subject line…" className="text-sm" />
        </div>

        {/* Smart body */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Details</p>
          <SmartComposeTextarea
            value={body}
            onChange={setBody}
            placeholder={`Type / for type · # to link project · @ to mention…`}
            onCommandSelect={handleCommandSelect}
            onProjectLink={handleProjectLink}
            className="min-h-[100px]"
          />
          <p className="text-[10px] text-muted-foreground mt-1.5">⌘+Enter to send</p>
        </div>

        {/* Project link indicator */}
        {effectiveProjectId && (
          <div className="flex items-center gap-2 text-xs p-2.5 bg-secondary/30 rounded-xl border border-border/40">
            <Folder className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <span className="font-medium text-foreground truncate">{effectiveProjectTitle ?? "Project"}</span>
            {linkedProject && (
              <button onClick={() => setLinkedProject(null)} className="ml-auto text-muted-foreground hover:text-foreground">
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
        )}
      </div>

      <div className="px-5 py-4 border-t shrink-0">
        <Button className="w-full gap-2" onClick={handleSend}
          disabled={!body.trim() && !title.trim()}>
          <Send className="h-3.5 w-3.5" /> Create Action
        </Button>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   STANDALONE ITEM MODAL
══════════════════════════════════════════════════════ */
function StandaloneItemModal({ ping, onClose, onReply, onMarkDone }: {
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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}>
      <div
        className="w-full max-w-md bg-card rounded-2xl border shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-200"
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <div className="flex items-center gap-3">
            <div className={cn("h-9 w-9 rounded-xl flex items-center justify-center text-lg border shrink-0", m.bg, m.border)}>
              {sm.emoji}
            </div>
            <div>
              <p className={cn("text-[10px] font-bold uppercase tracking-wide", m.color)}>
                {m.label} · {sm.label}
              </p>
              <p className="text-[10px] text-muted-foreground">
                {ping.author === "team" ? "Creative Team" : "You"} · {timeAgo(ping.date)}
              </p>
            </div>
          </div>
          <button onClick={onClose}
            className="h-7 w-7 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-secondary transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-5 space-y-4">
          <h3 className="font-serif text-lg font-bold leading-snug">{ping.title}</h3>
          {ping.body && <p className="text-sm text-foreground/80 leading-relaxed">{ping.body}</p>}

          {ping.fileName && (
            <div className="inline-flex items-center gap-2 border rounded-xl px-3 py-2 text-sm font-medium bg-secondary/40">
              <Paperclip className="h-3.5 w-3.5 text-muted-foreground" /> {ping.fileName}
            </div>
          )}

          {ping.kind === "todo" && (
            <button onClick={onMarkDone} disabled={ping.done}
              className={cn(
                "flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full border transition-all",
                ping.done
                  ? "bg-primary/10 text-primary border-primary/20 cursor-default"
                  : "border-border/60 text-muted-foreground hover:border-primary hover:text-primary",
              )}>
              <Check className="h-3.5 w-3.5" />
              {ping.done ? "Completed" : "Mark complete"}
            </button>
          )}

          <p className="text-[10px] text-muted-foreground pt-1">
            {new Date(ping.date).toLocaleDateString("en-US", {
              weekday: "long", month: "long", day: "numeric",
              hour: "numeric", minute: "2-digit",
            })}
          </p>
        </div>

        {/* Reply area */}
        <div className="border-t px-5 py-4 bg-secondary/20 space-y-2.5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Reply</p>
          <div className="relative">
            <Textarea
              value={reply} onChange={e => setReply(e.target.value)}
              placeholder="Type a response… (⌘+Enter to send)"
              className="text-sm resize-none min-h-[56px] pr-10"
              onKeyDown={e => { if (e.key === "Enter" && e.metaKey) handleReply(); }}
            />
            <button onClick={handleReply} disabled={!reply.trim()}
              className="absolute right-2 bottom-2 h-7 w-7 rounded-lg flex items-center justify-center bg-primary text-primary-foreground disabled:opacity-30 hover:bg-primary/90 transition-all">
              <Send className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   ACTION ITEM ROW
══════════════════════════════════════════════════════ */
function ActionItem({ ping, isActive, onClick }: {
  ping: Ping;
  isActive: boolean;
  onClick: () => void;
}) {
  const m  = KIND_META[ping.kind];
  const sm = SUBTYPE_META[ping.subtype];
  const hasProject = !!ping.projectId;

  return (
    <button onClick={onClick}
      className={cn(
        "w-full flex items-start gap-2.5 px-3 py-2.5 text-left transition-colors border-b border-border/30 last:border-0 group",
        isActive ? "bg-primary/[0.07]" : "hover:bg-secondary/40",
      )}>
      <div className={cn(
        "h-7 w-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 text-sm border relative",
        m.bg, m.border,
      )}>
        {sm.emoji}
        {/* Unread dot */}
        {ping.kind === "todo" && ping.done === false && (
          <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-primary border-2 border-card" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1 mb-0.5">
          <span className={cn("text-[9px] font-bold uppercase tracking-wider", m.color)}>{sm.label}</span>
          {ping.author === "team" && (
            <span className="text-[9px] text-muted-foreground/70">· Team</span>
          )}
          {hasProject && (
            <span className="text-[9px] text-muted-foreground/50">· Project</span>
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

/* ══════════════════════════════════════════════════════
   DASHBOARD LAYOUT
══════════════════════════════════════════════════════ */
export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();

  /* Nav expansion */
  const [navExpanded, setNavExpanded] = useState(() => {
    try { return localStorage.getItem("concepful_nav_expanded") !== "false"; } catch { return true; }
  });
  const toggleNav = () => {
    setNavExpanded(n => {
      const next = !n;
      try { localStorage.setItem("concepful_nav_expanded", String(next)); } catch {}
      return next;
    });
  };

  /* Project list for nav */
  const { data: workRequests } = useListWorkRequests(
    { query: { queryKey: ["nav-requests", 1] } },
    { request: { query: { companyId: 1 } } },
  );
  const navProjects = workRequests?.map(r => ({ id: String(r.id), title: r.title })) ?? getKnownProjects();

  /* Context */
  const [activeProjectId,    setActiveProjectId]    = useState<number | null>(null);
  const [activeProjectTitle, setActiveProjectTitle] = useState<string | null>(null);

  const setActiveProject = (id: number | null, title: string | null) => {
    setActiveProjectId(id);
    setActiveProjectTitle(title);
  };

  /* Action stream */
  const [pings,      setPings]      = useState<Ping[]>(() => loadPings());
  const [pingPage,   setPingPage]   = useState(1);
  const [pingSort,   setPingSort]   = useState<"newest" | "oldest" | "kind">("newest");
  const [filterKind, setFilterKind] = useState<PingKind | "all">("all");
  const [composing,  setComposing]  = useState(false);

  /* Standalone modal (for non-project pings) */
  const [standaloneModal, setStandaloneModal] = useState<Ping | null>(null);

  useEffect(() => { savePings(pings); }, [pings]);

  /* setActivePing — smart navigation */
  const setActivePing = useCallback((ping: Ping | null) => {
    if (!ping) { setStandaloneModal(null); return; }
    if (ping.projectId) {
      const projectPath = `/dashboard/project/${ping.projectId}`;
      if (location.startsWith(projectPath)) {
        // Already on this project page — scroll to the ping
        setTimeout(() => {
          document.getElementById(`ping-${ping.id}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
        }, 50);
      } else {
        setLocation(`${projectPath}?pingId=${ping.id}`);
      }
    } else {
      setStandaloneModal(ping);
    }
  }, [location, setLocation]);

  /* Handlers */
  const handleSend = (ping: Omit<Ping, "id" | "date">) => {
    const updated = addPing(pings, ping);
    setPings(updated);
    setComposing(false);
  };

  const handleReply = (body: string, sourcePing: Ping) => {
    const newPing = {
      kind: "message" as const, subtype: "chat" as const,
      title: body.slice(0, 60), body,
      author: "client" as const,
      projectId: sourcePing.projectId,
    };
    setPings(prev => addPing(prev, newPing));
    setStandaloneModal(null);
  };

  const handleMarkDone = (id: string) => {
    setPings(prev => prev.map(p => p.id === id ? { ...p, done: true } : p));
    setStandaloneModal(prev => prev?.id === id ? { ...prev, done: true } : prev);
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

  /* Middle column only for composing */
  const showMiddle = composing;

  const ctx = { activePing: null, setActivePing, activeProjectId, activeProjectTitle, setActiveProject };

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
                {activeProjectId ? (activeProjectTitle ?? "Project") : "Client Portal"}
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

          {/* Main nav */}
          <div className="px-2 pt-2 pb-1.5 border-b shrink-0 space-y-0.5">

            {/* Dashboard + project dropdown */}
            <div>
              <div className="flex items-center">
                <Link href="/dashboard" className="flex-1 min-w-0">
                  <button className={cn(
                    "w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs font-semibold transition-colors",
                    location === "/dashboard"
                      ? "bg-primary/[0.08] text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/50",
                  )}>
                    <LayoutDashboard className="h-3.5 w-3.5 shrink-0" />
                    <span className="flex-1 text-left">Dashboard</span>
                  </button>
                </Link>
                <button onClick={toggleNav}
                  className="h-6 w-6 rounded-md flex items-center justify-center text-muted-foreground hover:bg-secondary transition-colors shrink-0 ml-0.5">
                  <ChevronDown className={cn("h-3 w-3 transition-transform duration-200", navExpanded && "rotate-180")} />
                </button>
              </div>

              {navExpanded && navProjects.length > 0 && (
                <div className="ml-3 mt-0.5 pl-2.5 border-l border-border/30 space-y-0.5">
                  {navProjects.map(proj => (
                    <Link key={proj.id} href={`/dashboard/project/${proj.id}`}>
                      <button className={cn(
                        "w-full flex items-center gap-2 px-2 py-1 rounded-lg text-[11px] transition-colors text-left",
                        location === `/dashboard/project/${proj.id}`
                          ? "text-primary font-semibold bg-primary/[0.06]"
                          : "text-muted-foreground hover:text-foreground hover:bg-secondary/40",
                      )}>
                        <div className={cn(
                          "h-1.5 w-1.5 rounded-full shrink-0",
                          location === `/dashboard/project/${proj.id}` ? "bg-primary" : "bg-muted-foreground/40",
                        )} />
                        <span className="truncate">{proj.title}</span>
                      </button>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Secondary nav items */}
            {([
              { href: "/dashboard/calendar", icon: Calendar,      label: "Calendar" },
              { href: "/dashboard/messages", icon: MessageSquare, label: "Messages" },
              { href: "/dashboard/media",    icon: Paperclip,     label: "Media"    },
            ] as const).map(({ href, icon: Icon, label }) => (
              <Link key={href} href={href}>
                <button className={cn(
                  "w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs font-medium transition-colors",
                  location.startsWith(href)
                    ? "bg-primary/[0.08] text-primary font-semibold"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/50",
                )}>
                  <Icon className="h-3.5 w-3.5 shrink-0" />
                  {label}
                </button>
              </Link>
            ))}
          </div>

          {/* Actions header */}
          <div className="px-3 py-2 border-b flex items-center justify-between shrink-0">
            <div className="flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Actions</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="relative group">
                <button className="h-6 w-6 rounded flex items-center justify-center text-muted-foreground hover:bg-secondary transition-colors">
                  <ArrowUpDown className="h-3 w-3" />
                </button>
                <div className="absolute right-0 top-7 hidden group-hover:flex flex-col bg-popover border rounded-xl shadow-lg z-50 min-w-24 py-1">
                  {(["newest", "oldest", "kind"] as const).map(s => (
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
              <button
                onClick={() => setComposing(c => !c)}
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
            {(["all", "message", "todo", "media"] as const).map(k => (
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
                No actions yet.
                {!composing && (
                  <>
                    <br />
                    <button className="text-primary font-semibold mt-1" onClick={() => setComposing(true)}>
                      Create one →
                    </button>
                  </>
                )}
              </div>
            ) : (
              pagedPings.map(ping => (
                <ActionItem
                  key={ping.id}
                  ping={ping}
                  isActive={false}
                  onClick={() => {
                    if (ping.projectId) {
                      const projectPath = `/dashboard/project/${ping.projectId}`;
                      if (location.startsWith(projectPath)) {
                        setTimeout(() => {
                          document.getElementById(`ping-${ping.id}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
                        }, 50);
                      } else {
                        setLocation(`${projectPath}?pingId=${ping.id}`);
                      }
                    } else {
                      setStandaloneModal(ping);
                    }
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

        {/* ══ COLUMN 2: COMPOSE PANEL (only when composing) ══ */}
        {showMiddle && (
          <div className="flex-1 border-r bg-card flex flex-col min-h-screen sticky top-0 max-h-screen z-10 animate-in slide-in-from-left-4 duration-200">
            <ComposePanel onSend={handleSend} onClose={() => setComposing(false)} />
          </div>
        )}

        {/* ══ COLUMN 3: MAIN CONTENT ══════════════════════ */}
        <main className={cn(
          "overflow-y-auto min-h-screen transition-all duration-200",
          showMiddle ? "w-[380px] shrink-0 p-4 md:p-6" : "flex-1 p-6 md:p-10",
        )}>
          {children}
        </main>

      </div>

      {/* ══ STANDALONE ITEM MODAL ══════════════════════════ */}
      {standaloneModal && (
        <StandaloneItemModal
          ping={standaloneModal}
          onClose={() => setStandaloneModal(null)}
          onReply={body => handleReply(body, standaloneModal)}
          onMarkDone={() => handleMarkDone(standaloneModal.id)}
        />
      )}

    </DashboardContext.Provider>
  );
}
