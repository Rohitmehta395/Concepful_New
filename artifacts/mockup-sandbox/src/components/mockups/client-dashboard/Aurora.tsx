import { CheckCircle2, MessageSquare, ChevronRight, Download, Clock, Sparkles, Bell } from "lucide-react";

const CORAL   = "hsl(349,90%,54%)";
const NAVY    = "hsl(232,28%,11%)";
const NAVY2   = "hsl(232,25%,16%)";
const NAVY3   = "hsl(232,22%,22%)";

const PROJECTS = [
  { id: 1, name: "Q3 Campaign", phase: "Design",    active: true  },
  { id: 2, name: "Investor Deck", phase: "Review",  active: false },
  { id: 3, name: "Brand Guide",  phase: "Brief",    active: false },
];

const DELIVERABLES = [
  { id: 1, type: "Image",  label: "Hero Artwork",      version: "v3 · Final",  gradient: "linear-gradient(135deg,#2d1b4e,#6b2fa0)",  status: "ready"   },
  { id: 2, type: "Figma",  label: "Moodboard",         version: "v2",          gradient: "linear-gradient(135deg,#1a3a5c,#1a6b8a)",  status: "ready"   },
  { id: 3, type: "Doc",    label: "Campaign Brief",    version: "v1",          gradient: "linear-gradient(135deg,#0f3d2e,#1a6b4a)",  status: "review"  },
];

const ACTIVITY = [
  { author: "Creative Team", msg: "Campaign hero artwork is ready for your approval", time: "2m ago",  dot: CORAL  },
  { author: "Creative Team", msg: "Updated moodboard — coral + editorial direction locked", time: "3h ago",  dot: "#60a5fa" },
  { author: "You",           msg: "Looks great! Can we tweak the typography a bit?",  time: "Yesterday", dot: "#a3e635" },
  { author: "Creative Team", msg: "Brief revised with your Q1 notes",                time: "2d ago",   dot: "#fb923c" },
];

export function Aurora() {
  return (
    <div className="flex h-screen font-['Inter'] overflow-hidden" style={{ background: NAVY, color: "#e2e8f0" }}>

      {/* ── Sidebar ─────────────────────────────── */}
      <aside className="w-[200px] flex flex-col shrink-0 border-r" style={{ borderColor: NAVY3, background: NAVY }}>
        {/* Logo */}
        <div className="px-5 py-5 border-b" style={{ borderColor: NAVY3 }}>
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg flex items-center justify-center" style={{ background: CORAL }}>
              <span className="text-white text-[10px] font-black">C</span>
            </div>
            <span className="text-sm font-bold text-white">Concepful</span>
          </div>
          <p className="text-[10px] mt-1" style={{ color: "#64748b" }}>Client Portal</p>
        </div>

        {/* Nav */}
        <div className="flex-1 px-3 py-4 space-y-0.5">
          {[
            { label: "Overview",     active: true  },
            { label: "Projects",     active: false },
            { label: "Collateral",   active: false },
            { label: "Messages",     active: false },
            { label: "Calendar",     active: false },
          ].map(n => (
            <button key={n.label} className="w-full flex items-center gap-2 px-2 py-2 rounded-lg text-xs transition-all text-left"
              style={{
                background: n.active ? `${CORAL}18` : "transparent",
                color: n.active ? CORAL : "#94a3b8",
                fontWeight: n.active ? 600 : 400,
              }}>
              <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ background: n.active ? CORAL : "transparent", border: n.active ? "none" : "1px solid #475569" }} />
              {n.label}
            </button>
          ))}
        </div>

        {/* Projects list */}
        <div className="px-3 pb-4">
          <p className="text-[9px] font-bold uppercase tracking-widest mb-2 px-2" style={{ color: "#475569" }}>Your Projects</p>
          {PROJECTS.map(p => (
            <button key={p.id} className="w-full flex items-center gap-2 px-2 py-2 rounded-lg text-left text-xs"
              style={{ background: p.active ? NAVY3 : "transparent", color: p.active ? "#e2e8f0" : "#64748b" }}>
              <span className="h-1.5 w-1.5 rounded-full shrink-0"
                style={{ background: p.active ? CORAL : "#334155" }} />
              <span className="truncate">{p.name}</span>
            </button>
          ))}
        </div>

        {/* User */}
        <div className="px-3 pb-4 mt-auto border-t pt-3" style={{ borderColor: NAVY3 }}>
          <div className="flex items-center gap-2 px-2">
            <div className="h-7 w-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white" style={{ background: "#334155" }}>SB</div>
            <div>
              <p className="text-[11px] font-semibold text-white leading-none">Sarah B.</p>
              <p className="text-[9px] mt-0.5" style={{ color: "#475569" }}>Acme Inc.</p>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Main ────────────────────────────────── */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Top bar */}
        <div className="flex items-center justify-between px-8 py-4 border-b shrink-0" style={{ borderColor: NAVY3 }}>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "#475569" }}>Active Project</p>
            <h1 className="text-lg font-bold text-white leading-tight mt-0.5">Q3 Campaign Asset System</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold" style={{ background: `${CORAL}20`, color: CORAL }}>
              <Sparkles className="h-3 w-3" /> 1 item ready to review
            </div>
            <button className="h-8 w-8 rounded-full flex items-center justify-center" style={{ background: NAVY3 }}>
              <Bell className="h-3.5 w-3.5" style={{ color: "#94a3b8" }} />
            </button>
          </div>
        </div>

        <div className="flex flex-1 min-h-0">

          {/* Center content */}
          <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6 min-w-0">

            {/* Phase track */}
            <div className="rounded-2xl p-5" style={{ background: NAVY2, border: `1px solid ${NAVY3}` }}>
              <div className="flex items-center justify-between mb-4">
                <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "#475569" }}>Project Phase</p>
                <span className="text-xs px-2.5 py-1 rounded-full font-semibold" style={{ background: `${CORAL}20`, color: CORAL }}>Design</span>
              </div>
              <div className="flex items-center gap-0">
                {["Discovery", "Brief", "Design", "Review", "Revisions", "Delivered"].map((phase, i) => {
                  const done = i < 2; const active = i === 2;
                  return (
                    <div key={phase} className="flex items-center flex-1">
                      <div className="flex flex-col items-center gap-1.5 flex-1">
                        <div className="h-6 w-6 rounded-full flex items-center justify-center text-[9px] font-bold"
                          style={{
                            background: done ? CORAL : active ? `${CORAL}30` : NAVY3,
                            border: active ? `2px solid ${CORAL}` : "none",
                            color: done ? "white" : active ? CORAL : "#475569",
                          }}>
                          {done ? "✓" : i + 1}
                        </div>
                        <span className="text-[9px] font-medium text-center whitespace-nowrap" style={{ color: active ? CORAL : done ? "#94a3b8" : "#475569" }}>{phase}</span>
                      </div>
                      {i < 5 && <div className="h-px w-full" style={{ background: done ? CORAL : NAVY3 }} />}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Deliverables */}
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: "#475569" }}>Deliverables</p>
              <div className="grid grid-cols-3 gap-3">
                {DELIVERABLES.map(d => (
                  <div key={d.id} className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${NAVY3}` }}>
                    <div className="h-28 relative flex items-center justify-center" style={{ background: d.gradient }}>
                      <span className="text-4xl opacity-20 font-black select-none">{d.type[0]}</span>
                      {d.status === "ready" && (
                        <div className="absolute top-2.5 right-2.5 flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full text-white" style={{ background: CORAL }}>
                          Ready
                        </div>
                      )}
                    </div>
                    <div className="p-3" style={{ background: NAVY2 }}>
                      <p className="text-[9px] font-bold uppercase tracking-wider mb-0.5" style={{ color: "#475569" }}>{d.type}</p>
                      <p className="text-sm font-semibold text-white leading-tight">{d.label}</p>
                      <p className="text-[10px] mt-0.5" style={{ color: "#64748b" }}>{d.version}</p>
                      <div className="flex gap-1.5 mt-3">
                        <button className="flex-1 text-[10px] font-bold py-1.5 rounded-lg" style={{ background: CORAL, color: "white" }}>Approve</button>
                        <button className="flex-1 text-[10px] font-bold py-1.5 rounded-lg" style={{ background: NAVY3, color: "#94a3b8" }}>Revise</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Right: Activity */}
          <aside className="w-72 shrink-0 border-l flex flex-col" style={{ borderColor: NAVY3, background: NAVY2 }}>
            <div className="px-5 py-4 border-b shrink-0" style={{ borderColor: NAVY3 }}>
              <div className="flex items-center gap-1.5">
                <MessageSquare className="h-3.5 w-3.5" style={{ color: CORAL }} />
                <p className="text-xs font-bold text-white">Activity</p>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
              {ACTIVITY.map((a, i) => (
                <div key={i} className="flex gap-3">
                  <div className="h-6 w-6 rounded-full shrink-0 flex items-center justify-center text-[9px] font-bold mt-0.5"
                    style={{ background: NAVY3, color: "#94a3b8" }}>
                    {a.author === "You" ? "Me" : "CT"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="text-[10px] font-bold text-white">{a.author}</span>
                      <span className="text-[9px]" style={{ color: "#475569" }}>{a.time}</span>
                    </div>
                    <p className="text-[11px] leading-relaxed" style={{ color: "#94a3b8" }}>{a.msg}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="px-4 py-3 border-t" style={{ borderColor: NAVY3 }}>
              <div className="flex gap-2">
                <input placeholder="Send a message…" className="flex-1 text-xs px-3 py-2 rounded-xl outline-none"
                  style={{ background: NAVY3, color: "#e2e8f0", border: `1px solid ${NAVY}` }} />
                <button className="h-8 w-8 rounded-xl flex items-center justify-center" style={{ background: CORAL }}>
                  <ChevronRight className="h-3.5 w-3.5 text-white" />
                </button>
              </div>
            </div>
          </aside>

        </div>
      </main>
    </div>
  );
}
