import { useState, useMemo } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { loadPings, Ping, SUBTYPE_META, KIND_META } from "@/lib/pings";
import { cn } from "@/lib/utils";
import {
  Paperclip, Search, X, Send, Download,
  LayoutGrid, List, File, FileText, ImageIcon, ChevronRight, FolderOpen,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

/* ── helpers ── */
function timeAgo(iso: string) {
  const d = Date.now() - new Date(iso).getTime();
  const m = Math.floor(d / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function getProjectName(projectId?: string): string | null {
  if (!projectId) return null;
  try {
    const known: Array<{id:string;title:string}> = JSON.parse(localStorage.getItem("concepful_projects") ?? "[]");
    const f = known.find(p => p.id === projectId);
    if (f) return f.title;
  } catch {}
  const fallback: Record<string,string> = {
    "1": "Q3 Campaign Asset System", "2": "Investor Deck",
    "3": "Brand Voice Guidelines",   "4": "Social Media Template Pack",
  };
  return fallback[projectId] ?? `Project #${projectId}`;
}

function fileExt(filename?: string) {
  if (!filename) return "";
  return filename.split(".").pop()?.toUpperCase() ?? "";
}

function FileTypeIcon({ filename, className }: { filename?: string; className?: string }) {
  const ext = fileExt(filename);
  if (["PDF", "DOC", "DOCX"].includes(ext)) return <FileText className={cn("text-red-400", className)} />;
  if (["FIG", "XD", "SKETCH"].includes(ext)) return <ImageIcon className={cn("text-blue-400", className)} />;
  if (["MP4", "GIF", "MOV"].includes(ext)) return <ImageIcon className={cn("text-purple-400", className)} />;
  return <File className={cn("text-muted-foreground", className)} />;
}

/* ── Detail Modal ── */
function DetailModal({ ping, onClose }: { ping: Ping; onClose: () => void }) {
  const [reply, setReply] = useState("");
  const m  = KIND_META[ping.kind];
  const sm = SUBTYPE_META[ping.subtype];
  const proj = getProjectName(ping.projectId);

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
                {proj && <span className="ml-1">· {proj}</span>}
              </p>
            </div>
          </div>
          <button onClick={onClose}
            className="h-7 w-7 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-secondary transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="px-5 py-5 space-y-4">
          <h3 className="font-serif text-lg font-bold leading-snug">{ping.title}</h3>
          {ping.body && <p className="text-sm text-foreground/80 leading-relaxed">{ping.body}</p>}
          {ping.fileName && (
            <div className="flex items-center gap-3 p-3 border rounded-xl bg-secondary/30">
              <FileTypeIcon filename={ping.fileName} className="h-6 w-6 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{ping.fileName}</p>
                <p className="text-[10px] text-muted-foreground">{fileExt(ping.fileName)} file</p>
              </div>
              <button className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">
                <Download className="h-3.5 w-3.5" /> Download
              </button>
            </div>
          )}
          <p className="text-[10px] text-muted-foreground">
            {new Date(ping.date).toLocaleDateString("en-US", {
              weekday: "long", month: "long", day: "numeric", hour: "numeric", minute: "2-digit",
            })}
          </p>
        </div>
        <div className="border-t px-5 py-4 bg-secondary/20 space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Notes</p>
          <div className="relative">
            <Textarea value={reply} onChange={e => setReply(e.target.value)}
              placeholder="Add a note about this file…"
              className="text-sm resize-none min-h-[52px] pr-10"
            />
            <button disabled={!reply.trim()}
              className="absolute right-2 bottom-2 h-7 w-7 rounded-lg flex items-center justify-center bg-primary text-primary-foreground disabled:opacity-30 hover:bg-primary/90 transition-all">
              <Send className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Media Card (list) ── */
function MediaListCard({ ping, onClick }: { ping: Ping; onClick: () => void }) {
  const sm   = SUBTYPE_META[ping.subtype];
  const m    = KIND_META[ping.kind];
  const proj = getProjectName(ping.projectId);

  return (
    <button onClick={onClick}
      className="w-full flex items-center gap-4 p-3 bg-card border border-border/50 rounded-2xl text-left hover:border-border hover:shadow-sm transition-all group">
      {/* Thumbnail */}
      {ping.previewUrl ? (
        <div className="h-14 w-20 rounded-xl overflow-hidden border border-border/40 shrink-0 bg-secondary/20">
          <img src={ping.previewUrl} alt={ping.title}
            className="h-full w-full object-cover" />
        </div>
      ) : (
        <div className={cn(
          "h-14 w-14 rounded-xl flex items-center justify-center border shrink-0",
          m.bg, m.border,
        )}>
          <FileTypeIcon filename={ping.fileName} className="h-5 w-5" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
          <span className={cn("text-[9px] font-bold uppercase tracking-widest", m.color)}>{sm.label}</span>
          {proj && (
            <span className="text-[9px] px-1.5 py-0.5 rounded-full border border-border/50 text-muted-foreground font-medium truncate max-w-[130px]">
              {proj}
            </span>
          )}
          {ping.author === "team" && (
            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-secondary/60 text-muted-foreground font-medium">Team</span>
          )}
          <span className="text-[9px] text-muted-foreground ml-auto">{timeAgo(ping.date)}</span>
        </div>
        <p className="text-sm font-semibold line-clamp-1 leading-snug">{ping.title}</p>
        {ping.body && (
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{ping.body}</p>
        )}
        {ping.fileName && (
          <p className="text-[10px] text-muted-foreground/60 mt-0.5 flex items-center gap-1">
            <Paperclip className="h-2.5 w-2.5 shrink-0" />
            {ping.fileName}
          </p>
        )}
      </div>
      <ChevronRight className="h-4 w-4 text-muted-foreground/30 shrink-0 group-hover:text-muted-foreground transition-colors" />
    </button>
  );
}

/* ── Media Card (grid) ── */
function MediaGridCard({ ping, onClick }: { ping: Ping; onClick: () => void }) {
  const sm   = SUBTYPE_META[ping.subtype];
  const m    = KIND_META[ping.kind];
  const proj = getProjectName(ping.projectId);
  const ext  = fileExt(ping.fileName);

  return (
    <button onClick={onClick}
      className="flex flex-col bg-card border border-border/50 rounded-2xl overflow-hidden text-left hover:border-border hover:shadow-sm transition-all group">
      {/* Preview area */}
      {ping.previewUrl ? (
        <div className="h-36 relative overflow-hidden border-b">
          <img src={ping.previewUrl} alt={ping.title}
            className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300" />
          {ext && (
            <span className="absolute bottom-2 right-2 text-[9px] font-bold px-1.5 py-0.5 rounded bg-background/90 border text-muted-foreground backdrop-blur-sm">
              {ext}
            </span>
          )}
        </div>
      ) : (
        <div className={cn(
          "h-36 flex items-center justify-center border-b relative",
          m.bg,
        )}>
          <FileTypeIcon filename={ping.fileName} className="h-10 w-10 opacity-40" />
          {ext && (
            <span className="absolute bottom-2 right-2 text-[9px] font-bold px-1.5 py-0.5 rounded bg-background/80 border text-muted-foreground">
              {ext}
            </span>
          )}
        </div>
      )}
      {/* Meta */}
      <div className="p-3 space-y-1.5">
        <div className="flex items-center gap-1.5">
          <span className={cn("text-[8px] font-bold uppercase tracking-widest", m.color)}>{sm.label}</span>
          <span className="text-[8px] text-muted-foreground ml-auto">{timeAgo(ping.date)}</span>
        </div>
        <p className="text-xs font-semibold line-clamp-2 leading-snug">{ping.title}</p>
        {proj && (
          <p className="text-[9px] text-muted-foreground truncate">{proj}</p>
        )}
      </div>
    </button>
  );
}

/* ── MEDIA PAGE ── */
type MediaFilter = "all" | "document" | "asset";
const FILTERS: Array<{ key: MediaFilter; label: string }> = [
  { key: "all",      label: "All" },
  { key: "document", label: "Documents" },
  { key: "asset",    label: "Assets" },
];

export default function MediaPage() {
  const [pings,    _]          = useState(() => loadPings());
  const [filter,   setFilter]  = useState<MediaFilter>("all");
  const [search,   setSearch]  = useState("");
  const [viewMode, setViewMode]= useState<"list" | "grid">("list");
  const [selected, setSelected]= useState<Ping | null>(null);

  const all = pings.filter(p => p.kind === "media");

  const filtered = useMemo(() => all
    .filter(p => filter === "all" || p.subtype === filter)
    .filter(p => {
      if (!search) return true;
      const q = search.toLowerCase();
      return p.title.toLowerCase().includes(q) || (p.fileName ?? "").toLowerCase().includes(q);
    }),
  [all, filter, search]);

  const stats = {
    total:    all.length,
    docs:     all.filter(p => p.subtype === "document").length,
    assets:   all.filter(p => p.subtype === "asset").length,
    projects: [...new Set(all.filter(p => p.projectId).map(p => p.projectId))].length,
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto pb-20 space-y-6">

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-secondary flex items-center justify-center border">
            <Paperclip className="h-5 w-5 text-muted-foreground" />
          </div>
          <div>
            <h1 className="font-serif text-2xl font-bold leading-none">Media</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Documents and assets across all projects</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: "Total",    value: stats.total    },
            { label: "Documents",value: stats.docs     },
            { label: "Assets",   value: stats.assets   },
            { label: "Projects", value: stats.projects },
          ].map(s => (
            <div key={s.label} className="bg-card border border-border/50 rounded-xl p-3">
              <p className="text-xl font-bold font-serif">{s.value}</p>
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Controls */}
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
              </button>
            ))}
          </div>
          <div className="relative flex-1 min-w-[160px]">
            <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search files…" className="pl-8 text-sm h-8" />
          </div>
          <div className="flex items-center gap-0.5 p-0.5 bg-secondary/30 rounded-xl border border-border/40">
            <button onClick={() => setViewMode("list")}
              className={cn("h-7 w-7 rounded-lg flex items-center justify-center transition-colors",
                viewMode === "list" ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground")}>
              <List className="h-3.5 w-3.5" />
            </button>
            <button onClick={() => setViewMode("grid")}
              className={cn("h-7 w-7 rounded-lg flex items-center justify-center transition-colors",
                viewMode === "grid" ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground")}>
              <LayoutGrid className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Content */}
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <FolderOpen className="h-10 w-10 text-muted-foreground/20 mx-auto mb-3" />
            <p className="text-sm font-medium text-muted-foreground">
              {search ? "No files match your search" : "No media yet"}
            </p>
          </div>
        ) : viewMode === "list" ? (
          <div className="space-y-2">
            {filtered.map(ping => (
              <MediaListCard key={ping.id} ping={ping} onClick={() => setSelected(ping)} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {filtered.map(ping => (
              <MediaGridCard key={ping.id} ping={ping} onClick={() => setSelected(ping)} />
            ))}
          </div>
        )}
      </div>

      {selected && (
        <DetailModal ping={selected} onClose={() => setSelected(null)} />
      )}
    </DashboardLayout>
  );
}
