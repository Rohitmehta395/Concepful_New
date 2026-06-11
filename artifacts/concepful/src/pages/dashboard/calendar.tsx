import { useState, useCallback } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { loadPings, savePings, Ping, KIND_META, SUBTYPE_META } from "@/lib/pings";
import { cn } from "@/lib/utils";
import {
  Calendar as CalIcon, ChevronLeft, ChevronRight, X, Send,
  Check, Paperclip, Clock, Layers,
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

/* ══════════════════════════════════════════════════════
   HELPERS
══════════════════════════════════════════════════════ */
const DAYS_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS     = ["January","February","March","April","May","June","July","August","September","October","November","December"];

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

function formatRelative(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60) return `${Math.max(0,m)}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric",
    hour: "numeric", minute: "2-digit",
  });
}

function isoDateStr(d: Date): string {
  return d.toISOString().split("T")[0];
}

/* ── Calendar grid builder ── */
type CalDay = {
  date: Date;
  iso: string;
  isCurrentMonth: boolean;
  isToday: boolean;
  pings: Ping[];
};

function buildMonthGrid(year: number, month: number, pings: Ping[]): CalDay[][] {
  const today = new Date();
  const firstOfMonth = new Date(year, month, 1);
  const lastOfMonth  = new Date(year, month + 1, 0);

  const start = new Date(firstOfMonth);
  start.setDate(start.getDate() - start.getDay()); // Go back to Sunday

  const weeks: CalDay[][] = [];
  const cursor = new Date(start);

  while (cursor <= lastOfMonth || weeks.length < 5) {
    const week: CalDay[] = [];
    for (let d = 0; d < 7; d++) {
      const iso = isoDateStr(cursor);
      const dayPings = pings.filter(p => {
        const eventDate = new Date(p.scheduledDate ?? p.date);
        return isoDateStr(eventDate) === iso;
      });
      week.push({
        date: new Date(cursor),
        iso,
        isCurrentMonth: cursor.getMonth() === month,
        isToday: cursor.toDateString() === today.toDateString(),
        pings: dayPings,
      });
      cursor.setDate(cursor.getDate() + 1);
    }
    weeks.push(week);
    if (cursor > lastOfMonth && cursor.getDay() === 0) break;
  }
  return weeks;
}

/* ══════════════════════════════════════════════════════
   DETAIL MODAL (for calendar day items + history items)
══════════════════════════════════════════════════════ */
function DetailModal({ ping, onClose, onMarkDone, onSetDate, onReply }: {
  ping: Ping;
  onClose: () => void;
  onMarkDone: () => void;
  onSetDate: (date: string | undefined) => void;
  onReply: (body: string) => void;
}) {
  const [reply, setReply] = useState("");
  const m  = KIND_META[ping.kind];
  const sm = SUBTYPE_META[ping.subtype];
  const proj = getProjectName(ping.projectId);
  const canSchedule = ping.kind === "todo" || ping.subtype === "note";

  const send = () => {
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
                {ping.author === "team" ? "Creative Team" : "You"} · {formatRelative(ping.date)}
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

          {/* Schedule date */}
          {canSchedule && (
            <div className="space-y-1.5">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                <Clock className="h-3 w-3" /> Schedule on Calendar
              </p>
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={ping.scheduledDate ? ping.scheduledDate.split("T")[0] : ""}
                  onChange={e => onSetDate(e.target.value ? `${e.target.value}T09:00:00.000Z` : undefined)}
                  className="flex-1 text-sm border border-border/60 rounded-xl px-3 py-1.5 bg-background focus:outline-none focus:border-primary transition-colors"
                />
                {ping.scheduledDate && (
                  <button onClick={() => onSetDate(undefined)}
                    className="text-[10px] text-muted-foreground hover:text-foreground transition-colors">
                    Clear
                  </button>
                )}
              </div>
              {ping.scheduledDate && (
                <p className="text-[10px] text-primary font-medium">
                  ✓ Scheduled for {new Date(ping.scheduledDate).toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
                </p>
              )}
            </div>
          )}
        </div>

        <div className="border-t px-5 py-4 bg-secondary/20 space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Reply</p>
          <div className="relative">
            <Textarea value={reply} onChange={e => setReply(e.target.value)}
              placeholder="Type a response… (⌘+Enter)"
              className="text-sm resize-none min-h-[52px] pr-10"
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

/* ══════════════════════════════════════════════════════
   HISTORY ROW
══════════════════════════════════════════════════════ */
function HistoryRow({ ping, onClick }: { ping: Ping; onClick: () => void }) {
  const m    = KIND_META[ping.kind];
  const sm   = SUBTYPE_META[ping.subtype];
  const proj = getProjectName(ping.projectId);

  return (
    <button onClick={onClick}
      className="w-full flex items-start gap-3 py-3 px-3 rounded-xl hover:bg-secondary/30 transition-colors text-left group border border-transparent hover:border-border/40">
      <div className={cn(
        "h-7 w-7 rounded-lg flex items-center justify-center text-sm border shrink-0 mt-0.5",
        m.bg, m.border,
      )}>
        {sm.emoji}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-0.5">
          <span className={cn("text-[9px] font-bold uppercase tracking-wider", m.color)}>{sm.label}</span>
          {proj && (
            <span className="text-[9px] border border-border/50 px-1.5 py-0.5 rounded-full text-muted-foreground truncate max-w-[120px]">
              {proj}
            </span>
          )}
          {ping.scheduledDate && (
            <span className="text-[9px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-medium flex items-center gap-0.5">
              <Clock className="h-2 w-2" />
              {new Date(ping.scheduledDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </span>
          )}
        </div>
        <p className={cn(
          "text-xs font-semibold leading-snug line-clamp-1",
          ping.done && "line-through text-muted-foreground",
        )}>
          {ping.title || ping.body}
        </p>
        {ping.body && ping.title && (
          <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1">{ping.body}</p>
        )}
      </div>
      <span className="text-[9px] text-muted-foreground shrink-0 mt-1">{formatRelative(ping.date)}</span>
    </button>
  );
}

/* ══════════════════════════════════════════════════════
   CALENDAR PAGE
══════════════════════════════════════════════════════ */
export default function CalendarPage() {
  const today = new Date();
  const [pings,        setPings]       = useState(() => loadPings());
  const [year,         setYear]        = useState(today.getFullYear());
  const [month,        setMonth]       = useState(today.getMonth());
  const [selectedDay,  setSelectedDay] = useState<string | null>(null);
  const [selected,     setSelected]    = useState<Ping | null>(null);
  const [historyFilter, setHistoryFilter] = useState<"all" | "scheduled">("all");

  /* calendar grid */
  const grid = buildMonthGrid(year, month, pings);

  /* navigate months */
  const prevMonth = () => {
    if (month === 0) { setYear(y => y - 1); setMonth(11); }
    else setMonth(m => m - 1);
    setSelectedDay(null);
  };
  const nextMonth = () => {
    if (month === 11) { setYear(y => y + 1); setMonth(0); }
    else setMonth(m => m + 1);
    setSelectedDay(null);
  };

  /* selected day pings */
  const selectedDayPings = selectedDay
    ? pings.filter(p => isoDateStr(new Date(p.scheduledDate ?? p.date)) === selectedDay)
    : [];

  /* history feed — all pings sorted by date desc */
  const historyPings = [...pings]
    .filter(p => historyFilter === "all" || p.scheduledDate)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  /* ping update helpers */
  const updatePing = useCallback((id: string, patch: Partial<Ping>) => {
    setPings(prev => {
      const updated = prev.map(p => p.id === id ? { ...p, ...patch } : p);
      savePings(updated);
      return updated;
    });
    setSelected(prev => prev?.id === id ? { ...prev, ...patch } : prev);
  }, []);

  const handleMarkDone = (id: string) => updatePing(id, { done: true });
  const handleSetDate  = (id: string, d: string | undefined) => updatePing(id, { scheduledDate: d });

  const handleReply = (body: string, src: Ping) => {
    const newPing: Ping = {
      id: crypto.randomUUID(), kind: "message", subtype: "chat",
      title: body.slice(0, 60), body, author: "client",
      projectId: src.projectId, date: new Date().toISOString(),
    };
    const updated = [newPing, ...pings];
    setPings(updated);
    savePings(updated);
    setSelected(null);
  };

  /* stats */
  const scheduled = pings.filter(p => p.scheduledDate).length;
  const upcoming  = pings.filter(p => p.scheduledDate && new Date(p.scheduledDate) >= today).length;

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto pb-20 space-y-8">

        {/* Header */}
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="h-10 w-10 rounded-xl bg-primary/[0.08] border border-primary/20 flex items-center justify-center">
              <CalIcon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="font-serif text-2xl font-bold leading-none">Calendar</h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                {scheduled} scheduled · {upcoming} upcoming
              </p>
            </div>
          </div>
        </div>

        {/* ── Month grid ── */}
        <div className="bg-card border border-border/50 rounded-2xl overflow-hidden">
          {/* Month nav */}
          <div className="flex items-center justify-between px-5 py-3 border-b bg-secondary/10">
            <button onClick={prevMonth}
              className="h-7 w-7 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-secondary transition-colors">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <p className="font-serif text-base font-bold">
              {MONTHS[month]} {year}
            </p>
            <button onClick={nextMonth}
              className="h-7 w-7 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-secondary transition-colors">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 border-b">
            {DAYS_SHORT.map(d => (
              <div key={d} className="py-2 text-center text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                {d}
              </div>
            ))}
          </div>

          {/* Day cells */}
          {grid.map((week, wi) => (
            <div key={wi} className="grid grid-cols-7">
              {week.map(day => {
                const isSelected = selectedDay === day.iso;
                const hasItems   = day.pings.length > 0;

                return (
                  <button key={day.iso}
                    onClick={() => setSelectedDay(isSelected ? null : day.iso)}
                    className={cn(
                      "relative min-h-[72px] p-1.5 border-b border-r border-border/20 last:border-r-0 transition-colors text-left",
                      !day.isCurrentMonth && "bg-secondary/5",
                      isSelected ? "bg-primary/[0.07] ring-1 ring-inset ring-primary/20" : "hover:bg-secondary/20",
                      wi === grid.length - 1 && "border-b-0",
                    )}>
                    {/* Day number */}
                    <span className={cn(
                      "inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold mb-1",
                      day.isToday      ? "bg-primary text-primary-foreground" :
                      !day.isCurrentMonth ? "text-muted-foreground/30" :
                                         "text-foreground",
                    )}>
                      {day.date.getDate()}
                    </span>

                    {/* Event pills */}
                    <div className="space-y-0.5">
                      {day.pings.slice(0, 3).map(p => {
                        const m  = KIND_META[p.kind];
                        const sm = SUBTYPE_META[p.subtype];
                        return (
                          <div key={p.id}
                            className={cn(
                              "flex items-center gap-1 text-[9px] font-medium px-1 py-0.5 rounded truncate",
                              p.kind === "todo" ? "bg-primary/10 text-primary" :
                              p.kind === "message" ? "bg-primary/[0.06] text-primary/80" :
                              "bg-secondary/60 text-muted-foreground",
                            )}>
                            <span className="text-[8px]">{sm.emoji}</span>
                            <span className="truncate leading-tight">{p.title || p.body}</span>
                          </div>
                        );
                      })}
                      {day.pings.length > 3 && (
                        <p className="text-[9px] text-muted-foreground pl-1">
                          +{day.pings.length - 3} more
                        </p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* ── Selected day panel ── */}
        {selectedDay && (
          <div className="animate-in slide-in-from-top-2 duration-200">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-bold">
                {new Date(selectedDay + "T12:00:00").toLocaleDateString("en-US", {
                  weekday: "long", month: "long", day: "numeric",
                })}
              </p>
              <button onClick={() => setSelectedDay(null)}
                className="text-[10px] text-muted-foreground hover:text-foreground transition-colors">
                Close
              </button>
            </div>
            {selectedDayPings.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                No activities on this day. Click a note or task and set this date to add it.
              </p>
            ) : (
              <div className="space-y-2">
                {selectedDayPings.map(ping => (
                  <HistoryRow key={ping.id} ping={ping} onClick={() => setSelected(ping)} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── History feed ── */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm font-bold">All Activity</p>
              <span className="text-[10px] text-muted-foreground bg-secondary/50 px-2 py-0.5 rounded-full">
                {historyPings.length} items
              </span>
            </div>
            <div className="flex items-center gap-1 p-0.5 bg-secondary/30 rounded-lg border border-border/40">
              {(["all", "scheduled"] as const).map(f => (
                <button key={f} onClick={() => setHistoryFilter(f)}
                  className={cn(
                    "px-2.5 py-1 rounded text-[10px] font-medium capitalize transition-all",
                    historyFilter === f ? "bg-background shadow-sm text-foreground" : "text-muted-foreground",
                  )}>
                  {f === "all" ? "All" : "Scheduled"}
                </button>
              ))}
            </div>
          </div>

          {historyPings.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No items to show. Try changing the filter.
            </p>
          ) : (
            <div className="divide-y divide-border/30">
              {historyPings.map((ping, i) => {
                const dateKey = new Date(ping.date).toLocaleDateString("en-US", {
                  month: "long", day: "numeric", year: "numeric",
                });
                const prevDateKey = i > 0
                  ? new Date(historyPings[i-1].date).toLocaleDateString("en-US", {
                      month: "long", day: "numeric", year: "numeric",
                    })
                  : null;
                const showDateSep = dateKey !== prevDateKey;

                return (
                  <div key={ping.id}>
                    {showDateSep && (
                      <div className="flex items-center gap-3 py-3">
                        <div className="h-px flex-1 bg-border/30" />
                        <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground whitespace-nowrap">
                          {dateKey}
                        </p>
                        <div className="h-px flex-1 bg-border/30" />
                      </div>
                    )}
                    <HistoryRow ping={ping} onClick={() => setSelected(ping)} />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Detail modal */}
      {selected && (
        <DetailModal
          ping={selected}
          onClose={() => setSelected(null)}
          onMarkDone={() => handleMarkDone(selected.id)}
          onSetDate={d => handleSetDate(selected.id, d)}
          onReply={body => handleReply(body, selected)}
        />
      )}
    </DashboardLayout>
  );
}
