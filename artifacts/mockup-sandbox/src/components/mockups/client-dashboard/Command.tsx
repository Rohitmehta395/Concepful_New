import { AlertCircle, ArrowRight, Bell, CheckCircle2, ChevronRight, Clock, Layers, MessageSquare, Sparkles, TrendingUp, Zap } from "lucide-react";

const CORAL = "hsl(349,90%,54%)";
const NAVY  = "hsl(232,28%,11%)";
const NAVY2 = "hsl(232,25%,16%)";
const NAVY3 = "hsl(232,22%,22%)";

const COLUMNS = [
  {
    id: "brief",      label: "Brief",           color: "#6366f1",
    cards: [
      { name: "OOH Billboard Suite", sub: "Scope confirmed · starts Tue", gradient: "linear-gradient(135deg,#1e1b4b,#4338ca)" },
    ],
  },
  {
    id: "designing",  label: "In Production",    color: "#f59e0b",
    cards: [
      { name: "Social Templates ×12", sub: "Est. delivery Jun 16", gradient: "linear-gradient(135deg,#451a03,#b45309)" },
      { name: "Email Header Suite",   sub: "Est. delivery Jun 14", gradient: "linear-gradient(135deg,#0c1a38,#1e3a8a)" },
    ],
  },
  {
    id: "review",     label: "Ready to Review",  color: "#a78bfa",
    cards: [
      { name: "Moodboard v2",          sub: "Awaiting your review", gradient: "linear-gradient(135deg,#1a0533,#7c3aed)" },
    ],
  },
  {
    id: "approved",   label: "Approved",         color: "#22c55e",
    cards: [
      { name: "Campaign Hero v3",     sub: "Approved Jun 11",  gradient: "linear-gradient(135deg,#2d1b4e,#6b2fa0)" },
      { name: "Campaign Brief",       sub: "Approved Jun 4",   gradient: "linear-gradient(135deg,#052e1a,#065f46)" },
    ],
  },
  {
    id: "collateral", label: "Collateral",        color: CORAL,
    cards: [
      { name: "LinkedIn Banner",      sub: "Requested · In queue", gradient: "linear-gradient(135deg,#1e3a5f,#1d4ed8)" },
      { name: "Print Flyer A4",       sub: "Delivered Jun 10",  gradient: "linear-gradient(135deg,#0f3d2e,#059669)" },
    ],
  },
];

const ALERTS = [
  {
    icon: Sparkles, color: CORAL, bg: `${CORAL}15`,
    title: "Collateral ready to order",
    body: "Hero approved 2 days ago — 6 derivative formats are ready to request instantly.",
    cta: "Order now",
  },
  {
    icon: Clock, color: "#a78bfa", bg: "#a78bfa15",
    title: "Moodboard v2 needs your review",
    body: "Updated with bolder type pairing and revised colour territory. 2 min to review.",
    cta: "Review",
  },
  {
    icon: TrendingUp, color: "#22c55e", bg: "#22c55e15",
    title: "On track for Jun 20 delivery",
    body: "12 of 18 deliverables approved. Social templates arrive Friday.",
    cta: "See timeline",
  },
];

const ACTIVITY = [
  { who: "CT", body: "Hero artwork uploaded — v3 final lockup",   time: "2m"  },
  { who: "CT", body: "Social template set entered production",    time: "1h"  },
  { who: "SB", body: "Approved: Campaign Strategy Brief",        time: "2d"  },
];

export function Command() {
  return (
    <div className="flex h-screen font-['Inter'] overflow-hidden" style={{ background: NAVY }}>

      {/* ── Sidebar ─────────────────────────────── */}
      <aside className="w-[56px] flex flex-col items-center py-5 gap-4 shrink-0 border-r" style={{ borderColor: NAVY3 }}>
        <div className="h-8 w-8 rounded-xl flex items-center justify-center mb-2" style={{ background: CORAL }}>
          <span className="text-white text-[10px] font-black">C</span>
        </div>
        {[
          { icon: Layers,        active: true  },
          { icon: MessageSquare, active: false },
          { icon: Bell,          active: false },
        ].map(({ icon: Icon, active }, i) => (
          <button key={i} className="h-9 w-9 rounded-xl flex items-center justify-center transition-all"
            style={{ background: active ? `${CORAL}20` : "transparent" }}>
            <Icon className="h-4 w-4" style={{ color: active ? CORAL : "#475569" }} />
          </button>
        ))}
        <div className="mt-auto h-8 w-8 rounded-full flex items-center justify-center text-[10px] font-bold"
          style={{ background: NAVY3, color: "#94a3b8" }}>SB</div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">

        {/* Top bar */}
        <div className="flex items-center justify-between px-8 py-4 border-b shrink-0" style={{ borderColor: NAVY3 }}>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest mb-0.5" style={{ color: "#475569" }}>Q3 Campaign · Acme Inc.</p>
            <h1 className="text-base font-bold text-white font-['Poppins']">Command Centre</h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold px-3 py-1.5 rounded-full" style={{ background: `${CORAL}20`, color: CORAL }}>
              ● 3 items need attention
            </span>
          </div>
        </div>

        {/* Alert cards */}
        <div className="grid grid-cols-3 gap-4 px-8 py-5 shrink-0">
          {ALERTS.map((a, i) => (
            <div key={i} className="p-4 rounded-2xl" style={{ background: NAVY2, border: `1px solid ${NAVY3}` }}>
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: a.bg }}>
                  <a.icon className="h-4 w-4" style={{ color: a.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-white leading-snug">{a.title}</p>
                  <p className="text-[10px] mt-1 leading-relaxed" style={{ color: "#64748b" }}>{a.body}</p>
                  <button className="flex items-center gap-1 text-[10px] font-bold mt-2" style={{ color: a.color }}>
                    {a.cta} <ChevronRight className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pipeline Kanban */}
        <div className="flex-1 min-h-0 px-8 pb-5 overflow-hidden">
          <p className="text-[9px] font-bold uppercase tracking-widest mb-3" style={{ color: "#475569" }}>Production Pipeline</p>
          <div className="grid grid-cols-5 gap-3 h-full">
            {COLUMNS.map(col => (
              <div key={col.id} className="flex flex-col rounded-2xl overflow-hidden" style={{ background: NAVY2, border: `1px solid ${NAVY3}` }}>
                {/* Column header */}
                <div className="px-3 py-3 border-b flex items-center gap-2 shrink-0" style={{ borderColor: NAVY3 }}>
                  <div className="h-1.5 w-1.5 rounded-full" style={{ background: col.color }} />
                  <span className="text-[10px] font-bold" style={{ color: col.color }}>{col.label}</span>
                  <span className="ml-auto text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: `${col.color}15`, color: col.color }}>
                    {col.cards.length}
                  </span>
                </div>
                {/* Cards */}
                <div className="flex-1 overflow-y-auto p-2 space-y-2">
                  {col.cards.map((c, i) => (
                    <div key={i} className="rounded-xl overflow-hidden cursor-pointer group" style={{ border: `1px solid ${NAVY3}` }}>
                      <div className="h-10 w-full" style={{ background: c.gradient }} />
                      <div className="p-2.5" style={{ background: NAVY3 }}>
                        <p className="text-[10px] font-bold text-white leading-snug">{c.name}</p>
                        <p className="text-[9px] mt-0.5" style={{ color: "#475569" }}>{c.sub}</p>
                      </div>
                    </div>
                  ))}
                  {col.id === "approved" && (
                    <div className="rounded-xl p-2.5 flex items-center gap-1.5 cursor-pointer" style={{ background: `${CORAL}12`, border: `1px dashed ${CORAL}40` }}>
                      <Zap className="h-3 w-3" style={{ color: CORAL }} />
                      <p className="text-[9px] font-bold" style={{ color: CORAL }}>Request collateral →</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right: Activity ─────────────────────── */}
      <aside className="w-56 shrink-0 border-l flex flex-col" style={{ borderColor: NAVY3, background: NAVY2 }}>
        <div className="px-4 py-4 border-b shrink-0" style={{ borderColor: NAVY3 }}>
          <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "#475569" }}>Live Activity</p>
        </div>
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
          {ACTIVITY.map((a, i) => (
            <div key={i} className="flex gap-2.5">
              <div className="h-5 w-5 rounded-full shrink-0 flex items-center justify-center text-[8px] font-bold mt-0.5"
                style={{ background: NAVY3, color: "#94a3b8" }}>{a.who}</div>
              <div>
                <p className="text-[10px] leading-relaxed" style={{ color: "#94a3b8" }}>{a.body}</p>
                <p className="text-[9px] mt-0.5" style={{ color: "#475569" }}>{a.time} ago</p>
              </div>
            </div>
          ))}
        </div>
        {/* Quick message */}
        <div className="p-3 border-t" style={{ borderColor: NAVY3 }}>
          <textarea placeholder="Send a note…" className="w-full text-[11px] bg-transparent outline-none resize-none placeholder:text-[#334155]"
            style={{ color: "#94a3b8" }} rows={2} readOnly />
          <button className="w-full mt-2 py-1.5 rounded-lg text-[10px] font-bold text-white" style={{ background: CORAL }}>Send</button>
        </div>
      </aside>
    </div>
  );
}
