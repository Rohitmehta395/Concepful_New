import { ArrowRight, Bell, CheckCircle2, Clock, MessageSquare, Sparkles, Zap } from "lucide-react";

const CORAL  = "hsl(349,90%,54%)";
const NAVY   = "hsl(232,28%,11%)";

const PROJECTS = [
  {
    id: 1, name: "Q3 Campaign Asset System", type: "Campaign", phase: "Design",
    phaseColor: "#6366f1", phaseBg: "#6366f110",
    gradient: "linear-gradient(135deg,#2d1b4e 0%,#6b2fa0 50%,#ec4899 100%)",
    brief: "Coral + editorial photography. Bold type, dark navy base. Two visual territories: Momentum and Authority.",
    deliverables: [
      { label: "Hero v3",    done: true  },
      { label: "Moodboard",  done: true  },
      { label: "Social ×12", done: false },
      { label: "Print",      done: false },
    ],
    progress: 55, notif: 1,
    action: "approve" as const,
  },
  {
    id: 2, name: "Investor Deck Refresh", type: "Presentation", phase: "In Review",
    phaseColor: CORAL, phaseBg: `${CORAL}15`,
    gradient: "linear-gradient(135deg,#0f3d2e 0%,#065f46 50%,#059669 100%)",
    brief: "Clean, data-led. Slide 8 updated with Q1 actuals. Confident tone, whitespace-heavy layout.",
    deliverables: [
      { label: "Deck v3",    done: true  },
      { label: "Data slides", done: true  },
      { label: "Speaker notes", done: false },
    ],
    progress: 80, notif: 0,
    action: "review" as const,
  },
  {
    id: 3, name: "Brand Voice Guidelines", type: "Strategy", phase: "Brief",
    phaseColor: "#f59e0b", phaseBg: "#f59e0b15",
    gradient: "linear-gradient(135deg,#1e3a5f 0%,#1d4ed8 50%,#38bdf8 100%)",
    brief: "Define tone of voice across all touchpoints. Reference: Stripe, Linear. Warm but precise.",
    deliverables: [
      { label: "Discovery",  done: false },
      { label: "Voice doc",  done: false },
    ],
    progress: 20, notif: 0,
    action: null,
  },
];

const MESSAGES = [
  { from: "Creative Team", preview: "Hero artwork is ready for your approval — v3 final lockup.",    time: "2m",  unread: true  },
  { from: "Creative Team", preview: "Investor deck v3 — slide 8 updated with Q1 data.",             time: "3h",  unread: false },
  { from: "You",           preview: "Love the direction! Can we push the coral a bit more?",        time: "1d",  unread: false },
  { from: "Creative Team", preview: "Brand voice call notes attached — ready to scope.",            time: "2d",  unread: false },
];

const STATS = [
  { label: "Active",          val: "3",    color: CORAL       },
  { label: "In Review",       val: "1",    color: "#f59e0b"   },
  { label: "Delivered",       val: "8",    color: "#22c55e"   },
  { label: "Unread",          val: "3",    color: "#6366f1"   },
];

export function Hybrid() {
  return (
    <div className="min-h-screen font-['Inter'] bg-[#f8f9fc]">

      {/* ── Nav ─────────────────────────────────── */}
      <header className="bg-white border-b border-[#e2e8f0] px-8 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-xl flex items-center justify-center" style={{ background: CORAL }}>
            <span className="text-white text-xs font-black">C</span>
          </div>
          <div>
            <p className="text-sm font-bold leading-none" style={{ color: NAVY }}>Concepful</p>
            <p className="text-[10px] text-[#94a3b8] mt-0.5">Client Portal · Acme Inc.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <nav className="flex items-center gap-1">
            {["Overview", "Projects", "Collateral", "Messages"].map((item, i) => (
              <button key={item} className="px-3 py-1.5 rounded-lg text-xs font-medium"
                style={{ background: i === 0 ? `${CORAL}10` : "transparent", color: i === 0 ? CORAL : "#64748b" }}>
                {item}
              </button>
            ))}
          </nav>
          <div className="relative">
            <div className="h-8 w-8 rounded-full bg-[#f1f5f9] flex items-center justify-center">
              <Bell className="h-3.5 w-3.5 text-[#64748b]" />
            </div>
            <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full text-[9px] font-bold flex items-center justify-center text-white" style={{ background: CORAL }}>3</span>
          </div>
          <div className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ background: NAVY }}>SB</div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-8 py-8">

        {/* Greeting */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold font-['Poppins']" style={{ color: NAVY }}>Good afternoon, Sarah 👋</h1>
          <p className="text-[#64748b] text-sm mt-1">Here's everything happening across your projects.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {STATS.map(s => (
            <div key={s.label} className="bg-white rounded-2xl border border-[#e2e8f0] px-5 py-4 flex items-center gap-3">
              <div className="h-2 w-2 rounded-full shrink-0" style={{ background: s.color }} />
              <div>
                <p className="text-xl font-bold leading-none font-['Poppins']" style={{ color: NAVY }}>{s.val}</p>
                <p className="text-[10px] text-[#94a3b8] mt-0.5 font-medium">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-6">

          {/* ── Projects — 2 cols ─────────────────── */}
          <div className="col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold" style={{ color: NAVY }}>Your Projects</p>
              <button className="text-xs font-medium flex items-center gap-1" style={{ color: CORAL }}>
                View all <ArrowRight className="h-3 w-3" />
              </button>
            </div>

            {PROJECTS.map(proj => (
              <div key={proj.id}
                className="bg-white rounded-2xl border border-[#e2e8f0] overflow-hidden hover:border-[#cbd5e1] hover:shadow-sm transition-all cursor-pointer group">

                <div className="flex items-stretch">
                  {/* Gradient panel — Brief-style */}
                  <div className="w-24 shrink-0 flex flex-col items-center justify-center relative"
                    style={{ background: proj.gradient }}>
                    {proj.notif > 0 && (
                      <div className="absolute top-2.5 right-2.5 h-5 w-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white" style={{ background: CORAL }}>
                        {proj.notif}
                      </div>
                    )}
                    <span className="text-4xl opacity-10 font-black select-none">◈</span>
                  </div>

                  {/* Info panel */}
                  <div className="flex-1 p-5 min-w-0">
                    {/* Header row */}
                    <div className="flex items-start justify-between gap-2 mb-2.5">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[9px] font-bold uppercase tracking-widest text-[#94a3b8]">{proj.type}</span>
                          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full"
                            style={{ background: proj.phaseBg, color: proj.phaseColor }}>
                            {proj.phase}
                          </span>
                        </div>
                        <p className="text-sm font-bold leading-snug" style={{ color: NAVY }}>{proj.name}</p>
                      </div>
                    </div>

                    {/* Brief excerpt — the key addition from Brief */}
                    <p className="text-[11px] leading-relaxed mb-3 italic" style={{ color: "#64748b" }}>
                      "{proj.brief}"
                    </p>

                    {/* Deliverable chips */}
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {proj.deliverables.map(d => (
                        <span key={d.label} className="flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full"
                          style={{
                            background: d.done ? "#f0fdf4" : "#f8f9fc",
                            color: d.done ? "#22c55e" : "#94a3b8",
                            border: `1px solid ${d.done ? "#bbf7d0" : "#e2e8f0"}`,
                          }}>
                          {d.done && <CheckCircle2 className="h-2.5 w-2.5" />} {d.label}
                        </span>
                      ))}
                    </div>

                    {/* Progress + actions row */}
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-1.5 bg-[#f1f5f9] rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${proj.progress}%`, background: proj.phaseColor }} />
                      </div>
                      <span className="text-[10px] font-bold text-[#94a3b8] shrink-0">{proj.progress}%</span>

                      {proj.action === "approve" && (
                        <button className="shrink-0 text-[10px] font-bold px-3 py-1.5 rounded-lg text-white" style={{ background: CORAL }}>
                          Approve
                        </button>
                      )}
                      {proj.action === "review" && (
                        <button className="shrink-0 text-[10px] font-bold px-3 py-1.5 rounded-lg" style={{ background: `${CORAL}12`, color: CORAL }}>
                          Review
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* "Needs review" footer strip — only when awaiting */}
                {proj.action === "approve" && (
                  <div className="flex items-center justify-between px-5 py-2.5 border-t"
                    style={{ background: `${CORAL}05`, borderColor: `${CORAL}15` }}>
                    <div className="flex items-center gap-1.5">
                      <Sparkles className="h-3 w-3" style={{ color: CORAL }} />
                      <p className="text-[10px] font-semibold" style={{ color: CORAL }}>Hero artwork ready — your approval needed</p>
                    </div>
                    <ArrowRight className="h-3.5 w-3.5" style={{ color: CORAL }} />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* ── Messages sidebar ──────────────────── */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold" style={{ color: NAVY }}>Messages</p>
              <button className="text-xs font-medium" style={{ color: CORAL }}>View all</button>
            </div>
            <div className="bg-white rounded-2xl border border-[#e2e8f0] overflow-hidden divide-y divide-[#f1f5f9]">
              {MESSAGES.map((m, i) => (
                <div key={i} className="flex items-start gap-3 p-4 hover:bg-[#f8f9fc] transition-colors cursor-pointer">
                  <div className="h-8 w-8 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0 mt-0.5"
                    style={{ background: m.from === "You" ? "#94a3b8" : NAVY }}>
                    {m.from === "You" ? "Me" : "CT"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <p className="text-[11px] font-bold" style={{ color: NAVY }}>{m.from}</p>
                      <span className="text-[9px] text-[#94a3b8]">{m.time}</span>
                    </div>
                    <p className="text-[11px] text-[#64748b] line-clamp-2 leading-relaxed">{m.preview}</p>
                  </div>
                  {m.unread && <div className="h-2 w-2 rounded-full shrink-0 mt-1.5" style={{ background: CORAL }} />}
                </div>
              ))}
            </div>

            {/* Quick reply */}
            <div className="bg-white rounded-2xl border border-[#e2e8f0] p-4 space-y-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#94a3b8]">Quick Reply</p>
              <textarea placeholder="Send a message to your team…"
                className="w-full text-xs text-[#0f172a] bg-[#f8f9fc] rounded-xl p-3 resize-none min-h-[60px] border border-[#e2e8f0] outline-none placeholder:text-[#cbd5e1]"
                readOnly />
              <button className="w-full py-2 rounded-xl text-xs font-bold text-white" style={{ background: CORAL }}>
                Send Message
              </button>
            </div>

            {/* Next milestone */}
            <div className="bg-white rounded-2xl border border-[#e2e8f0] p-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#94a3b8] mb-3">Next Milestone</p>
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${CORAL}12` }}>
                  <Clock className="h-3.5 w-3.5" style={{ color: CORAL }} />
                </div>
                <div>
                  <p className="text-xs font-bold" style={{ color: NAVY }}>Hero approval → Jun 13</p>
                  <p className="text-[10px] text-[#94a3b8] mt-0.5">Final delivery target: Jun 20</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
