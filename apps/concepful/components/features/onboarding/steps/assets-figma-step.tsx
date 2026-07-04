"use client";

import { Check, Eye, EyeOff, Figma, Link, Loader2, Upload, X, ImageIcon, FileText, Archive } from "lucide-react";
import { ObjectUploader } from "@workspace/object-storage-web";
import { cn } from "@/lib/utils";

export type UploadedAsset = { name: string; objectPath: string; contentType: string };
export type FigmaFrame = { id: string; name: string; pageId: string; pageName: string; thumbnailUrl: string | null };
export type FigmaData = { fileName: string; pages: { id: string; name: string }[]; frames: FigmaFrame[] };

interface AssetsFigmaStepProps {
  uploadedAssets: UploadedAsset[];
  setUploadedAssets: React.Dispatch<React.SetStateAction<UploadedAsset[]>>;
  figmaUrl: string;
  setFigmaUrl: (val: string) => void;
  figmaToken: string;
  setFigmaToken: (val: string) => void;
  showFigmaToken: boolean;
  setShowFigmaToken: React.Dispatch<React.SetStateAction<boolean>>;
  figmaLoading: boolean;
  figmaError: string | null;
  figmaData: FigmaData | null;
  selectedFrames: string[];
  toggleFrame: (id: string) => void;
  handleFigmaExtract: () => void;
}

export function AssetsFigmaStep({
  uploadedAssets,
  setUploadedAssets,
  figmaUrl,
  setFigmaUrl,
  figmaToken,
  setFigmaToken,
  showFigmaToken,
  setShowFigmaToken,
  figmaLoading,
  figmaError,
  figmaData,
  selectedFrames,
  toggleFrame,
  handleFigmaExtract,
}: AssetsFigmaStepProps) {
  const fileIcon = (name: string) => {
    const ext = name.split(".").pop()?.toLowerCase() ?? "";
    if (["jpg","jpeg","png","gif","webp","svg"].includes(ext)) return <ImageIcon className="h-4 w-4" />;
    if (["pdf"].includes(ext)) return <FileText className="h-4 w-4" />;
    return <Archive className="h-4 w-4" />;
  };

  return (
    <div className="space-y-8 w-full text-left">
      <div>
        <h2 className="text-2xl font-serif font-bold mb-2">Assets & References</h2>
        <p className="text-muted-foreground">
          Upload brand files and connect your Figma workspace. This step is optional — you can always add assets from your dashboard later.
        </p>
      </div>

      {/* File upload */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Upload className="h-4 w-4 text-primary" />
          <h3 className="font-semibold text-sm">Upload Brand Files</h3>
        </div>
        <p className="text-xs text-muted-foreground">
          Brand guides, logos, decks, existing creative (PDF, PNG, JPG, SVG, ZIP — up to 50 MB each)
        </p>

        <ObjectUploader
          maxNumberOfFiles={20}
          maxFileSize={52428800}
          onGetUploadParameters={async (file) => {
            const res = await fetch("/api/storage/uploads/request-url", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ name: file.name, size: file.size, contentType: file.type }),
            });
            const { uploadURL } = await res.json();
            return { method: "PUT" as const, url: uploadURL, headers: { "Content-Type": file.type } };
          }}
          onComplete={(result) => {
            const newAssets = (result.successful ?? []).map((f) => ({
              name: f.name,
              objectPath: `/objects/uploads/${f.name}`,
              contentType: f.type ?? "application/octet-stream",
            }));
            setUploadedAssets((prev) => [...prev, ...newAssets]);
          }}
          buttonClassName="flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-dashed border-border hover:border-primary/50 hover:bg-primary/5 transition-all text-sm font-medium text-muted-foreground hover:text-foreground w-full justify-center"
        >
          <Upload className="h-4 w-4" /> Choose files or drag & drop
        </ObjectUploader>

        {uploadedAssets.length > 0 && (
          <div className="space-y-2">
            {uploadedAssets.map((a, i) => (
              <div key={i} className="flex items-center gap-3 px-3 py-2 bg-secondary/30 rounded-lg border border-border/40">
                <span className="text-muted-foreground">{fileIcon(a.name)}</span>
                <span className="text-sm flex-1 truncate">{a.name}</span>
                <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                <button
                  type="button"
                  onClick={() => setUploadedAssets((prev) => prev.filter((_, j) => j !== i))}
                  className="text-muted-foreground hover:text-destructive transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Figma integration */}
      <div className="pt-6 border-t space-y-4">
        <div className="flex items-center gap-2">
          <Figma className="h-4 w-4 text-primary" />
          <h3 className="font-semibold text-sm">Connect a Figma File</h3>
        </div>
        <p className="text-xs text-muted-foreground">
          Paste a Figma file URL and your personal access token to extract frames and components directly into your workspace.
        </p>

        <div className="space-y-3">
          <div className="relative">
            <Link className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="url"
              value={figmaUrl}
              onChange={(e) => setFigmaUrl(e.target.value)}
              placeholder="https://www.figma.com/file/..."
              className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
          </div>

          <div className="relative">
            <input
              type={showFigmaToken ? "text" : "password"}
              value={figmaToken}
              onChange={(e) => setFigmaToken(e.target.value)}
              placeholder="Figma personal access token"
              className="w-full pr-10 pl-4 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary font-mono"
            />
            <button
              type="button"
              onClick={() => setShowFigmaToken((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showFigmaToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          <p className="text-[11px] text-muted-foreground">
            Get your token at <span className="font-mono text-foreground">figma.com → Settings → Personal access tokens</span>. It is used only for this extraction and is never stored.
          </p>

          <button
            type="button"
            onClick={handleFigmaExtract}
            disabled={!figmaUrl.trim() || !figmaToken.trim() || figmaLoading}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors"
          >
            {figmaLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Figma className="h-4 w-4" />}
            {figmaLoading ? "Extracting…" : "Extract Frames"}
          </button>
        </div>

        {figmaError && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            {figmaError}
          </div>
        )}

        {figmaData && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-sm">{figmaData.fileName}</p>
                <p className="text-xs text-muted-foreground">
                  {figmaData.pages.length} pages · {figmaData.frames.length} frames found
                </p>
              </div>
              {selectedFrames.length > 0 && (
                <span className="text-xs font-medium text-primary bg-primary/10 px-2.5 py-1 rounded-full">
                  {selectedFrames.length} selected
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-72 overflow-y-auto pr-1">
              {figmaData.frames.map((frame) => {
                const selected = selectedFrames.includes(frame.id);
                return (
                  <button
                    key={frame.id}
                    type="button"
                    onClick={() => toggleFrame(frame.id)}
                    className={cn(
                      "relative rounded-xl border-2 overflow-hidden text-left transition-all",
                      selected ? "border-primary shadow-md shadow-primary/20" : "border-border hover:border-border/80"
                    )}
                  >
                    {frame.thumbnailUrl ? (
                      <img src={frame.thumbnailUrl} alt={frame.name} className="w-full aspect-video object-cover bg-secondary/30" />
                    ) : (
                      <div className="w-full aspect-video bg-secondary/30 flex items-center justify-center">
                        <Figma className="h-6 w-6 text-muted-foreground/40" />
                      </div>
                    )}
                    <div className="px-2 py-1.5">
                      <p className="text-[11px] font-medium truncate">{frame.name}</p>
                      <p className="text-[10px] text-muted-foreground truncate">{frame.pageName}</p>
                    </div>
                    {selected && (
                      <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                        <Check className="h-3 w-3 text-primary-foreground" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
