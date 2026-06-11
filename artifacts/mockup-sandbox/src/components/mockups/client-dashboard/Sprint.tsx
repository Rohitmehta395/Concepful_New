import { useState } from "react";
import { CheckCircle2, ChevronRight, Clock, Maximize2, Plus, Sparkles, ThumbsUp, Zap, X, Check } from "lucide-react";

const CORAL = "hsl(349,90%,54%)";
const NAVY  = "hsl(232,28%,11%)";

type TaskStatus = "pending" | "approved" | "dismissed";

const DERIVATIVE_OPTS = [
  { label: "Instagram Stories ×4",  dims: "9:16", selected: true  },
  { label: "LinkedIn Banner",        dims: "4:1",  selected: true  },
  { label: "Email Header",           dims: "600px", selected: false },
  { label: "OOH Billboard",          dims: "14:3",  selected: false },
];

const initialTasks = [
  {
    id: 1,
    priority: "high",
    type: "approve" as const,
    label: "Approve",
    title: "Campaign Hero Artwork — v3",
    sub: "Final lockup, coral palette, editorial photography. This unlocks 6 collateral formats.",
    gradient: "linear-gradient(135deg,#1a0533,#4c1d95,#7c3aed)",
    time: "Ready since 2 hours ago",
    hasCollateral: true,
  },
  {
    id: 2,
    priority: "medium",
    type: "review" as const,
    label: "Review",
    title: "Moodboard v2 — Updated Direction",
    sub: "Refined type pairing and two visual territories. Creative team awaiting sign-off.",
    gradient: "linear-gradient(135deg,#0c1a38,#1e3a8a,#2563eb)",
    time: "Ready since 3 hours ago",
    hasCollateral: false,
  },
  {
    id: 3,
    priority: "low",
    type: "request" as const,
    label: "Order",
    title: "Social Suite from Q3 Hero",
    sub: "12 formats across Stories, Feed, LinkedIn and Email. Estimated 3 business days.",
    gradient: "linear-gradient(135deg,#2d1b0e,#92400e,#f59e0b)",
    time: "Available to order",
    hasCollateral: false,
  },
];

export function Sprint() {
  const [statuses, setStatuses] = useState<Record<number, TaskStatus>>({});
  const [expandCollateral, setExpandCollateral] = useState(false);
  const [derivSelected, setDerivSelected] = useState<Record<string, boolean>>(
    Object.fromEntries(DERIVATIVE_OPTS.map(d => [d.label, d.selected]))
  );

  const setStatus = (id: number, s: TaskStatus) => {
    setStatuses(p => ({ ...p, [id]: s }));
    if (id === 1 && s === "approved") setExpandCollateral(true);
  };

  const doneCount = Object.values(statuses).filter(s => s !== "pending").length;
  const total = initialTasks.length;
  const allDone = doneCount === total;

  const priorityColor: Record<string, string> = { high: CORAL, medium: "#a78bfa", low: "#60a5fa" };
  const priorityLabel: Record<string, string> = { high: "Needs approval", medium: "Needs review", low: "Ready to order" };

  return (
    <div className="min-h-screen font-['Inter'] bg-[#f8f9fc] flex flex-col items-center justify-start">

      {/* Top bar */}
      <div className="w-full bg-white border-b border-[#e8eaf0] px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-xl flex items-center justify-center" style={{ background: CORAL }}>
            <span className="text-white text-[10px] font-black">C</span>
          </div>
          <span className="text-sm font-bold" style={{ color: NAVY }}>Concepful</span>
          <span className="text-[10px] text-[#94a3b8] ml-1">· Acme Inc.</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex gap-0.5">
            {initialTasks.map(t => (
              <div key={t.id} className="h-1.5 w-8 rounded-full transition-all"
                style={{ background: statuses[t.id] === "approved" ? "#22c55e" : statuses[t.id] === "dismissed" ? "#e2e8f0" : CORAL }} />
            ))}
          </div>
          <span className="text-[10px] text-[#94a3b8]">{doneCount}/{total} done</span>
          <div className="h-7 w-7 rounded-full flex items-center justify-center text-[9px] font-bold text-white" style={{ background: NAVY }}>SB</div>
        </div>
      </div>

      {/* Main */}
      <div className="w-full max-w-2xl px-6 py-8">

        {/* Greeting */}
        <div className="mb-8">
          {!allDone ? (
            <>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-4 w-4" style={{ color: CORAL }} />
                <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: CORAL }}>Your session</span>
              </div>
              <h1 className="text-2xl font-bold font-['Poppins']" style={{ color: NAVY }}>
                Good morning, Sarah.
              </h1>
              <p className="text-sm text-[#64748b] mt-1 flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                {total - doneCount} item{(total - doneCount) !== 1 ? "s" : ""} waiting · estimated {(total - doneCount) * 2} minutes
              </p>
            </>
          ) : (
            <div className="text-center py-8">
              <div className="h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: "#f0fdf4" }}>
                <CheckCircle2 className="h-8 w-8 text-emerald-500" />
              </div>
              <h1 className="text-2xl font-bold font-['Poppins'] mb-2" style={{ color: NAVY }}>All caught up!</h1>
              <p className="text-sm text-[#64748b]">Nothing else needs your attention right now.</p>
              <p className="text-[11px] text-[#94a3b8] mt-3">Next check-in: Friday 2 PM · Delivery: Jun 20</p>
            </div>
          )}
        </div>

        {/* Task list */}
        <div className="space-y-4">
          {initialTasks.map(task => {
            const status = statuses[task.id];
            const isDone = status === "approved" || status === "dismissed";

            return (
              <div key={task.id} className="transition-all" style={{ opacity: isDone ? 0.55 : 1 }}>
                <div className="bg-white rounded-2xl border border-[#e8eaf0] overflow-hidden">
                  <div className="flex items-stretch">
                    {/* Gradient strip */}
                    <div className="w-20 shrink-0 flex items-center justify-center relative" style={{ background: task.gradient }}>
                      {isDone && (
                        <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                          <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                        </div>
                      )}
                    </div>
                    {/* Content */}
                    <div className="flex-1 p-5">
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div>
                          <span className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full inline-block mb-2"
                            style={{ background: `${priorityColor[task.priority]}12`, color: priorityColor[task.priority] }}>
                            {priorityLabel[task.priority]}
                          </span>
                          <p className="text-sm font-bold leading-snug" style={{ color: NAVY }}>{task.title}</p>
                          <p className="text-[11px] text-[#64748b] mt-1 leading-relaxed">{task.sub}</p>
                        </div>
                        <div className="shrink-0 flex gap-1.5">
                          {!isDone ? (
                            <>
                              <button onClick={() => setStatus(task.id, "approved")}
                                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white"
                                style={{ background: task.type === "request" ? "#22c55e" : CORAL }}>
                                <ThumbsUp className="h-3.5 w-3.5" />
                                {task.label}
                              </button>
                              {task.type !== "request" && (
                                <button onClick={() => setStatus(task.id, "dismissed")}
                                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border border-[#e8eaf0] text-[#94a3b8]">
                                  <X className="h-3.5 w-3.5" /> Revise
                                </button>
                              )}
                            </>
                          ) : (
                            <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold"
                              style={{ background: "#f0fdf4", color: "#22c55e" }}>
                              <Check className="h-3.5 w-3.5" /> Done
                            </div>
                          )}
                        </div>
                      </div>
                      <p className="text-[9px] text-[#94a3b8] flex items-center gap-1">
                        <Clock className="h-2.5 w-2.5" /> {task.time}
                      </p>
                    </div>
                  </div>

                  {/* Collateral expander — appears after approving task 1 */}
                  {task.id === 1 && expandCollateral && (
                    <div className="border-t px-5 py-4" style={{ borderColor: "#f1f5f9", background: `${CORAL}04` }}>
                      <div className="flex items-center gap-2 mb-3">
                        <Zap className="h-3.5 w-3.5" style={{ color: CORAL }} />
                        <p className="text-xs font-bold" style={{ color: CORAL }}>
                          Approved! Create collateral from this?
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-2 mb-3">
                        {DERIVATIVE_OPTS.map(d => (
                          <button key={d.label}
                            onClick={() => setDerivSelected(p => ({ ...p, [d.label]: !p[d.label] }))}
                            className="flex items-center gap-2 p-2.5 rounded-xl border text-left transition-all"
                            style={{
                              borderColor: derivSelected[d.label] ? CORAL : "#e8eaf0",
                              background: derivSelected[d.label] ? `${CORAL}08` : "white",
                            }}>
                            <div className="h-4 w-4 rounded flex items-center justify-center shrink-0"
                              style={{ background: derivSelected[d.label] ? CORAL : "#f1f5f9" }}>
                              {derivSelected[d.label] && <Check className="h-2.5 w-2.5 text-white" />}
                            </div>
                            <div>
                              <p className="text-[10px] font-bold" style={{ color: NAVY }}>{d.label}</p>
                              <p className="text-[9px] text-[#94a3b8]">{d.dims}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                      <button className="w-full py-2.5 rounded-xl text-xs font-bold text-white" style={{ background: CORAL }}>
                        Request {Object.values(derivSelected).filter(Boolean).length} collateral formats →
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Stats footer */}
        <div className="mt-8 flex items-center justify-center gap-6 text-center">
          {[
            { val: "11", label: "Assets approved" },
            { val: "8",  label: "Collateral delivered" },
            { val: "Jun 20", label: "Final delivery" },
          ].map(s => (
            <div key={s.label}>
              <p className="text-lg font-bold font-['Poppins']" style={{ color: NAVY }}>{s.val}</p>
              <p className="text-[10px] text-[#94a3b8]">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
