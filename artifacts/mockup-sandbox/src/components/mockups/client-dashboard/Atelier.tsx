import { useState } from "react";
import { Check, CheckCircle2, ChevronRight, Clock, Download, Layers, MessageSquare, Send, Sparkles, Zap } from "lucide-react";

const CORAL = "hsl(349,90%,54%)";
const BG    = "#0a0c14";
const BG2   = "#0f1219";
const BG3   = "#161b26";
const BG4   = "#1e2535";

const MODELS = [
  { id: "gemini",  label: "Gemini 2.0 Flash",   short: "G2",  color: "#818cf8", bg: "#818cf820", task: "Layout concepts",     count: 4, time: "3.1s", done: true  },
  { id: "imagen",  label: "Imagen 3",            short: "I3",  color: "#f472b6", bg: "#f472b620", task: "Hero imagery variants", count: 3, time: "4.7s", done: true  },
  { id: "claude",  label: "Claude 3.5 Sonnet",   short: "C",   color: "#fb923c", bg: "#fb923c20", task: "Headline copy",       count: 6, time: "1.2s", done: true  },
  { id: "sdxl",    label: "Stable Diffusion XL", short: "SD",  color: "#34d399", bg: "#34d39920", task: "Background textures",  count: 4, time: "5.1s", done: true  },
];

const OUTPUT_VARIANTS = [
  { label: "Composition A", gradient: "linear-gradient(160deg,#1a0533,#4c1d95,#7c3aed)", score: 98 },
  { label: "Composition B", gradient: "linear-gradient(160deg,#0c1a38,#1e3a8a,#38bdf8)", score: 91 },
  { label: "Composition C", gradient: "linear-gradient(160deg,#1a0a2e,#6d28d9,#ec4899)", score: 87 },
];

const AGENT_NOTES = [
  { model: "gemini", color: "#818cf8", bg: "#818cf820", short: "G2", msg: "Constructed 4 layout systems from Q3 Hero. Option A scores highest for brand alignment and whitespace.", time: "10:17 AM" },
  { model: "claude", color: "#fb923c", bg: "#fb923c20", short: "C",  msg: "6 headline variants ready. 'The Future Is Already Here.' best matches the editorial brief tone.", time: "10:17 AM" },
  { model: "gemini", color: "#818cf8", bg: "#818cf820", short: "G2", msg: "Brand check complete: Composition A uses approved Q3 palette, correct logo clearance, and WCAG AA contrast. Safe to export.", time: "10:18 AM" },
];

export function Atelier() {
  const [selected, setSelected] = useState(0);
  const [approved, setApproved] = useState(false);

  return (
    <div className="flex h-screen font-['Inter'] overflow-hidden" style={{ background: BG }}>

      {/* ── Col 1: Brief ─────────────────────── */}
      <div className="w-[260px] flex flex-col shrink-0 border-r" style={{ borderColor: BG4 }}>
        <div className="px-5 py-5 border-b" style={{ borderColor: BG4 }}>
          <div className="flex items-center gap-2 mb-1">
            <div className="h-7 w-7 rounded-xl flex items-center justify-center" style={{ background: CORAL }}>
              <span className="text-white text-[10px] font-black">C</span>
            </div>
            <span className="text-sm font-bold text-white">Atelier</span>
          </div>
          <p className="text-[9px]" style={{ color: "#475569" }}>Acme Inc. · Production Session</p>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">

          {/* Brief */}
          <div>
            <p className="text-[9px] font-bold uppercase tracking-widest mb-2.5" style={{ color: "#475569" }}>Client Brief</p>
            <div className="rounded-xl p-3.5" style={{ background: BG3, border: `1px solid ${BG4}` }}>
              <p className="text-[11px] leading-relaxed" style={{ color: "#94a3b8" }}>
                Launch flyer for Q3 Campaign. Portrait format, editorial photography, coral + navy palette. Headline: bold and forward-looking. Final by EOD.
              </p>
            </div>
          </div>

          {/* Creative Direction */}
          <div>
            <p className="text-[9px] font-bold uppercase tracking-widest mb-2.5" style={{ color: "#475569" }}>Creative Direction</p>
            <div className="space-y-2">
              {["Editorial · Dark · Bold type", "Coral accent on hero", "Q3 photography base", "Inter headline, tight"].map(d => (
                <div key={d} className="flex items-center gap-2 text-[10px]" style={{ color: "#64748b" }}>
                  <div className="h-1 w-1 rounded-full shrink-0" style={{ background: CORAL }} />
                  {d}
                </div>
              ))}
            </div>
          </div>

          {/* Reference Assets */}
          <div>
            <p className="text-[9px] font-bold uppercase tracking-widest mb-2.5" style={{ color: "#475569" }}>Reference Assets</p>
            <div className="space-y-1.5">
              {[
                { name: "Q3 Hero v3 ✓",   gradient: "linear-gradient(135deg,#1a0533,#7c3aed)" },
                { name: "Moodboard v2 ✓",  gradient: "linear-gradient(135deg,#0c1a38,#2563eb)" },
                { name: "Brand Kit v4",    gradient: "linear-gradient(135deg,#1a0a0a,#9b1c1c)" },
              ].map(a => (
                <div key={a.name} className="flex items-center gap-2 p-2 rounded-lg" style={{ background: BG3 }}>
                  <div className="h-6 w-6 rounded-md shrink-0" style={{ background: a.gradient }} />
                  <p className="text-[10px] font-medium" style={{ color: "#94a3b8" }}>{a.name}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Format */}
          <div className="rounded-xl p-3" style={{ background: BG3, border: `1px solid ${BG4}` }}>
            <p className="text-[9px] font-bold uppercase tracking-widest mb-1" style={{ color: "#475569" }}>Output Format</p>
            <p className="text-xs font-bold text-white">Event Flyer · A4 Portrait</p>
            <p className="text-[10px] mt-0.5" style={{ color: "#64748b" }}>Print-ready PDF · 300dpi · Bleed</p>
          </div>
        </div>
      </div>

      {/* ── Col 2: AI Production Floor ─────────── */}
      <div className="w-[280px] flex flex-col shrink-0 border-r" style={{ borderColor: BG4, background: BG2 }}>
        <div className="px-5 py-5 border-b flex items-center gap-2" style={{ borderColor: BG4 }}>
          <Sparkles className="h-4 w-4" style={{ color: CORAL }} />
          <span className="text-sm font-bold text-white">Production Floor</span>
          <div className="ml-auto flex items-center gap-1 text-[9px] font-bold" style={{ color: "#22c55e" }}>
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> All complete
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          <p className="text-[9px] font-bold uppercase tracking-widest" style={{ color: "#475569" }}>Model Orchestration · 4 agents · 14.1s total</p>

          {MODELS.map(m => (
            <div key={m.id} className="rounded-xl p-3.5" style={{ background: BG3, border: `1px solid ${BG4}` }}>
              <div className="flex items-center gap-2 mb-2">
                <div className="h-6 w-6 rounded-full flex items-center justify-center text-[8px] font-bold shrink-0"
                  style={{ background: m.bg, color: m.color }}>{m.short}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-bold leading-none" style={{ color: m.color }}>{m.label}</p>
                  <p className="text-[9px] mt-0.5" style={{ color: "#475569" }}>{m.task}</p>
                </div>
                {m.done && <CheckCircle2 className="h-4 w-4 shrink-0" style={{ color: "#22c55e" }} />}
              </div>
              <div className="h-1 bg-[#1e2535] rounded-full overflow-hidden mb-2">
                <div className="h-full rounded-full" style={{ width: "100%", background: m.done ? "#22c55e" : m.color }} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-bold" style={{ color: "#475569" }}>{m.count} outputs · ⚡ {m.time}</span>
                <button className="text-[9px] font-bold flex items-center gap-0.5" style={{ color: m.color }}>
                  View <ChevronRight className="h-2.5 w-2.5" />
                </button>
              </div>
            </div>
          ))}

          {/* Orchestration summary */}
          <div className="rounded-xl p-3 mt-2" style={{ background: `${CORAL}08`, border: `1px solid ${CORAL}20` }}>
            <div className="flex items-center gap-2 mb-1">
              <Zap className="h-3.5 w-3.5" style={{ color: CORAL }} />
              <p className="text-[10px] font-bold" style={{ color: CORAL }}>Assembly complete</p>
            </div>
            <p className="text-[10px] leading-relaxed" style={{ color: "#64748b" }}>
              17 outputs across 4 models. Assembled into 3 composite layouts. Brand compliance: 98%. Ready to approve.
            </p>
          </div>
        </div>

        {/* Agent notes */}
        <div className="border-t px-4 py-4 space-y-3" style={{ borderColor: BG4 }}>
          <p className="text-[9px] font-bold uppercase tracking-widest" style={{ color: "#475569" }}>AI Notes</p>
          {AGENT_NOTES.slice(0, 2).map((n, i) => (
            <div key={i} className="flex gap-2">
              <div className="h-4 w-4 rounded-full flex items-center justify-center text-[7px] font-bold shrink-0 mt-0.5"
                style={{ background: n.bg, color: n.color }}>{n.short}</div>
              <p className="text-[9px] leading-relaxed" style={{ color: "#64748b" }}>{n.msg}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Col 3: Output ────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="px-6 py-5 border-b flex items-center justify-between shrink-0" style={{ borderColor: BG4 }}>
          <div>
            <p className="text-[9px] font-bold uppercase tracking-widest mb-0.5" style={{ color: "#475569" }}>Output · 3 Compositions</p>
            <h2 className="text-base font-bold text-white font-['Poppins']">Q3 Launch Flyer · A4 Portrait</h2>
          </div>
          {!approved ? (
            <button onClick={() => setApproved(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white"
              style={{ background: CORAL }}>
              <Download className="h-4 w-4" /> Approve & Download
            </button>
          ) : (
            <div className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold" style={{ background: "#22c55e20", color: "#22c55e" }}>
              <Check className="h-4 w-4" /> Downloaded
            </div>
          )}
        </div>

        {/* Main preview + variants */}
        <div className="flex-1 min-h-0 p-6 flex gap-4 overflow-hidden">

          {/* Large preview */}
          <div className="flex-1 min-w-0 flex flex-col">
            <div className="flex-1 rounded-2xl flex items-end p-8 relative overflow-hidden"
              style={{ background: OUTPUT_VARIANTS[selected].gradient, border: `1px solid ${BG4}` }}>
              {/* Mock flyer content */}
              <div className="absolute top-8 left-8 right-8">
                <div className="h-1.5 w-20 rounded-full bg-white/30 mb-6" />
                <div className="h-1 w-32 rounded-full bg-white/20 mb-1.5" />
                <div className="h-1 w-24 rounded-full bg-white/15" />
              </div>
              <div className="w-full">
                <div className="h-2 w-40 rounded-full bg-white/60 mb-2" />
                <div className="h-1.5 w-32 rounded-full bg-white/40 mb-1" />
                <div className="h-1 w-24 rounded-full bg-white/25 mb-4" />
                <div className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-white text-[10px] font-bold" style={{ background: CORAL }}>
                  Register Now <ChevronRight className="h-3 w-3" />
                </div>
              </div>
              <div className="absolute top-4 right-4 text-[9px] font-bold px-2 py-0.5 rounded-full text-white" style={{ background: "rgba(255,255,255,0.15)" }}>
                {OUTPUT_VARIANTS[selected].label}
              </div>
              <div className="absolute top-4 left-4 text-[9px] font-bold px-2 py-0.5 rounded-full" style={{ background: `${CORAL}`, color: "white" }}>
                Brand {OUTPUT_VARIANTS[selected].score}%
              </div>
            </div>
          </div>

          {/* Variant thumbnails */}
          <div className="w-24 flex flex-col gap-3 shrink-0">
            <p className="text-[9px] font-bold uppercase tracking-widest" style={{ color: "#475569" }}>Variants</p>
            {OUTPUT_VARIANTS.map((v, i) => (
              <div key={i} onClick={() => setSelected(i)} className="cursor-pointer">
                <div className="rounded-xl overflow-hidden transition-all"
                  style={{ border: selected === i ? `2px solid ${CORAL}` : `1px solid ${BG4}`, boxShadow: selected === i ? `0 0 0 2px ${CORAL}30` : "none" }}>
                  <div className="aspect-[3/4]" style={{ background: v.gradient }} />
                </div>
                <p className="text-[8px] text-center mt-1" style={{ color: selected === i ? CORAL : "#475569" }}>{v.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Chat strip */}
        <div className="border-t px-6 py-3 flex gap-2 shrink-0" style={{ borderColor: BG4, background: BG2 }}>
          <div className="flex-1 flex gap-3 overflow-x-auto pb-1">
            {AGENT_NOTES.map((n, i) => (
              <div key={i} className="flex items-start gap-1.5 rounded-xl p-2.5 min-w-[220px] shrink-0" style={{ background: BG3 }}>
                <div className="h-4 w-4 rounded-full flex items-center justify-center text-[7px] font-bold shrink-0 mt-0.5"
                  style={{ background: n.bg, color: n.color }}>{n.short}</div>
                <p className="text-[9px] leading-relaxed" style={{ color: "#64748b" }}>{n.msg.slice(0, 80)}…</p>
              </div>
            ))}
          </div>
          <div className="flex gap-2 shrink-0 items-end">
            <input placeholder="Add a note…" readOnly className="text-[11px] px-3 py-1.5 rounded-lg outline-none w-36"
              style={{ background: BG3, color: "#94a3b8", border: `1px solid ${BG4}` }} />
            <button className="h-7 w-7 rounded-lg flex items-center justify-center" style={{ background: CORAL }}>
              <Send className="h-3 w-3 text-white" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
