import { useState } from "react";
import { Check, ChevronDown, Download, FileText, Image, Layout, Mail, Monitor, Sparkles, Zap, ArrowRight } from "lucide-react";

const CORAL = "hsl(349,90%,54%)";
const NAVY  = "hsl(232,28%,11%)";

const FORMATS = [
  { label: "Event Flyer",    icon: FileText, dims: "A4 Portrait" },
  { label: "Social Post",   icon: Image,    dims: "1:1 · 1080px" },
  { label: "Story",         icon: Layout,   dims: "9:16 · 1080px" },
  { label: "Email Header",  icon: Mail,     dims: "600×200px" },
  { label: "OOH Billboard", icon: Monitor,  dims: "14:3" },
];

const RESULTS = [
  { gradient: "linear-gradient(160deg,#1a0533,#4c1d95,#7c3aed)", label: "Editorial Dark"  },
  { gradient: "linear-gradient(160deg,#2d0a0a,#9b1c1c,#f87171)", label: "Bold Red"        },
  { gradient: "linear-gradient(160deg,#0c1a38,#1e3a8a,#38bdf8)", label: "Corporate Blue" },
  { gradient: "linear-gradient(160deg,#1a0533,#6d28d9,#ec4899)", label: "Vibrant Purple"  },
];

type Phase = "idle" | "generating" | "done";

export function Forge() {
  const [format, setFormat] = useState(0);
  const [prompt, setPrompt] = useState("");
  const [phase, setPhase] = useState<Phase>("idle");
  const [selected, setSelected] = useState(0);
  const [downloaded, setDownloaded] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleGenerate = () => {
    if (phase !== "idle") return;
    setPhase("generating");
    setProgress(0);
    setDownloaded(false);
    let p = 0;
    const iv = setInterval(() => {
      p += Math.random() * 30;
      if (p >= 100) { p = 100; clearInterval(iv); setTimeout(() => setPhase("done"), 200); }
      setProgress(Math.min(p, 100));
    }, 180);
  };

  const reset = () => { setPhase("idle"); setProgress(0); setDownloaded(false); };

  return (
    <div className="min-h-screen font-['Inter'] flex flex-col" style={{ background: "#f8f9fc" }}>

      {/* Top bar */}
      <header className="bg-white border-b border-[#e8eaf0] px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-xl flex items-center justify-center" style={{ background: CORAL }}>
            <span className="text-white text-[10px] font-black">C</span>
          </div>
          <span className="text-sm font-bold" style={{ color: NAVY }}>Concepful Forge</span>
          <span className="ml-2 text-[10px] px-2 py-0.5 rounded-full font-bold" style={{ background: `${CORAL}12`, color: CORAL }}>AI-Powered</span>
        </div>
        <div className="flex items-center gap-3 text-xs text-[#94a3b8]">
          <span className="flex items-center gap-1"><div className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Gemini 2.0 Flash · active</span>
          <div className="h-6 w-6 rounded-full flex items-center justify-center text-[9px] font-bold text-white" style={{ background: NAVY }}>SB</div>
        </div>
      </header>

      <div className="flex-1 flex flex-col items-center justify-start px-8 pt-12 pb-8">

        {/* Hero section */}
        <div className="w-full max-w-2xl text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-5 text-[10px] font-bold"
            style={{ background: `${CORAL}10`, color: CORAL }}>
            <Sparkles className="h-3 w-3" /> AI produces your final in seconds
          </div>
          <h1 className="text-3xl font-bold font-['Poppins'] mb-2" style={{ color: NAVY }}>
            What do you need?
          </h1>
          <p className="text-[#94a3b8] text-sm">Describe it. Pick a format. Download the final.</p>
        </div>

        {/* Format picker */}
        <div className="flex gap-2 mb-6 flex-wrap justify-center">
          {FORMATS.map((f, i) => (
            <button key={f.label} onClick={() => { setFormat(i); reset(); }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all"
              style={{
                background: format === i ? CORAL : "white",
                color: format === i ? "white" : "#64748b",
                border: format === i ? "none" : "1px solid #e8eaf0",
              }}>
              <f.icon className="h-3.5 w-3.5" /> {f.label}
              <span className="opacity-60 font-normal">· {f.dims}</span>
            </button>
          ))}
        </div>

        {/* Prompt area */}
        <div className="w-full max-w-2xl mb-4">
          <div className="bg-white rounded-2xl border border-[#e8eaf0] p-5 shadow-sm">
            <textarea
              className="w-full text-sm text-[#0f172a] bg-transparent outline-none resize-none placeholder:text-[#cbd5e1]"
              rows={3}
              placeholder={`Describe your ${FORMATS[format].label.toLowerCase()}… e.g. "Launch event for Q3 Campaign, Friday June 20, 7pm — bold and editorial"`}
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              readOnly={phase !== "idle"}
            />
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#f1f5f9]">
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-[#94a3b8]">Using:</span>
                {["Q3 Hero", "Coral Palette", "Logo v4", "Inter font"].map(t => (
                  <span key={t} className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-[#f1f5f9] text-[#64748b]">{t}</span>
                ))}
              </div>
              <button onClick={handleGenerate} disabled={phase !== "idle"}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-all"
                style={{ background: phase === "idle" ? CORAL : "#94a3b8", cursor: phase === "idle" ? "pointer" : "not-allowed" }}>
                <Zap className="h-4 w-4" />
                {phase === "idle" ? "Generate" : phase === "generating" ? "Generating…" : "Done"}
              </button>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        {phase === "generating" && (
          <div className="w-full max-w-2xl mb-6">
            <div className="bg-white rounded-2xl border border-[#e8eaf0] p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 rounded-full flex items-center justify-center text-[7px] font-bold bg-[#818cf820] text-[#818cf8]">G2</div>
                  <span className="text-xs font-medium text-[#64748b]">Gemini 2.0 Flash generating 4 {FORMATS[format].label.toLowerCase()} options…</span>
                </div>
                <span className="text-[10px] font-bold" style={{ color: CORAL }}>{Math.round(progress)}%</span>
              </div>
              <div className="h-1.5 bg-[#f1f5f9] rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all" style={{ width: `${progress}%`, background: CORAL }} />
              </div>
              <p className="text-[9px] mt-2 text-[#94a3b8]">Using approved Q3 assets · Brand guard active · Est. 3s</p>
            </div>
          </div>
        )}

        {/* Results */}
        {phase === "done" && (
          <div className="w-full max-w-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-emerald-400" />
                <p className="text-sm font-bold" style={{ color: NAVY }}>4 options generated · ⚡ 3.1s · Brand score 98%</p>
              </div>
              <button onClick={reset} className="text-xs text-[#94a3b8] hover:text-[#64748b]">Start over</button>
            </div>

            {/* Filmstrip */}
            <div className="grid grid-cols-4 gap-3 mb-6">
              {RESULTS.map((r, i) => (
                <div key={i} onClick={() => setSelected(i)} className="cursor-pointer">
                  <div className="rounded-xl overflow-hidden transition-all"
                    style={{ border: selected === i ? `2px solid ${CORAL}` : "2px solid transparent", boxShadow: selected === i ? `0 0 0 3px ${CORAL}20` : "none" }}>
                    <div className="aspect-[3/4] flex items-end p-3 relative" style={{ background: r.gradient }}>
                      {selected === i && (
                        <div className="absolute top-2 right-2 h-5 w-5 rounded-full flex items-center justify-center" style={{ background: CORAL }}>
                          <Check className="h-3 w-3 text-white" />
                        </div>
                      )}
                      <div className="w-full space-y-1">
                        <div className="h-1 w-14 rounded-full bg-white/50" />
                        <div className="h-0.5 w-9 rounded-full bg-white/30" />
                      </div>
                    </div>
                  </div>
                  <p className="text-[10px] font-medium text-center mt-1.5 text-[#64748b]">{r.label}</p>
                </div>
              ))}
            </div>

            {/* Download */}
            <div className="bg-white rounded-2xl border border-[#e8eaf0] p-5 flex items-center justify-between">
              <div>
                <p className="text-sm font-bold" style={{ color: NAVY }}>{RESULTS[selected].label} · {FORMATS[format].label}</p>
                <p className="text-[11px] text-[#94a3b8] mt-0.5">Print-ready PDF + web PNG · {FORMATS[format].dims} · Gemini 2.0 Flash</p>
              </div>
              <button onClick={() => setDownloaded(true)}
                className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white transition-all"
                style={{ background: downloaded ? "#22c55e" : CORAL }}>
                {downloaded ? <><Check className="h-4 w-4" /> Downloaded!</> : <><Download className="h-4 w-4" /> Download Final</>}
              </button>
            </div>

            {/* Agent note */}
            <div className="mt-3 px-1 flex items-center gap-2">
              <div className="h-4 w-4 rounded-full flex items-center justify-center text-[7px] font-bold bg-[#818cf820] text-[#818cf8]">G2</div>
              <p className="text-[10px] text-[#94a3b8]">Gemini 2.0 Flash · Q3 Hero + Coral palette · Brand compliance 98% · Generated in 3.1s</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
