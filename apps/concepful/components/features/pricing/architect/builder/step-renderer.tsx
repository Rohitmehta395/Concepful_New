"use client";

import { fmtPrice } from "@/lib/pricing-builder";
import { BUILDER_ADDONS } from "@/data/pricing/builder-addons";
import { BUILDER_CATEGORIES, BUILDER_SCOPES } from "@/data/pricing/builder-categories";
import type { 
  StepConfig, 
  BuilderTierId, 
  BuilderPriceBreakdown, 
  BuilderAnswers 
} from "@/types/pricing-builder";

interface StepRendererProps {
  step: StepConfig;
  index: number;
  tierId: BuilderTierId;
  activeCat: string | null;
  onCatChange: (id: string | null) => void;
  focus: string[];
  onToggleFocus: (scopeId: string) => void;
  onToggleStream: (label: string) => void;
  answers: BuilderAnswers;
  onSelect: (key: string, val: string) => void;
  onToggleMulti: (key: string, val: string) => void;
  addonIds: string[];
  onToggleAddon: (id: string) => void;
  price: BuilderPriceBreakdown;
  files: string[];
  onAddFiles: (names: string[]) => void;
  onRemoveFile: (name: string) => void;
}

export function StepRenderer({
  step,
  index,
  tierId,
  activeCat,
  onCatChange,
  focus,
  onToggleFocus,
  onToggleStream,
  answers,
  onSelect,
  onToggleMulti,
  addonIds,
  onToggleAddon,
  price,
  files,
  onAddFiles,
  onRemoveFile,
}: StepRendererProps) {
  const num = String(index + 1).padStart(2, "0");

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const names = Array.from(e.target.files || []).map((f) => f.name);
    if (names.length > 0) onAddFiles(names);
    e.target.value = "";
  };

  return (
    <div className="pa-q">
      <div className="pa-qn">{num}</div>
      <h2>{step.title}</h2>
      {step.sub && <p className="pa-q-hint">{step.sub}</p>}

      {step.type === "focus" && (
        <>
          <div className="pa-cats">
            {BUILDER_CATEGORIES.map((c) => {
              const categoryScopes = BUILDER_SCOPES.filter((s) => s.categoryIds.includes(c.id));
              const hasSelection = categoryScopes.some((s) => focus.includes(s.id));
              return (
                <button
                  key={c.id}
                  className={
                    "pa-cat" +
                    (activeCat === c.id ? " on" : "") +
                    (hasSelection ? " has" : "")
                  }
                  onClick={() => onCatChange(activeCat === c.id ? null : c.id)}
                >
                  {c.label}
                </button>
              );
            })}
          </div>
          {activeCat && (
            <div className="pa-subs">
              {BUILDER_SCOPES.filter((s) => s.categoryIds.includes(activeCat)).map((s) => {
                const on = focus.includes(s.id);
                return (
                  <button
                    key={s.id}
                    className={"pa-chip" + (on ? " on" : "")}
                    onClick={() => onToggleFocus(s.id)}
                  >
                    {on ? "✓ " : ""}
                    {s.label}
                  </button>
                );
              })}
            </div>
          )}
        </>
      )}

      {step.type === "streams" && (
        <div className="pa-cats">
          {BUILDER_CATEGORIES.filter((c) => c.id !== "else").map((c) => (
            <button
              key={c.id}
              className={"pa-cat" + (focus.includes(c.id) ? " on" : "")}
              onClick={() => onToggleStream(c.id)}
            >
              {focus.includes(c.id) ? "✓ " : ""}
              {c.label}
            </button>
          ))}
        </div>
      )}

      {step.type === "single" && (
        <div className={"pa-subs" + (step.col ? " col" : "")}>
          {step.options?.map((o) => (
            <button
              key={o}
              className={"pa-chip" + (answers[step.id] === o ? " on" : "")}
              onClick={() => onSelect(step.id, o)}
            >
              {answers[step.id] === o ? "✓ " : ""}
              {o}
            </button>
          ))}
        </div>
      )}

      {step.type === "dual" && step.a && step.b && (
        <>
          <h3 className="pa-q-sub">{step.a.label}</h3>
          <div className="pa-subs">
            {step.a.options.map((o) => (
              <button
                key={o}
                className={"pa-chip" + (answers[step.a!.key] === o ? " on" : "")}
                onClick={() => onSelect(step.a!.key, o)}
              >
                {answers[step.a!.key] === o ? "✓ " : ""}
                {o}
              </button>
            ))}
          </div>
          <h3 className="pa-q-sub">{step.b.label}</h3>
          <div className="pa-subs">
            {step.b.options.map((o) => (
              <button
                key={o}
                className={"pa-chip" + (answers[step.b!.key] === o ? " on" : "")}
                onClick={() => onSelect(step.b!.key, o)}
              >
                {answers[step.b!.key] === o ? "✓ " : ""}
                {o}
              </button>
            ))}
          </div>
        </>
      )}

      {step.type === "addons" && (
        <div className="pa-addons">
          {BUILDER_ADDONS.filter((a) => a.tiers.includes(tierId)).map((a) => {
            const on = addonIds.includes(a.id);
            const p = price.isOneTime ? a.oneTime : a.monthly;
            if (p === null) return null;
            return (
              <button
                key={a.id}
                className={"pa-addon" + (on ? " on" : "") + (a.hot ? " hot" : "")}
                onClick={() => onToggleAddon(a.id)}
              >
                <span className="pa-a-top">
                  <span className="pa-a-name">
                    {on ? "✓ " : ""}
                    {a.label}
                  </span>
                  <span className="pa-a-price">
                    +{fmtPrice(p)}
                    {price.isOneTime ? "" : "/mo"}
                  </span>
                </span>
                <span className="pa-a-blurb">{a.blurb}</span>
              </button>
            );
          })}
        </div>
      )}

      {(step.type === "docs" || step.type === "teamdocs") && (
        <>
          {step.type === "teamdocs" && step.a && step.b && (
            <>
              <h3 className="pa-q-sub">{step.a.label}</h3>
              <div className="pa-subs">
                {step.a.options.map((o) => (
                  <button
                    key={o}
                    className={"pa-chip" + (answers[step.a!.key] === o ? " on" : "")}
                    onClick={() => onSelect(step.a!.key, o)}
                  >
                    {answers[step.a!.key] === o ? "✓ " : ""}
                    {o}
                  </button>
                ))}
              </div>
              <h3 className="pa-q-sub">{step.b.label}</h3>
              <div className="pa-subs">
                {step.b.options.map((o) => {
                  const currentList = (answers[step.b!.key] as string[] | undefined) || [];
                  const on = currentList.includes(o);
                  return (
                    <button
                      key={o}
                      className={"pa-chip" + (on ? " on" : "")}
                      onClick={() => onToggleMulti(step.b!.key, o)}
                    >
                      {on ? "✓ " : ""}
                      {o}
                    </button>
                  );
                })}
              </div>
              <h3 className="pa-q-sub">Brief & reference materials</h3>
            </>
          )}
          <label className="pa-drop">
            <input type="file" multiple onChange={handleFiles} />
            <span className="pa-drop-big">Drop files or tap to upload</span>
            <span className="pa-drop-small">
              Brief, decks, sketches, reference files, links doc — anything that helps us quote accurately.
            </span>
          </label>
          {files.length > 0 && (
            <ul className="pa-files">
              {files.map((f) => (
                <li key={f}>
                  <span>{f}</span>
                  <button type="button" onClick={() => onRemoveFile(f)}>
                    ×
                  </button>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
