import { CheckCircle2, ChevronRight, Download, MessageSquare, Maximize2, ThumbsUp, Pencil, Send, FileText, ImageIcon, Layers } from "lucide-react";

const CORAL  = "hsl(349,90%,54%)";
const NAVY   = "hsl(232,28%,11%)";

const DELIVERABLES = [
  {
    id: 1, type: "Image",  label: "Campaign Hero Artwork",  version: "v3",  isFinal: true,
    gradient: "linear-gradient(135deg,#1a0533 0%,#4c1d95 50%,#7c3aed 100%)",
    status: "Awaiting Approval",
    desc: "Final lockup with editorial photography, coral + navy palette.",
  },
  {
    id: 2, type: "Figma",  label: "Moodboard & Direction",  version: "v2",  isFinal: false,
    gradient: "linear-gradient(135deg,#0c1a38 0%,#1e3a8a 50%,#2563eb 100%)",
    status: "In Review",
    desc: "Visual references and type pairing. Two territories explored.",
  },
  {
    id: 3, type: "Doc",    label: "Campaign Strategy Brief", version: "v1", isFinal: false,
    gradient: "linear-gradient(135deg,#052e1a 0%,#065f46 50%,#059669 100%)",
    status: "Complete",
    desc: "Goals, messaging hierarchy, audience personas, and timeline.",
  },
];

const MESSAGES = [
  { from: "CT", body: "Hey! We've locked the moodboard direction — coral + editorial photography. Moving to Design phase tomorrow.", time: "Today, 9:14 AM", isTeam: true },
  { from: "Me", body: "Looks incredible! Love the typography pairing. Can we try one more version with a slightly darker navy background?", time: "Today, 9:47 AM", isTeam: false },
  { from: "CT", body: "On it — will have a revised version by EOD. The hero artwork is also ready for your final approval.", time: "Today, 10:02 AM", isTeam: true },
];

export function Brief() {
  return (
    <div className="flex h-screen font-['Inter'] bg-[#f8f9fc] overflow-hidden">

      {/* ── Left panel: Brief ──────────────────── */}
      <aside className="w-[340px] bg-white border-r border-[#e2e8f0] flex flex-col shrink-0">

        {/* Header */}
        <div className="px-6 py-5 border-b border-[#e2e8f0]">
          <div className="flex items-center gap-2 mb-3">
            <div className="h-7 w-7 rounded-lg flex items-center justify-center" style={{ background: CORAL }}>
              <span className="text-white text-[10px] font-black">C</span>
            </div>
            <span className="text-sm font-bold" style={{ color: NAVY }}>Concepful</span>
            <span className="ml-auto text-[10px] text-[#94a3b8]">Acme Inc.</span>
          </div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[9px] font-bold uppercase tracking-widest text-[#94a3b8]">Campaign · Design Phase</span>
          </div>
          <h2 className="text-base font-bold leading-snug font-['Poppins']" style={{ color: NAVY }}>Q3 Campaign Asset System</h2>
          <div className="mt-3 flex items-center gap-2">
            {["Discovery", "Brief", "Design", "Review", "Delivered"].map((ph, i) => (
              <div key={ph} className="flex items-center gap-1">
                <div className="h-1.5 w-1.5 rounded-full" style={{ background: i <= 2 ? CORAL : "#e2e8f0" }} />
                {i < 4 && <div className="h-px w-4" style={{ background: i < 2 ? CORAL : "#e2e8f0" }} />}
              </div>
            ))}
            <span className="text-[10px] font-bold ml-1" style={{ color: CORAL }}>Design</span>
          </div>
        </div>

        {/* Brief section */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

          <div>
            <p className="text-[9px] font-bold uppercase tracking-widest text-[#94a3b8] mb-2.5">Creative Direction</p>
            <div className="rounded-xl p-4 space-y-3" style={{ background: `${CORAL}06`, border: `1px solid ${CORAL}18` }}>
              <p className="text-xs leading-relaxed font-medium" style={{ color: NAVY }}>
                Coral + dark navy editorial palette. Photography-led with bold typography. Two visual territories: <em>Momentum</em> (energetic, diagonal) and <em>Authority</em> (clean, structured).
              </p>
            </div>
          </div>

          <div>
            <p className="text-[9px] font-bold uppercase tracking-widest text-[#94a3b8] mb-2.5">Business Goal</p>
            <p className="text-xs leading-relaxed text-[#475569]">
              Drive awareness of Series B announcement across paid social, display, and OOH. Primary KPI: 2M+ impressions in Q3 with ≥2.5% CTR.
            </p>
          </div>

          <div>
            <p className="text-[9px] font-bold uppercase tracking-widest text-[#94a3b8] mb-2.5">Deliverables</p>
            <div className="space-y-2">
              {[
                { label: "Hero artwork (3 formats)",    done: true  },
                { label: "Moodboard & type pairing",   done: true  },
                { label: "Social templates (24 pcs)",  done: false },
                { label: "OOH layouts (2 sizes)",      done: false },
              ].map(d => (
                <div key={d.label} className="flex items-center gap-2 text-xs">
                  <div className="h-4 w-4 rounded flex items-center justify-center shrink-0"
                    style={{ background: d.done ? `${CORAL}15` : "#f1f5f9", border: d.done ? `1px solid ${CORAL}40` : "1px solid #e2e8f0" }}>
                    {d.done && <CheckCircle2 className="h-2.5 w-2.5" style={{ color: CORAL }} />}
                  </div>
                  <span style={{ color: d.done ? "#475569" : "#94a3b8", textDecoration: d.done ? "none" : "none" }}>{d.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <p className="text-[9px] font-bold uppercase tracking-widest text-[#94a3b8] mb-2.5">Timeline</p>
            <div className="space-y-1.5">
              {[
                { label: "Creative brief signed",   date: "May 27", done: true  },
                { label: "Moodboard review",        date: "Jun 4",  done: true  },
                { label: "Hero artwork approval",   date: "Jun 13", done: false, active: true },
                { label: "Final delivery",          date: "Jun 20", done: false },
              ].map(t => (
                <div key={t.label} className="flex items-center gap-2.5 text-xs py-1">
                  <div className="h-1.5 w-1.5 rounded-full shrink-0" style={{ background: t.done ? CORAL : t.active ? "#f59e0b" : "#e2e8f0" }} />
                  <span className="flex-1" style={{ color: t.done ? "#64748b" : t.active ? NAVY : "#94a3b8", fontWeight: t.active ? 600 : 400 }}>{t.label}</span>
                  <span className="text-[10px]" style={{ color: t.active ? "#f59e0b" : "#94a3b8" }}>{t.date}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </aside>

      {/* ── Right panel: Deliverables + Chat ─── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Deliverables grid */}
        <div className="flex-1 overflow-y-auto px-8 py-6 min-h-0">
          <div className="flex items-center justify-between mb-5">
            <p className="text-sm font-bold" style={{ color: NAVY }}>Work for Your Review</p>
            <span className="text-[10px] px-3 py-1 rounded-full font-bold" style={{ background: `${CORAL}12`, color: CORAL }}>
              1 awaiting approval
            </span>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {DELIVERABLES.map(d => (
              <div key={d.id} className="bg-white rounded-2xl border border-[#e2e8f0] overflow-hidden group hover:shadow-md transition-all">
                <div className="h-36 relative flex items-center justify-center cursor-pointer" style={{ background: d.gradient }}>
                  <span className="text-5xl opacity-10 font-black select-none">
                    {d.type === "Image" ? "🖼" : d.type === "Figma" ? "✦" : "▤"}
                  </span>
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5 bg-white/20 backdrop-blur-sm text-white text-[10px] font-bold px-3 py-1.5 rounded-full">
                      <Maximize2 className="h-3 w-3" /> Preview
                    </div>
                  </div>
                  {d.isFinal && (
                    <div className="absolute top-2.5 left-2.5 text-[9px] font-bold px-2 py-0.5 rounded-full text-white" style={{ background: CORAL }}>Final</div>
                  )}
                  <div className="absolute top-2.5 right-2.5 text-[9px] font-bold px-2 py-0.5 rounded-full bg-black/30 backdrop-blur-sm text-white">{d.version}</div>
                </div>
                <div className="p-4">
                  <p className="text-[9px] font-bold uppercase tracking-widest text-[#94a3b8] mb-1">{d.type}</p>
                  <p className="text-sm font-bold leading-snug mb-1" style={{ color: NAVY }}>{d.label}</p>
                  <p className="text-[10px] text-[#94a3b8] mb-3 leading-relaxed line-clamp-2">{d.desc}</p>
                  <div className="flex gap-1.5">
                    <button className="flex-1 flex items-center justify-center gap-1 py-2 rounded-xl text-[10px] font-bold text-white" style={{ background: d.status === "Complete" ? "#22c55e" : CORAL }}>
                      <ThumbsUp className="h-3 w-3" />
                      {d.status === "Complete" ? "Approved" : "Approve"}
                    </button>
                    <button className="h-8 w-8 rounded-xl flex items-center justify-center border border-[#e2e8f0] shrink-0">
                      <Pencil className="h-3 w-3 text-[#94a3b8]" />
                    </button>
                    <button className="h-8 w-8 rounded-xl flex items-center justify-center border border-[#e2e8f0] shrink-0">
                      <Download className="h-3 w-3 text-[#94a3b8]" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat bar */}
        <div className="border-t border-[#e2e8f0] bg-white px-8 py-4 shrink-0">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5">
              <MessageSquare className="h-3.5 w-3.5" style={{ color: CORAL }} />
              <p className="text-xs font-bold" style={{ color: NAVY }}>Project Chat</p>
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full text-white" style={{ background: CORAL }}>3</span>
            </div>
            <button className="text-[10px] font-medium text-[#94a3b8] hover:text-[#475569]">View full thread</button>
          </div>
          {/* Last message preview */}
          <div className="flex items-start gap-2.5 mb-3 p-3 rounded-xl bg-[#f8f9fc]">
            <div className="h-6 w-6 rounded-full shrink-0 flex items-center justify-center text-[9px] font-bold text-white mt-0.5" style={{ background: NAVY }}>CT</div>
            <div>
              <p className="text-[10px] font-bold mb-0.5" style={{ color: NAVY }}>Creative Team <span className="font-normal text-[#94a3b8]">· 10:02 AM</span></p>
              <p className="text-[11px] text-[#475569] leading-relaxed">The hero artwork is ready for your final approval.</p>
            </div>
          </div>
          {/* Input */}
          <div className="flex gap-2.5">
            <div className="flex-1 flex items-center gap-2 bg-[#f8f9fc] border border-[#e2e8f0] rounded-xl px-3 py-2">
              <input placeholder="Reply to your team…" className="flex-1 text-xs bg-transparent outline-none text-[#0f172a] placeholder:text-[#cbd5e1]" readOnly />
            </div>
            <button className="h-9 px-4 rounded-xl flex items-center gap-1.5 text-[10px] font-bold text-white" style={{ background: CORAL }}>
              <Send className="h-3 w-3" /> Send
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
