import { useState } from "react";
import { CheckCircle2, Zap, Clock, Sparkles, ChevronRight, Plus, ShoppingCart, Image, Layout, Mail, Monitor, FileText, Instagram, Layers } from "lucide-react";

const CORAL = "hsl(349,90%,54%)";
const NAVY  = "hsl(232,28%,11%)";

const ASSETS = [
  {
    id: 1, name: "Campaign Hero Artwork", type: "Image", version: "v3",
    status: "approved", approvedAt: "Approved Jun 11",
    gradient: "linear-gradient(135deg,#1a0533,#4c1d95,#7c3aed)",
  },
  {
    id: 2, name: "Moodboard & Direction", type: "Figma", version: "v2",
    status: "approved", approvedAt: "Approved Jun 9",
    gradient: "linear-gradient(135deg,#0c1a38,#1e3a8a,#2563eb)",
  },
  {
    id: 3, name: "Campaign Strategy Brief", type: "Doc", version: "v1",
    status: "approved", approvedAt: "Approved Jun 4",
    gradient: "linear-gradient(135deg,#052e1a,#065f46,#059669)",
  },
  {
    id: 4, name: "Social Copy Deck", type: "Doc", version: "v1",
    status: "pending", approvedAt: "Awaiting review",
    gradient: "linear-gradient(135deg,#2d1b0e,#92400e,#f59e0b)",
  },
];

const DERIVATIVES: Record<number, { icon: any; label: string; dims: string; status: "ready" | "queued" | "delivered" }[]> = {
  1: [
    { icon: Instagram,  label: "Instagram Stories",    dims: "9:16 · 1080×1920", status: "ready"     },
    { icon: Layout,     label: "LinkedIn Banner",       dims: "4:1 · 1584×396",  status: "ready"     },
    { icon: Mail,       label: "Email Header",          dims: "600×200 px",      status: "queued"    },
    { icon: Monitor,    label: "OOH Billboard",         dims: "14:3 · 14000×3000", status: "ready"   },
    { icon: Image,      label: "Social Grid (3×3)",     dims: "1:1 · 1080×1080", status: "ready"    },
    { icon: FileText,   label: "Print Flyer A4",        dims: "A4 · 300dpi",     status: "delivered" },
  ],
  2: [
    { icon: Instagram,  label: "Instagram Carousel",   dims: "1:1 · 1080×1080", status: "ready"     },
    { icon: Layout,     label: "Presentation Deck",    dims: "16:9 · PDF",      status: "ready"     },
    { icon: Mail,       label: "Newsletter Masthead",  dims: "600×250 px",      status: "ready"     },
    { icon: Monitor,    label: "Digital Display",      dims: "300×250 px",      status: "ready"     },
  ],
  3: [
    { icon: FileText,   label: "One-Pager PDF",        dims: "A4 · Print-ready",status: "ready"     },
    { icon: Layout,     label: "Pitch Slide Insert",   dims: "16:9",            status: "ready"     },
  ],
};

export function Catalyst() {
  const [selected, setSelected] = useState(1);
  const [queued, setQueued] = useState<Set<string>>(new Set(["Email Header"]));

  const asset = ASSETS.find(a => a.id === selected)!;
  const derivs = DERIVATIVES[selected] ?? [];
  const readyCount = derivs.filter(d => d.status === "ready").length;

  return (
    <div className="flex h-screen font-['Inter'] bg-[#fafafa] overflow-hidden">

      {/* ── LEFT: Assets ───────────────────────── */}
      <aside className="w-[300px] bg-white border-r border-[#e8eaf0] flex flex-col shrink-0">
        {/* Logo */}
        <div className="px-6 py-5 border-b border-[#e8eaf0]">
          <div className="flex items-center gap-2 mb-1">
            <div className="h-7 w-7 rounded-xl flex items-center justify-center" style={{ background: CORAL }}>
              <span className="text-white text-[10px] font-black">C</span>
            </div>
            <span className="font-bold text-sm" style={{ color: NAVY }}>Concepful</span>
          </div>
          <p className="text-[10px] text-[#94a3b8]">Q3 Campaign · Acme Inc.</p>
        </div>

        {/* Smart insight */}
        <div className="mx-4 mt-4 p-3 rounded-xl flex items-start gap-2" style={{ background: `${CORAL}08`, border: `1px solid ${CORAL}22` }}>
          <Sparkles className="h-3.5 w-3.5 shrink-0 mt-0.5" style={{ color: CORAL }} />
          <p className="text-[11px] leading-relaxed font-medium" style={{ color: CORAL }}>
            3 assets approved · <strong>9 collateral pieces</strong> ready to request
          </p>
        </div>

        {/* Asset list */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
          <p className="text-[9px] font-bold uppercase tracking-widest text-[#94a3b8] px-1 mb-3">Project Assets</p>
          {ASSETS.map(a => (
            <button key={a.id} onClick={() => setSelected(a.id)}
              className="w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all"
              style={{
                background: selected === a.id ? `${CORAL}08` : "transparent",
                border: selected === a.id ? `1.5px solid ${CORAL}30` : "1.5px solid transparent",
              }}>
              <div className="h-10 w-10 rounded-lg shrink-0 flex items-center justify-center" style={{ background: a.gradient }}>
                <span className="text-lg opacity-20 select-none">◈</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold truncate" style={{ color: NAVY }}>{a.name}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  {a.status === "approved" ? (
                    <span className="text-[9px] font-bold text-emerald-600 flex items-center gap-0.5">
                      <CheckCircle2 className="h-2.5 w-2.5" /> {a.approvedAt}
                    </span>
                  ) : (
                    <span className="text-[9px] font-bold text-amber-500 flex items-center gap-0.5">
                      <Clock className="h-2.5 w-2.5" /> {a.approvedAt}
                    </span>
                  )}
                </div>
              </div>
              {a.status === "approved" && DERIVATIVES[a.id] && (
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0"
                  style={{ background: `${CORAL}15`, color: CORAL }}>
                  {DERIVATIVES[a.id].filter(d => d.status === "ready").length}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="px-4 py-4 border-t border-[#e8eaf0]">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-full bg-[#e2e8f0] flex items-center justify-center text-[10px] font-bold" style={{ color: NAVY }}>SB</div>
            <div>
              <p className="text-[11px] font-semibold" style={{ color: NAVY }}>Sarah B.</p>
              <p className="text-[9px] text-[#94a3b8]">Acme Inc.</p>
            </div>
          </div>
        </div>
      </aside>

      {/* ── RIGHT: Derivatives ─────────────────── */}
      <main className="flex-1 flex flex-col min-w-0">

        {/* Header */}
        <div className="px-8 py-5 bg-white border-b border-[#e8eaf0] flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600">{asset.status === "approved" ? asset.approvedAt : "Pending approval"}</span>
            </div>
            <h1 className="text-xl font-bold font-['Poppins']" style={{ color: NAVY }}>{asset.name}</h1>
          </div>
          {queued.size > 0 && (
            <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white shadow-sm" style={{ background: CORAL }}>
              <ShoppingCart className="h-4 w-4" />
              Request {queued.size} piece{queued.size !== 1 ? "s" : ""}
              <span className="h-5 w-5 bg-white/20 rounded-full flex items-center justify-center text-[10px]">{queued.size}</span>
            </button>
          )}
        </div>

        {/* Derivatives grid */}
        <div className="flex-1 overflow-y-auto px-8 py-6">
          {asset.status === "approved" ? (
            <>
              <div className="flex items-center gap-2 mb-5">
                <Zap className="h-4 w-4" style={{ color: CORAL }} />
                <p className="text-sm font-bold" style={{ color: NAVY }}>
                  Create from this asset
                </p>
                <span className="text-[11px] text-[#94a3b8] ml-1">{readyCount} format{readyCount !== 1 ? "s" : ""} available</span>
              </div>
              <div className="grid grid-cols-3 gap-4">
                {derivs.map((d, i) => {
                  const isQueued = queued.has(d.label);
                  return (
                    <div key={i} className="bg-white rounded-2xl border transition-all overflow-hidden"
                      style={{ borderColor: isQueued ? CORAL : "#e8eaf0", boxShadow: isQueued ? `0 0 0 2px ${CORAL}25` : "none" }}>
                      {/* Mini preview */}
                      <div className="h-24 flex items-center justify-center relative"
                        style={{ background: d.status === "delivered" ? "#f0fdf4" : d.status === "queued" ? "#fffbeb" : asset.gradient + "99" }}>
                        <d.icon className="h-8 w-8 opacity-30" style={{ color: d.status === "delivered" ? "#22c55e" : d.status === "queued" ? "#f59e0b" : "white" }} />
                        {d.status === "delivered" && (
                          <div className="absolute top-2 right-2 text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">Delivered</div>
                        )}
                        {d.status === "queued" && (
                          <div className="absolute top-2 right-2 text-[9px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">In Production</div>
                        )}
                      </div>
                      <div className="p-3.5">
                        <p className="text-xs font-bold leading-tight mb-0.5" style={{ color: NAVY }}>{d.label}</p>
                        <p className="text-[10px] text-[#94a3b8] mb-3">{d.dims}</p>
                        {d.status === "ready" ? (
                          <button
                            onClick={() => setQueued(prev => {
                              const next = new Set(prev);
                              isQueued ? next.delete(d.label) : next.add(d.label);
                              return next;
                            })}
                            className="w-full py-2 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all"
                            style={{
                              background: isQueued ? CORAL : `${CORAL}10`,
                              color: isQueued ? "white" : CORAL,
                            }}>
                            {isQueued ? <CheckCircle2 className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
                            {isQueued ? "Added" : "Request this"}
                          </button>
                        ) : (
                          <div className="w-full py-2 rounded-lg text-[11px] font-bold text-center"
                            style={{ background: d.status === "delivered" ? "#f0fdf4" : "#fffbeb", color: d.status === "delivered" ? "#22c55e" : "#f59e0b" }}>
                            {d.status === "delivered" ? "✓ Delivered" : "⏳ In Production"}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Request all CTA */}
              {readyCount > 0 && (
                <div className="mt-6 p-4 rounded-2xl border-2 border-dashed flex items-center justify-between"
                  style={{ borderColor: `${CORAL}30`, background: `${CORAL}04` }}>
                  <div>
                    <p className="text-sm font-bold" style={{ color: NAVY }}>Request all {readyCount} formats at once</p>
                    <p className="text-[11px] text-[#94a3b8] mt-0.5">Your team starts production immediately — estimated 2–3 business days per format.</p>
                  </div>
                  <button className="shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold ml-4"
                    style={{ background: CORAL, color: "white" }}>
                    Request all <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <Clock className="h-12 w-12 text-[#e2e8f0] mb-4" />
              <p className="text-sm font-bold text-[#94a3b8]">Awaiting your approval</p>
              <p className="text-[11px] text-[#cbd5e1] mt-1">Collateral options unlock once you approve this asset.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
