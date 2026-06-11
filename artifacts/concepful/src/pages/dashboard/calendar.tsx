import { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { loadPings, KIND_META, SUBTYPE_META, Ping } from "@/lib/pings";
import { cn } from "@/lib/utils";
import { Calendar as CalIcon, X, CheckSquare, Paperclip, Send, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

/* ══════════════════════════════════════════════════════
   HELPERS
══════════════════════════════════════════════════════ */
function formatDay(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric",
  });
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "numeric", minute: "2-digit",
  });
}

function groupByDay(pings: Ping[]): Array<{ day: string; items: Ping[] }> {
  const map = new Map<string, Ping[]>();
  for (const ping of pings) {
    const day = formatDay(ping.date);
    if (!map.has(day)) map.set(day, []);
    map.get(day)!.push(ping);
  }
  return Array.from(map.entries()).map(([day, items]) => ({ day, items }));
}

/* ══════════════════════════════════════════════════════
   STANDALONE ITEM CARD (in calendar grid)
══════════════════════════════════════════════════════ */
function ItemCard({ ping, onOpen }: { ping: Ping; onOpen: () => void }) {
  const m  = KIND_META[ping.kind];
  const sm = SUBTYPE_META[ping.subtype];

  return (
    <button onClick={onOpen}
      className={cn(
        "w-full flex items-start gap-3 p-3.5 rounded-xl border text-left transition-all hover:shadow-sm hover:border-border",
        ping.done ? "opacity-50 border-border/40 bg-secondary/10" : "border-border/50 bg-card hover:bg-card",
      )}>
      <div className={cn(
        "h-8 w-8 rounded-lg flex items-center justify-center text-sm border shrink-0 mt-0.5",
        m.bg, m.border,
      )}>
        {sm.emoji}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5">
          <span className={cn("text-[9px] font-bold uppercase tracking-wider", m.color)}>{sm.label}</span>
          {ping.author === "team" && (
            <span className="text-[9px] text-muted-foreground">· Team</span>
          )}
          <span className="text-[9px] text-muted-foreground ml-auto">{formatTime(ping.date)}</span>
        </div>
        <p className={cn(
          "text-xs font-semibold leading-snug line-clamp-2",
          ping.done && "line-through",
        )}>
          {ping.title || ping.body}
        </p>
        {ping.body && ping.title && (
          <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1">{ping.body}</p>
        )}
      </div>
    </button>
  );
}

/* ══════════════════════════════════════════════════════
   DETAIL MODAL
══════════════════════════════════════════════════════ */
function DetailModal({ ping, onClose, onMarkDone, onReply }: {
  ping: Ping;
  onClose: () => void;
  onMarkDone: () => void;
  onReply: (body: string) => void;
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
      <div className="w-full max-w-md bg-card rounded-2xl border shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-200"
        onClick={e => e.stopPropagation()}>

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
                {ping.author === "team" ? "Creative Team" : "You"} ·{" "}
                {new Date(ping.date).toLocaleDateString("en-US", {
                  month: "short", day: "numeric", hour: "numeric", minute: "2-digit",
                })}
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
        </div>

        <div className="border-t px-5 py-4 bg-secondary/20 space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Reply</p>
          <div className="relative">
            <Textarea value={reply} onChange={e => setReply(e.target.value)}
              placeholder="Type a response… (⌘+Enter)"
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
   CALENDAR PAGE
══════════════════════════════════════════════════════ */
export default function CalendarPage() {
  const [pings, setPings] = useState(() => loadPings());
  const [selected, setSelected] = useState<Ping | null>(null);

  const standalone = pings.filter(p => !p.projectId);
  const groups = groupByDay(standalone);

  const handleMarkDone = (id: string) => {
    setPings(prev => prev.map(p => p.id === id ? { ...p, done: true } : p));
    setSelected(prev => prev?.id === id ? { ...prev, done: true } : prev);
  };

  const handleReply = (body: string) => {
    setSelected(null);
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto pb-20 space-y-8">

        {/* Header */}
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="h-9 w-9 rounded-xl bg-primary/[0.08] border border-primary/20 flex items-center justify-center">
              <CalIcon className="h-4.5 w-4.5 text-primary" />
            </div>
            <h1 className="font-serif text-2xl font-bold">Calendar</h1>
          </div>
          <p className="text-sm text-muted-foreground ml-12">
            Activities outside of projects — to-dos, messages, and notes.
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 px-4 py-3 bg-secondary/20 rounded-xl border border-border/40">
          <p className="text-xs font-semibold text-muted-foreground">Other activities</p>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-primary" />
            <span className="text-[11px] text-muted-foreground">{standalone.filter(p => !p.done).length} active</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckSquare className="h-3 w-3 text-muted-foreground/40" />
            <span className="text-[11px] text-muted-foreground">{standalone.filter(p => p.done).length} completed</span>
          </div>
        </div>

        {/* Grouped by day */}
        {groups.length === 0 ? (
          <div className="text-center py-20">
            <CalIcon className="h-10 w-10 text-muted-foreground/20 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No standalone activities yet.</p>
            <p className="text-xs text-muted-foreground mt-1">
              Actions not linked to a project will appear here.
            </p>
          </div>
        ) : (
          groups.map(({ day, items }) => (
            <div key={day} className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-border/50" />
                <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground whitespace-nowrap">
                  {day}
                </p>
                <div className="h-px flex-1 bg-border/50" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {items.map(ping => (
                  <ItemCard
                    key={ping.id}
                    ping={ping}
                    onOpen={() => setSelected(ping)}
                  />
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {selected && (
        <DetailModal
          ping={selected}
          onClose={() => setSelected(null)}
          onMarkDone={() => handleMarkDone(selected.id)}
          onReply={handleReply}
        />
      )}
    </DashboardLayout>
  );
}
