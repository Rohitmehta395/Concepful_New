import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { useGetBrandProfile, useUpsertBrandProfile, useListCompletedWork, getListCompletedWorkQueryKey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ArtworkThumbnail } from "@/components/ArtworkThumbnail";
import { cn } from "@/lib/utils";
import {
  Save, Plus, X, LayoutGrid, List, Clock, CheckCircle2,
  TrendingUp, Image as ImageIcon, SlidersHorizontal
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";

type AssetView = "mosaic" | "list";

const CATEGORIES = ["All", "Social", "Email", "Campaign", "Strategy", "Presentation", "Motion", "Web"];

const MOSAIC_SPANS = [
  "col-span-2 row-span-2", "col-span-1 row-span-1", "col-span-1 row-span-2",
  "col-span-1 row-span-1", "col-span-1 row-span-1", "col-span-2 row-span-1",
  "col-span-1 row-span-1", "col-span-1 row-span-1", "col-span-1 row-span-2",
  "col-span-2 row-span-1",
];

function AssetMosaic({ items, onSelect }: { items: any[]; onSelect: (id: number) => void }) {
  if (items.length === 0) {
    return (
      <div className="text-center py-24 border border-dashed rounded-2xl">
        <ImageIcon className="h-10 w-10 text-muted-foreground/30 mx-auto mb-4" />
        <p className="text-muted-foreground text-sm">No assets in this category yet.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-4 auto-rows-[120px] gap-2">
      {items.map((item, i) => {
        const span = MOSAIC_SPANS[i % MOSAIC_SPANS.length];
        return (
          <motion.button
            key={item.id}
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2, delay: i * 0.03 }}
            onClick={() => onSelect(item.id)}
            className={cn(
              "group relative rounded-xl overflow-hidden border border-border/60 hover:border-primary/40 hover:shadow-lg transition-all duration-200 text-left",
              span
            )}
          >
            <ArtworkThumbnail
              category={item.category}
              title={item.title}
              className="absolute inset-0 h-full w-full rounded-none"
            />
            {/* Hover overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-end p-3">
              <p className="text-white text-xs font-semibold line-clamp-2 leading-tight">{item.title}</p>
              <p className="text-white/60 text-[10px] mt-1 capitalize">
                {item.category} · {new Date(item.completedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </p>
            </div>
            {/* Always-visible approved badge on large tiles */}
            {item.approved && span.includes("col-span-2") && (
              <div className="absolute top-2 right-2 bg-emerald-500/90 text-white rounded-full p-1 opacity-80">
                <CheckCircle2 className="h-3 w-3" />
              </div>
            )}
          </motion.button>
        );
      })}
    </div>
  );
}

function AssetList({ items, onSelect }: { items: any[]; onSelect: (id: number) => void }) {
  if (items.length === 0) {
    return (
      <div className="text-center py-24 border border-dashed rounded-2xl">
        <ImageIcon className="h-10 w-10 text-muted-foreground/30 mx-auto mb-4" />
        <p className="text-muted-foreground text-sm">No assets in this category yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <motion.button
          key={item.id}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.2, delay: i * 0.04 }}
          onClick={() => onSelect(item.id)}
          className="w-full group flex items-center gap-4 p-3 rounded-xl border border-border/60 hover:border-primary/40 hover:bg-secondary/30 hover:shadow-sm transition-all duration-150 text-left"
        >
          <div className="shrink-0 h-14 w-14 rounded-lg overflow-hidden border border-border/40">
            <ArtworkThumbnail
              category={item.category}
              title={item.title}
              className="h-full w-full rounded-none"
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm leading-tight line-clamp-1">{item.title}</p>
            {item.notes && (
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2 leading-relaxed">{item.notes}</p>
            )}
            <div className="flex items-center gap-3 mt-1.5 text-[11px] text-muted-foreground">
              <span className="capitalize">{item.category}</span>
              <span className="w-1 h-1 rounded-full bg-border inline-block" />
              <Clock className="h-3 w-3" />
              {new Date(item.completedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </div>
          </div>
          <div className="shrink-0 flex flex-col items-end gap-1.5">
            {item.approved ? (
              <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px] px-2 py-0.5">
                <CheckCircle2 className="h-2.5 w-2.5 mr-1" />Approved
              </Badge>
            ) : (
              <Badge variant="secondary" className="text-[10px] px-2 py-0.5">Pending</Badge>
            )}
            <span className="text-[10px] text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
              View card →
            </span>
          </div>
        </motion.button>
      ))}
    </div>
  );
}

export default function BrandCenter() {
  const [, setLocation] = useLocation();
  const [tab, setTab] = useState<"assets" | "profile">("assets");
  const [assetView, setAssetView] = useState<AssetView>("mosaic");
  const [filterCategory, setFilterCategory] = useState("All");

  const { data: work, isLoading: workLoading } = useListCompletedWork(
    { query: { queryKey: getListCompletedWorkQueryKey({ companyId: 1 }) } },
    { request: { query: { companyId: 1 } } }
  );

  const { data: profile, isLoading: profileLoading } = useGetBrandProfile(
    1,
    { query: { queryKey: ["brand", 1] } },
    { request: { query: { companyId: 1 } } } as any
  );
  const upsertProfile = useUpsertBrandProfile();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [colors, setColors] = useState<string[]>([]);
  const [fonts, setFonts] = useState<string[]>([]);
  const [toneWords, setToneWords] = useState<string[]>([]);
  const [bannedWords, setBannedWords] = useState<string[]>([]);
  const [audienceNotes, setAudienceNotes] = useState("");
  const [competitorNotes, setCompetitorNotes] = useState("");
  const [newColor, setNewColor] = useState("");
  const [newFont, setNewFont] = useState("");
  const [newTone, setNewTone] = useState("");
  const [newBanned, setNewBanned] = useState("");

  useEffect(() => {
    if (profile) {
      setColors(profile.colors || []);
      setFonts(profile.fonts || []);
      setToneWords(profile.toneWords || []);
      setBannedWords(profile.bannedWords || []);
      setAudienceNotes(profile.audienceNotes || "");
      setCompetitorNotes(profile.competitorNotes || "");
    }
  }, [profile]);

  const handleSave = () => {
    upsertProfile.mutate(
      { data: { companyId: 1, colors, fonts, toneWords, bannedWords, audienceNotes, competitorNotes } as any },
      {
        onSuccess: () => {
          toast({ title: "Brand profile saved" });
          queryClient.invalidateQueries({ queryKey: ["brand", 1] });
        },
        onError: () => toast({ title: "Failed to save", variant: "destructive" })
      }
    );
  };

  const addItem = (item: string, setItem: (v: string) => void, list: string[], setList: (v: string[]) => void) => {
    if (item.trim() && !list.includes(item.trim())) { setList([...list, item.trim()]); setItem(""); }
  };
  const removeItem = (item: string, list: string[], setList: (v: string[]) => void) => {
    setList(list.filter(i => i !== item));
  };

  const filteredWork = (work ?? []).filter(item =>
    filterCategory === "All" || item.category?.toLowerCase() === filterCategory.toLowerCase()
  ).sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());

  const handleSelect = (id: number) => setLocation(`/dashboard/project/${id}`);

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-6 pb-12">
        {/* Header + tab toggle */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-serif text-3xl font-bold tracking-tight">Brand Center</h1>
            <p className="text-muted-foreground">All creative assets and brand intelligence in one place.</p>
          </div>
          <div className="flex items-center gap-1 bg-secondary rounded-lg p-1">
            <button
              onClick={() => setTab("assets")}
              className={cn(
                "px-4 py-1.5 rounded-md text-sm font-medium transition-all",
                tab === "assets" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              Assets
            </button>
            <button
              onClick={() => setTab("profile")}
              className={cn(
                "px-4 py-1.5 rounded-md text-sm font-medium transition-all",
                tab === "profile" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              Brand Profile
            </button>
          </div>
        </div>

        {/* ASSETS TAB */}
        {tab === "assets" && (
          <div className="space-y-5">
            {/* Controls */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              {/* Category filters */}
              <div className="flex gap-2 flex-wrap">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setFilterCategory(cat)}
                    className={cn(
                      "text-xs font-medium px-3 py-1.5 rounded-full border transition-all",
                      filterCategory === cat
                        ? "bg-primary text-primary-foreground border-primary"
                        : "border-border/60 text-muted-foreground hover:border-primary/40 hover:text-foreground"
                    )}
                  >
                    {cat}
                    {cat !== "All" && (
                      <span className="ml-1.5 opacity-50 text-[10px]">
                        {(work ?? []).filter(i => i.category?.toLowerCase() === cat.toLowerCase()).length || ""}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* View toggle */}
              <div className="flex items-center gap-1 bg-secondary rounded-lg p-1 shrink-0">
                <button
                  onClick={() => setAssetView("mosaic")}
                  title="Mosaic view"
                  className={cn(
                    "p-1.5 rounded-md transition-all",
                    assetView === "mosaic" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <LayoutGrid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setAssetView("list")}
                  title="List view"
                  className={cn(
                    "p-1.5 rounded-md transition-all",
                    assetView === "list" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Count */}
            <p className="text-xs text-muted-foreground">
              {filteredWork.length} asset{filteredWork.length !== 1 ? "s" : ""}
              {filterCategory !== "All" ? ` in ${filterCategory}` : " total"}
            </p>

            {/* Views */}
            {workLoading ? (
              <div className="grid grid-cols-4 auto-rows-[120px] gap-2">
                {[...Array(8)].map((_, i) => (
                  <Skeleton key={i} className={cn("rounded-xl", i % 3 === 0 ? "col-span-2 row-span-2" : "col-span-1 row-span-1")} />
                ))}
              </div>
            ) : assetView === "mosaic" ? (
              <AssetMosaic items={filteredWork} onSelect={handleSelect} />
            ) : (
              <AssetList items={filteredWork} onSelect={handleSelect} />
            )}
          </div>
        )}

        {/* BRAND PROFILE TAB */}
        {tab === "profile" && (
          <div className="space-y-6">
            <div className="flex justify-end">
              <Button onClick={handleSave} disabled={upsertProfile.isPending}>
                <Save className="mr-2 h-4 w-4" /> {upsertProfile.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </div>

            {profileLoading ? (
              <Skeleton className="h-96 w-full" />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card>
                  <CardHeader>
                    <CardTitle>Colors</CardTitle>
                    <CardDescription>Hex codes defining your palette.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2 mb-4">
                      <Input placeholder="#000000" value={newColor} onChange={e => setNewColor(e.target.value)} onKeyDown={e => e.key === 'Enter' && addItem(newColor, setNewColor, colors, setColors)} />
                      <Button variant="secondary" onClick={() => addItem(newColor, setNewColor, colors, setColors)}><Plus className="h-4 w-4" /></Button>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {colors.map(color => (
                        <div key={color} className="flex items-center gap-2 bg-secondary rounded-full pl-1 pr-3 py-1 text-sm border">
                          <div className="w-5 h-5 rounded-full border shadow-sm" style={{ backgroundColor: color }} />
                          <span className="font-mono">{color}</span>
                          <button onClick={() => removeItem(color, colors, setColors)} className="text-muted-foreground hover:text-foreground ml-1"><X className="h-3 w-3" /></button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Typography</CardTitle>
                    <CardDescription>Primary and secondary font families.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2 mb-4">
                      <Input placeholder="e.g. Inter" value={newFont} onChange={e => setNewFont(e.target.value)} onKeyDown={e => e.key === 'Enter' && addItem(newFont, setNewFont, fonts, setFonts)} />
                      <Button variant="secondary" onClick={() => addItem(newFont, setNewFont, fonts, setFonts)}><Plus className="h-4 w-4" /></Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {fonts.map(font => (
                        <Badge key={font} variant="secondary" className="px-3 py-1 font-normal text-sm flex items-center gap-2">
                          {font}
                          <button onClick={() => removeItem(font, fonts, setFonts)} className="hover:text-destructive"><X className="h-3 w-3" /></button>
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Tone & Voice</CardTitle>
                    <CardDescription>Words that describe how your brand sounds.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2 mb-4">
                      <Input placeholder="e.g. Confident" value={newTone} onChange={e => setNewTone(e.target.value)} onKeyDown={e => e.key === 'Enter' && addItem(newTone, setNewTone, toneWords, setToneWords)} />
                      <Button variant="secondary" onClick={() => addItem(newTone, setNewTone, toneWords, setToneWords)}><Plus className="h-4 w-4" /></Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {toneWords.map(word => (
                        <Badge key={word} variant="outline" className="px-3 py-1 bg-primary/5 text-primary border-primary/20 flex items-center gap-2">
                          {word}
                          <button onClick={() => removeItem(word, toneWords, setToneWords)} className="hover:text-destructive"><X className="h-3 w-3" /></button>
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Banned Words</CardTitle>
                    <CardDescription>Words or phrases to strictly avoid.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2 mb-4">
                      <Input placeholder="e.g. Next-Gen" value={newBanned} onChange={e => setNewBanned(e.target.value)} onKeyDown={e => e.key === 'Enter' && addItem(newBanned, setNewBanned, bannedWords, setBannedWords)} />
                      <Button variant="secondary" onClick={() => addItem(newBanned, setNewBanned, bannedWords, setBannedWords)}><Plus className="h-4 w-4" /></Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {bannedWords.map(word => (
                        <Badge key={word} variant="outline" className="px-3 py-1 bg-destructive/5 text-destructive border-destructive/20 flex items-center gap-2">
                          {word}
                          <button onClick={() => removeItem(word, bannedWords, setBannedWords)} className="hover:text-destructive"><X className="h-3 w-3" /></button>
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle>Strategic Context</CardTitle>
                    <CardDescription>Deeper intelligence for the creative team.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label>Audience Notes</Label>
                      <Textarea placeholder="Who are we talking to? What do they care about?" className="min-h-[100px]" value={audienceNotes} onChange={e => setAudienceNotes(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Competitor Notes</Label>
                      <Textarea placeholder="Who are the main competitors and how do we differentiate?" className="min-h-[100px]" value={competitorNotes} onChange={e => setCompetitorNotes(e.target.value)} />
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
