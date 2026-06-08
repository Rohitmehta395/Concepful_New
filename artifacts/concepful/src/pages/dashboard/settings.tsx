import { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ObjectUploader } from "@workspace/object-storage-web";
import { Upload, FileText, BookOpen, ClipboardList, Check, X, ImageIcon, Archive } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

type UploadedFile = { name: string; contentType: string; uploadedAt: string };
type RFQ = { title: string; description: string; deadline: string; budget: string; submittedAt: string };

function fileIcon(name: string) {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  if (["jpg","jpeg","png","gif","webp","svg"].includes(ext)) return <ImageIcon className="h-4 w-4" />;
  if (["pdf"].includes(ext)) return <FileText className="h-4 w-4" />;
  return <Archive className="h-4 w-4" />;
}

async function requestUploadUrl(file: { name: string; size: number; type: string }) {
  const res = await fetch("/api/storage/uploads/request-url", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: file.name, size: file.size, contentType: file.type }),
  });
  const { uploadURL } = await res.json();
  return { method: "PUT" as const, url: uploadURL, headers: { "Content-Type": file.type } };
}

const SAMPLE_DOCS = [
  { name: "Onboarding Brief.pdf", type: "Brief", date: "Jun 3, 2026", badge: "Active" },
  { name: "Brand Guidelines v1.pdf", type: "Document", date: "Jun 3, 2026", badge: "Draft" },
  { name: "Project Scope — Q3.pdf", type: "Scope", date: "Jun 3, 2026", badge: "Active" },
];

const REF_CATEGORIES = [
  { id: "mood", label: "Brand Mood Board", description: "Visual direction, color palettes, typography references" },
  { id: "competitors", label: "Competitor Examples", description: "Screenshots and examples from competitors" },
  { id: "inspiration", label: "Content Inspiration", description: "Articles, posts, and content you admire" },
  { id: "specs", label: "Technical Specs", description: "Size guides, file formats, platform requirements" },
];

export default function AccountSettings() {
  const { toast } = useToast();
  const [uploads, setUploads] = useState<UploadedFile[]>([]);

  const [rfqTitle, setRfqTitle] = useState("");
  const [rfqDescription, setRfqDescription] = useState("");
  const [rfqDeadline, setRfqDeadline] = useState("");
  const [rfqBudget, setRfqBudget] = useState("");
  const [rfqs, setRfqs] = useState<RFQ[]>([]);

  const handleRfqSubmit = () => {
    if (!rfqTitle.trim() || !rfqDescription.trim()) return;
    setRfqs(prev => [...prev, {
      title: rfqTitle,
      description: rfqDescription,
      deadline: rfqDeadline,
      budget: rfqBudget,
      submittedAt: new Date().toISOString(),
    }]);
    setRfqTitle(""); setRfqDescription(""); setRfqDeadline(""); setRfqBudget("");
    toast({ title: "RFQ Submitted", description: "Your request for quote has been sent to the team." });
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl space-y-6">
        <div>
          <h1 className="text-2xl font-serif font-bold">Account Settings</h1>
          <p className="text-muted-foreground mt-1">Manage uploads, documents, reference materials, and project requests.</p>
        </div>

        <Tabs defaultValue="uploads">
          <TabsList className="mb-6 flex-wrap gap-1 h-auto">
            <TabsTrigger value="uploads" className="flex items-center gap-1.5">
              <Upload className="h-3.5 w-3.5" /> Uploads
            </TabsTrigger>
            <TabsTrigger value="docs" className="flex items-center gap-1.5">
              <BookOpen className="h-3.5 w-3.5" /> Documentation
            </TabsTrigger>
            <TabsTrigger value="references" className="flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5" /> References
            </TabsTrigger>
            <TabsTrigger value="rfq" className="flex items-center gap-1.5">
              <ClipboardList className="h-3.5 w-3.5" /> RFQs
            </TabsTrigger>
          </TabsList>

          {/* ── Uploads ── */}
          <TabsContent value="uploads">
            <Card>
              <CardHeader>
                <CardTitle className="font-serif">Brand & Project Uploads</CardTitle>
                <CardDescription>
                  Upload brand files, creative assets, and project materials. Files are stored securely and shared with your creative team.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <ObjectUploader
                  maxNumberOfFiles={50}
                  maxFileSize={104857600}
                  onGetUploadParameters={requestUploadUrl}
                  onComplete={(result) => {
                    const newFiles = (result.successful ?? []).map(f => ({
                      name: f.name,
                      contentType: f.type ?? "application/octet-stream",
                      uploadedAt: new Date().toISOString(),
                    }));
                    setUploads(prev => [...prev, ...newFiles]);
                    if (newFiles.length) {
                      toast({ title: `${newFiles.length} file${newFiles.length > 1 ? "s" : ""} uploaded` });
                    }
                  }}
                  buttonClassName="flex items-center gap-2 px-5 py-4 rounded-xl border-2 border-dashed border-border hover:border-primary/50 hover:bg-primary/5 transition-all text-sm font-medium text-muted-foreground hover:text-foreground w-full justify-center"
                >
                  <Upload className="h-4 w-4" /> Drop files here or click to browse
                </ObjectUploader>

                {uploads.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {uploads.length} file{uploads.length > 1 ? "s" : ""} uploaded this session
                    </p>
                    {uploads.map((f, i) => (
                      <div key={i} className="flex items-center gap-3 px-3 py-2.5 bg-secondary/30 rounded-lg border border-border/40">
                        <span className="text-muted-foreground">{fileIcon(f.name)}</span>
                        <span className="text-sm flex-1 truncate font-medium">{f.name}</span>
                        <span className="text-xs text-muted-foreground shrink-0">
                          {new Date(f.uploadedAt).toLocaleDateString()}
                        </span>
                        <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                        <button
                          type="button"
                          onClick={() => setUploads(prev => prev.filter((_, j) => j !== i))}
                          className="text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="rounded-lg bg-secondary/30 border border-border/40 px-4 py-3 text-xs text-muted-foreground">
                  Supported: PDF, PNG, JPG, SVG, ZIP, AI, PSD · Max 100 MB per file · Up to 50 files per upload
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Documentation ── */}
          <TabsContent value="docs">
            <Card>
              <CardHeader>
                <CardTitle className="font-serif">Documentation</CardTitle>
                <CardDescription>
                  Project briefs, scope documents, statements of work, and deliverable checklists.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="divide-y divide-border/40">
                  {SAMPLE_DOCS.map((doc, i) => (
                    <div key={i} className="flex items-center gap-4 py-3">
                      <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{doc.name}</p>
                        <p className="text-xs text-muted-foreground">{doc.type} · {doc.date}</p>
                      </div>
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-xs shrink-0",
                          doc.badge === "Active"
                            ? "text-emerald-600 border-emerald-300 bg-emerald-50 dark:bg-emerald-950/30"
                            : "text-muted-foreground",
                        )}
                      >
                        {doc.badge}
                      </Badge>
                      <Button variant="ghost" size="sm" className="shrink-0 h-7 text-xs">
                        Download
                      </Button>
                    </div>
                  ))}
                </div>

                <div className="mt-6 pt-5 border-t space-y-3">
                  <p className="text-sm font-medium">Upload a document</p>
                  <p className="text-xs text-muted-foreground">Share briefs, contracts, or scope docs with your creative team.</p>
                  <ObjectUploader
                    maxNumberOfFiles={20}
                    maxFileSize={52428800}
                    onGetUploadParameters={requestUploadUrl}
                    onComplete={(result) => {
                      const n = (result.successful ?? []).length;
                      if (n) toast({ title: `${n} document${n > 1 ? "s" : ""} uploaded` });
                    }}
                    buttonClassName="flex items-center gap-2 px-4 py-2 rounded-lg border border-dashed border-border hover:border-primary/40 hover:bg-primary/5 transition-all text-sm font-medium text-muted-foreground hover:text-foreground"
                  >
                    <Upload className="h-3.5 w-3.5" /> Upload Document
                  </ObjectUploader>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── References ── */}
          <TabsContent value="references">
            <Card>
              <CardHeader>
                <CardTitle className="font-serif">Reference Materials</CardTitle>
                <CardDescription>
                  Mood boards, inspiration, competitor examples, and visual references for your creative team.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {REF_CATEGORIES.map((cat) => (
                    <div key={cat.id} className="p-4 rounded-xl border border-border/60 space-y-3 bg-secondary/10">
                      <div>
                        <p className="text-sm font-semibold">{cat.label}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{cat.description}</p>
                      </div>
                      <ObjectUploader
                        maxNumberOfFiles={10}
                        maxFileSize={52428800}
                        onGetUploadParameters={requestUploadUrl}
                        onComplete={() => toast({ title: `Reference uploaded to ${cat.label}` })}
                        buttonClassName="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-dashed border-border hover:border-primary/40 hover:bg-primary/5 transition-all text-xs font-medium text-muted-foreground hover:text-foreground"
                      >
                        <Upload className="h-3 w-3" /> Add files
                      </ObjectUploader>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── RFQs ── */}
          <TabsContent value="rfq">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="font-serif">Request for Quote</CardTitle>
                  <CardDescription>
                    Describe a project you need scoped and priced. The team will respond within 24 hours.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Project Title <span className="text-destructive">*</span></label>
                    <Input
                      value={rfqTitle}
                      onChange={e => setRfqTitle(e.target.value)}
                      placeholder="e.g. Brand refresh for Q4 campaign"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Description & Requirements <span className="text-destructive">*</span></label>
                    <Textarea
                      value={rfqDescription}
                      onChange={e => setRfqDescription(e.target.value)}
                      placeholder="Describe what you need, deliverables, audience, and any constraints..."
                      className="min-h-[120px]"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">
                        Target Deadline <span className="text-muted-foreground font-normal">(optional)</span>
                      </label>
                      <Input
                        type="date"
                        value={rfqDeadline}
                        onChange={e => setRfqDeadline(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">
                        Estimated Budget <span className="text-muted-foreground font-normal">(optional)</span>
                      </label>
                      <Input
                        value={rfqBudget}
                        onChange={e => setRfqBudget(e.target.value)}
                        placeholder="e.g. $5,000–$10,000"
                      />
                    </div>
                  </div>
                  <div className="pt-2">
                    <Button
                      onClick={handleRfqSubmit}
                      disabled={!rfqTitle.trim() || !rfqDescription.trim()}
                      className="px-6"
                    >
                      Submit RFQ
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {rfqs.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="font-serif text-base">Submitted RFQs</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="divide-y divide-border/40">
                      {rfqs.map((rfq, i) => (
                        <div key={i} className="py-4 space-y-1">
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-sm font-semibold">{rfq.title}</p>
                            <Badge variant="outline" className="text-amber-600 border-amber-300 bg-amber-50 dark:bg-amber-950/30 text-xs shrink-0">
                              Pending Review
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-2">{rfq.description}</p>
                          <div className="flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground pt-1">
                            {rfq.deadline && <span>Due: {rfq.deadline}</span>}
                            {rfq.budget && <span>Budget: {rfq.budget}</span>}
                            <span>Submitted {new Date(rfq.submittedAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
