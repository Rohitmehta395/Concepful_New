import { useState } from "react";
import { Download, Layers, MessageSquare, Sparkles, Zap, ChevronRight, Check, Plus, Image, FileText, Layout, Send, Bell, Globe } from "lucide-react";

const CORAL  = "hsl(349,90%,54%)";
const NAVY   = "hsl(232,28%,11%)";
const BG     = "#0a0c14";
const BG2    = "#0f1219";
const BG3    = "#161b26";
const BG4    = "#1e2535";

// Agent identity system
const AGENTS = {
  gemini:  { label: "Gemini 2.0 Flash",   short: "G2",  color: "#818cf8", bg: "#818cf820" },
  claude:  { label: "Claude 3.5 Sonnet",  short: "C",   color: "#fb923c", bg: "#fb923c20" },
  imagen:  { label: "Imagen 3",           short: "I3",  color: "#f472b6", bg: "#f472b620" },
};

const THREAD = [
  { type: "human",  author: "Sarah B.", body: "I need a launch flyer for the Q3 campaign — portrait, use the hero artwork as the base visual.", time: "10:14 AM" },
  {
    type: "agent", agent: "gemini",
    body: "On it. Pulling approved Q3 Hero artwork + coral palette. Generating 4 A4 portrait layout concepts now.",
    meta: "⚡ 2.8s · Q3 Hero · Coral palette · Inter font",
    time: "10:14 AM",
    previews: [
      "linear-gradient(160deg,#1a0533,#4c1d95,#7c3aed)",
      "linear-gradient(160deg,#0c1a38,#1e3a8a,#3b82f6)",
      "linear-gradient(160deg,#1a0a2e,#6d28d9,#ec4899)",
      "linear-gradient(160deg,#0f2d1a,#065f46,#34d399)",
    ],
    selected: 2,
  },
  { type: "human",  author: "Sarah B.", body: "Option 3 is close — can you punch up the headline and tighten the layout? We want it more editorial.", time: "10:16 AM" },
  {
    type: "agent", agent: "claude",
    body: "Rewriting headline variants with editorial tone. 6 options generated — top 3 shown. Handing off to Imagen for layout refinement.",
    meta: "⚡ 1.2s · Copy-focused · Brand voice: Concepful",
    time: "10:16 AM",
    headlines: ["The Future Is Already Here.", "Shape What Comes Next.", "Build What Others Imagine."],
  },
  {
    type: "agent", agent: "imagen",
    body: "Layout refined with headline 1. Final portrait flyer ready — A4 300dpi, print-ready PDF + web PNG included.",
    meta: "⚡ 3.4s · Brand score: 98% · Ready to download",
    time: "10:17 AM",
    final: true,
  },
];

const BRAND_COLORS = [CORAL, "#141824", "#1e2535", "#818cf8", "#ffffff"];
const FORMATS = ["Flyer A4", "Story 9:16", "Banner 1:1", "Email 600px", "Billboard", "Deck Slide"];

export function StudioAI() {
  const [activeFormat, setActiveFormat] = useState("Flyer A4");
  const [prompt, setPrompt] = useState("Launch flyer for Q3 campaign, portrait, editorial");
  const [downloaded, setDownloaded] = useState(false);

  return (
    <div className="flex h-screen font-['Inter'] overflow-hidden" style={{ background: BG }}>

      {/* ── LEFT: Brand Kit ─────────────────────── */}
      <aside className="w-[220px] flex flex-col shrink-0 border-r" style={{ borderColor: BG4 }}>
        <div className="px-5 py-5 border-b" style={{ borderColor: BG4 }}>
          <div className="flex items-center gap-2 mb-1">
            <div className="h-7 w-7 rounded-xl flex items-center justify-center" style={{ background: CORAL }}>
              <span className="text-white text-[10px] font-black">C</span>
            </div>
            <span className="text-sm font-bold text-white">Studio AI</span>
          </div>
          <p className="text-[9px]" style={{ color: "#475569" }}>Acme Inc. · Q3 Campaign</p>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">

          {/* Brand Kit */}
          <div>
            <p className="text-[9px] font-bold uppercase tracking-widest mb-3" style={{ color: "#475569" }}>Brand Kit</p>
            <div className="flex gap-1.5 flex-wrap mb-3">
              {BRAND_COLORS.map((c, i) => (
                <div key={i} className="h-5 w-5 rounded-full border border-white/10" style={{ background: c }} />
              ))}
            </div>
            <p className="text-[10px] mb-1" style={{ color: "#64748b" }}>Inter · Poppins</p>
            <p className="text-[10px]" style={{ color: "#64748b" }}>Logo v4 · approved</p>
          </div>

          {/* Approved Assets */}
          <div>
            <p className="text-[9px] font-bold uppercase tracking-widest mb-2.5" style={{ color: "#475569" }}>Approved Assets</p>
            <div className="space-y-1.5">
              {[
                { name: "Q3 Hero Artwork", type: "Image", gradient: "linear-gradient(135deg,#1a0533,#7c3aed)" },
                { name: "Moodboard v2",    type: "Figma", gradient: "linear-gradient(135deg,#0c1a38,#2563eb)" },
                { name: "Brand Brief",     type: "Doc",   gradient: "linear-gradient(135deg,#052e1a,#059669)" },
              ].map(a => (
                <div key={a.name} className="flex items-center gap-2 p-2 rounded-lg cursor-pointer" style={{ background: BG3 }}>
                  <div className="h-7 w-7 rounded-md shrink-0" style={{ background: a.gradient }} />
                  <div className="min-w-0">
                    <p className="text-[10px] font-semibold text-white truncate leading-none">{a.name}</p>
                    <p className="text-[9px] mt-0.5" style={{ color: "#475569" }}>{a.type}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Active Models */}
          <div>
            <p className="text-[9px] font-bold uppercase tracking-widest mb-2.5" style={{ color: "#475569" }}>AI Models</p>
            <div className="space-y-1.5">
              {Object.entries(AGENTS).map(([key, a]) => (
                <div key={key} className="flex items-center gap-2 p-2 rounded-lg" style={{ background: BG3 }}>
                  <div className="h-5 w-5 rounded-full flex items-center justify-center text-[8px] font-bold shrink-0"
                    style={{ background: a.bg, color: a.color }}>{a.short}</div>
                  <p className="text-[10px] font-medium truncate" style={{ color: "#94a3b8" }}>{a.label}</p>
                  <div className="ml-auto h-1.5 w-1.5 rounded-full bg-emerald-400 shrink-0" />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="px-4 py-3 border-t" style={{ borderColor: BG4 }}>
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-full flex items-center justify-center text-[9px] font-bold text-white" style={{ background: BG3 }}>SB</div>
            <div>
              <p className="text-[10px] font-semibold text-white">Sarah B.</p>
              <p className="text-[9px]" style={{ color: "#475569" }}>Acme Inc.</p>
            </div>
          </div>
        </div>
      </aside>

      {/* ── CENTER: Generation ────────────────── */}
      <main className="flex-1 flex flex-col min-w-0 border-r" style={{ borderColor: BG4 }}>
        <div className="px-6 py-4 border-b flex items-center gap-3 shrink-0" style={{ borderColor: BG4 }}>
          <Sparkles className="h-4 w-4" style={{ color: CORAL }} />
          <span className="text-sm font-bold text-white">Create</span>
          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full" style={{ background: `${CORAL}15`, color: CORAL }}>Auto mode · Gemini 2.0 Flash</span>
        </div>

        {/* Format selector */}
        <div className="px-6 py-3 border-b flex gap-2 shrink-0" style={{ borderColor: BG4 }}>
          {FORMATS.map(f => (
            <button key={f} onClick={() => setActiveFormat(f)}
              className="px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all"
              style={{
                background: activeFormat === f ? CORAL : BG3,
                color: activeFormat === f ? "white" : "#64748b",
              }}>{f}</button>
          ))}
        </div>

        {/* Prompt */}
        <div className="px-6 py-4 shrink-0">
          <div className="flex gap-2 items-start p-3 rounded-xl" style={{ background: BG3, border: `1px solid ${BG4}` }}>
            <textarea
              className="flex-1 text-sm bg-transparent outline-none resize-none text-white placeholder:text-[#334155]"
              rows={2}
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
            />
            <button className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold text-white shrink-0" style={{ background: CORAL }}>
              <Zap className="h-3.5 w-3.5" /> Generate
            </button>
          </div>
          <p className="text-[9px] mt-2 px-1" style={{ color: "#334155" }}>
            Auto-injecting: Q3 Hero · Coral Palette · Inter · Logo v4
          </p>
        </div>

        {/* Results grid */}
        <div className="flex-1 overflow-y-auto px-6 pb-6">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "#475569" }}>Latest Generation · 4 options · ⚡ 3.4s</p>
            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full" style={{ background: "#22c55e20", color: "#22c55e" }}>Brand score: 98%</span>
          </div>
          <div className="grid grid-cols-4 gap-3 mb-4">
            {[
              "linear-gradient(160deg,#1a0533,#4c1d95,#7c3aed)",
              "linear-gradient(160deg,#0c1a38,#1e3a8a,#3b82f6)",
              "linear-gradient(160deg,#1a0a2e,#6d28d9,#ec4899)",
              "linear-gradient(160deg,#0f2d1a,#065f46,#34d399)",
            ].map((g, i) => (
              <div key={i} className="rounded-xl overflow-hidden cursor-pointer transition-all"
                style={{
                  border: i === 2 ? `2px solid ${CORAL}` : `1px solid ${BG4}`,
                  boxShadow: i === 2 ? `0 0 0 3px ${CORAL}25` : "none",
                }}>
                <div className="aspect-[3/4] flex items-end p-3 relative" style={{ background: g }}>
                  {i === 2 && (
                    <div className="absolute top-2 right-2 h-5 w-5 rounded-full flex items-center justify-center" style={{ background: CORAL }}>
                      <Check className="h-3 w-3 text-white" />
                    </div>
                  )}
                  <div className="w-full">
                    <div className="h-1 w-16 rounded-full bg-white/40 mb-1.5" />
                    <div className="h-0.5 w-10 rounded-full bg-white/20" />
                  </div>
                </div>
                <div className="px-2.5 py-2" style={{ background: BG3 }}>
                  <p className="text-[9px] font-bold text-white">Option {i + 1}</p>
                  {i === 2 && (
                    <button onClick={() => setDownloaded(true)}
                      className="w-full flex items-center justify-center gap-1 mt-1.5 py-1 rounded-lg text-[9px] font-bold transition-all"
                      style={{ background: downloaded ? "#22c55e" : CORAL, color: "white" }}>
                      {downloaded ? <><Check className="h-2.5 w-2.5" /> Downloaded</> : <><Download className="h-2.5 w-2.5" /> Download</>}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Headline options from Claude */}
          <div className="rounded-xl p-4" style={{ background: BG3, border: `1px solid ${BG4}` }}>
            <div className="flex items-center gap-2 mb-3">
              <div className="h-4 w-4 rounded-full flex items-center justify-center text-[7px] font-bold"
                style={{ background: AGENTS.claude.bg, color: AGENTS.claude.color }}>C</div>
              <p className="text-[9px] font-bold" style={{ color: AGENTS.claude.color }}>Claude 3.5 Sonnet · headline variants</p>
            </div>
            <div className="space-y-1.5">
              {["The Future Is Already Here.", "Shape What Comes Next.", "Build What Others Imagine."].map((h, i) => (
                <div key={h} className="flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer"
                  style={{ background: i === 0 ? `${CORAL}10` : BG4, border: `1px solid ${i === 0 ? `${CORAL}30` : "transparent"}` }}>
                  <span className="text-[10px] font-semibold" style={{ color: i === 0 ? CORAL : "#94a3b8" }}>{h}</span>
                  {i === 0 && <Check className="h-3 w-3 ml-auto shrink-0" style={{ color: CORAL }} />}
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* ── RIGHT: Agent Thread ─────────────────── */}
      <aside className="w-[300px] shrink-0 flex flex-col" style={{ background: BG2 }}>
        <div className="px-5 py-4 border-b flex items-center gap-2 shrink-0" style={{ borderColor: BG4 }}>
          <MessageSquare className="h-3.5 w-3.5" style={{ color: CORAL }} />
          <p className="text-xs font-bold text-white">Thread</p>
          <span className="ml-auto text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: `${CORAL}20`, color: CORAL }}>3 agents active</span>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {THREAD.map((msg, i) => {
            const isAgent = msg.type === "agent";
            const agent = isAgent ? AGENTS[msg.agent as keyof typeof AGENTS] : null;
            return (
              <div key={i} className={`${isAgent ? "" : "flex flex-col items-end"}`}>
                {isAgent ? (
                  <div className="rounded-xl p-3" style={{ background: BG3, border: `1px solid ${BG4}` }}>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="h-5 w-5 rounded-full flex items-center justify-center text-[8px] font-bold shrink-0"
                        style={{ background: agent!.bg, color: agent!.color }}>{agent!.short}</div>
                      <span className="text-[10px] font-bold" style={{ color: agent!.color }}>{agent!.label}</span>
                      <span className="ml-auto text-[9px]" style={{ color: "#334155" }}>{msg.time}</span>
                    </div>
                    <p className="text-[11px] leading-relaxed mb-2" style={{ color: "#94a3b8" }}>{msg.body}</p>
                    {msg.previews && (
                      <div className="grid grid-cols-4 gap-1 mb-2">
                        {msg.previews.map((g: string, pi: number) => (
                          <div key={pi} className="rounded-md aspect-[3/4]" style={{ background: g,
                            border: pi === msg.selected ? `1.5px solid ${CORAL}` : "1px solid transparent" }} />
                        ))}
                      </div>
                    )}
                    {msg.headlines && (
                      <div className="space-y-1">
                        {msg.headlines.map((h: string, hi: number) => (
                          <p key={hi} className="text-[9px] font-medium px-2 py-1 rounded-md"
                            style={{ background: BG4, color: hi === 0 ? CORAL : "#64748b" }}>{h}</p>
                        ))}
                      </div>
                    )}
                    {msg.final && (
                      <div className="flex items-center gap-1.5 mt-1">
                        <div className="h-2 w-2 rounded-full bg-emerald-400" />
                        <span className="text-[9px] font-bold text-emerald-400">Final ready · A4 300dpi + web PNG</span>
                      </div>
                    )}
                    <p className="text-[9px] mt-2" style={{ color: "#334155" }}>{msg.meta}</p>
                  </div>
                ) : (
                  <div>
                    <p className="text-[9px] mb-1 text-right" style={{ color: "#475569" }}>{msg.author} · {msg.time}</p>
                    <div className="rounded-xl px-3 py-2.5 max-w-[85%] ml-auto" style={{ background: `${CORAL}15` }}>
                      <p className="text-[11px] leading-relaxed" style={{ color: "#e2e8f0" }}>{msg.body}</p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="px-4 py-3 border-t" style={{ borderColor: BG4 }}>
          <div className="flex gap-2">
            <input placeholder="Brief the agents or message your team…" readOnly
              className="flex-1 text-[11px] px-3 py-2 rounded-xl outline-none"
              style={{ background: BG3, color: "#94a3b8", border: `1px solid ${BG4}` }} />
            <button className="h-8 w-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: CORAL }}>
              <Send className="h-3.5 w-3.5 text-white" />
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
}
