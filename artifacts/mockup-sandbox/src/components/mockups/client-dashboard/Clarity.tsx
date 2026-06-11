import { ArrowRight, Bell, CheckCircle2, Clock, MessageSquare, Paperclip, TrendingUp, Zap } from "lucide-react";

const CORAL  = "hsl(349,90%,54%)";
const NAVY   = "hsl(232,28%,11%)";

const PROJECTS = [
  {
    id: 1, name: "Q3 Campaign Asset System", type: "Campaign", phase: "Design",
    phaseColor: "#6366f1", phaseBg: "#6366f110",
    gradient: "linear-gradient(135deg,#2d1b4e 0%,#6b2fa0 50%,#ec4899 100%)",
    notif: 1, progress: 55,
  },
  {
    id: 2, name: "Investor Deck Refresh", type: "Presentation", phase: "In Review",
    phaseColor: CORAL, phaseBg: `${CORAL}15`,
    gradient: "linear-gradient(135deg,#0f3d2e 0%,#065f46 50%,#059669 100%)",
    notif: 0, progress: 80,
  },
  {
    id: 3, name: "Brand Voice Guidelines", type: "Strategy", phase: "Brief",
    phaseColor: "#f59e0b", phaseBg: "#f59e0b15",
    gradient: "linear-gradient(135deg,#1e3a5f 0%,#1d4ed8 50%,#38bdf8 100%)",
    notif: 2, progress: 20,
  },
];

const MESSAGES = [
  { from: "Creative Team", preview: "Hero artwork is ready for your approval", time: "2m",  unread: true  },
  { from: "Creative Team", preview: "Investor deck v3 — updated slide 8 with Q1 data",  time: "3h",  unread: false },
  { from: "You",           preview: "Love the direction! Can we push the coral?",        time: "1d",  unread: false },
];

const STATS = [
  { label: "Active Projects", val: "3",    icon: Zap,           color: CORAL      },
  { label: "Pending Review",  val: "2",    icon: Clock,         color: "#f59e0b"  },
  { label: "Delivered",       val: "8",    icon: CheckCircle2,  color: "#22c55e"  },
  { label: "Unread Messages", val: "3",    icon: MessageSquare, color: "#6366f1"  },
];

export function Clarity() {
  return (
    <div className="min-h-screen font-['Inter'] bg-[#f8f9fc]">

      {/* Top nav */}
      <header className="bg-white border-b border-[#e2e8f0] px-8 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-xl flex items-center justify-center" style={{ background: CORAL }}>
            <span className="text-white text-xs font-black">C</span>
          </div>
          <div>
            <p className="text-sm font-bold text-[#0f172a] leading-none">Concepful</p>
            <p className="text-[10px] text-[#94a3b8] mt-0.5">Client Portal · Acme Inc.</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <nav className="flex items-center gap-1">
            {["Overview", "Projects", "Collateral", "Messages"].map((item, i) => (
              <button key={item} className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                style={{ background: i === 0 ? `${CORAL}10` : "transparent", color: i === 0 ? CORAL : "#64748b" }}>
                {item}
              </button>
            ))}
          </nav>
          <div className="relative">
            <div className="h-8 w-8 rounded-full bg-[#e2e8f0] flex items-center justify-center">
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
          <h1 className="text-2xl font-bold text-[#0f172a] font-['Poppins']">Good afternoon, Sarah 👋</h1>
          <p className="text-[#64748b] text-sm mt-1">Here's everything happening across your projects.</p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {STATS.map(s => (
            <div key={s.label} className="bg-white rounded-2xl border border-[#e2e8f0] p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="h-8 w-8 rounded-xl flex items-center justify-center" style={{ background: `${s.color}12` }}>
                  <s.icon className="h-4 w-4" style={{ color: s.color }} />
                </div>
              </div>
              <p className="text-2xl font-bold text-[#0f172a] font-['Poppins']">{s.val}</p>
              <p className="text-[11px] text-[#94a3b8] mt-0.5 font-medium">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-6">

          {/* Projects grid (2 cols) */}
          <div className="col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold text-[#0f172a]">Your Projects</p>
              <button className="text-xs font-medium flex items-center gap-1" style={{ color: CORAL }}>
                View all <ArrowRight className="h-3 w-3" />
              </button>
            </div>
            {PROJECTS.map(proj => (
              <div key={proj.id} className="bg-white rounded-2xl border border-[#e2e8f0] overflow-hidden hover:border-[#cbd5e1] hover:shadow-sm transition-all cursor-pointer">
                <div className="flex items-stretch">
                  {/* Gradient thumbnail */}
                  <div className="w-20 shrink-0 flex items-center justify-center relative" style={{ background: proj.gradient }}>
                    <span className="text-2xl opacity-10 font-black select-none">{proj.name[0]}</span>
                    {proj.notif > 0 && (
                      <div className="absolute top-2 right-2 h-5 w-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white" style={{ background: CORAL }}>
                        {proj.notif}
                      </div>
                    )}
                  </div>
                  {/* Info */}
                  <div className="flex-1 p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[9px] font-bold uppercase tracking-widest text-[#94a3b8]">{proj.type}</span>
                          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full"
                            style={{ background: proj.phaseBg, color: proj.phaseColor }}>
                            {proj.phase}
                          </span>
                        </div>
                        <p className="text-sm font-bold text-[#0f172a] leading-tight">{proj.name}</p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-[#cbd5e1] shrink-0 mt-0.5" />
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-[#f1f5f9] rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${proj.progress}%`, background: proj.phaseColor }} />
                      </div>
                      <span className="text-[10px] font-bold text-[#94a3b8]">{proj.progress}%</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Messages sidebar */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold text-[#0f172a]">Messages</p>
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
                      <p className="text-[11px] font-bold text-[#0f172a]">{m.from}</p>
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
                className="w-full text-xs text-[#0f172a] bg-[#f8f9fc] rounded-xl p-3 resize-none min-h-[64px] border border-[#e2e8f0] outline-none placeholder:text-[#cbd5e1]"
                readOnly />
              <button className="w-full py-2 rounded-xl text-xs font-bold text-white" style={{ background: CORAL }}>
                Send Message
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
