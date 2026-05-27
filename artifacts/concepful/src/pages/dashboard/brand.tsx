import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { useGetBrandProfile, useUpsertBrandProfile } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Save, Plus, X, Badge } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

export default function BrandCenter() {
  const { data: profile, isLoading } = useGetBrandProfile(1, { query: { queryKey: ["brand", 1] } }, { request: { query: { companyId: 1 } } } as any);
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
          toast({ title: "Brand profile saved", description: "Your brand intelligence has been updated." });
          queryClient.invalidateQueries({ queryKey: ["brand", 1] });
        },
        onError: () => toast({ title: "Failed to save", variant: "destructive" })
      }
    );
  };

  const addItem = (item: string, setItem: (v: string) => void, list: string[], setList: (v: string[]) => void) => {
    if (item.trim() && !list.includes(item.trim())) {
      setList([...list, item.trim()]);
      setItem("");
    }
  };

  const removeItem = (item: string, list: string[], setList: (v: string[]) => void) => {
    setList(list.filter(i => i !== item));
  };

  if (isLoading) return <DashboardLayout><div className="p-8"><Skeleton className="h-96 w-full" /></div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8 pb-12">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-serif text-3xl font-bold tracking-tight">Brand Center</h1>
            <p className="text-muted-foreground">Manage your brand's visual identity and voice intelligence.</p>
          </div>
          <Button onClick={handleSave} disabled={upsertProfile.isPending}>
            <Save className="mr-2 h-4 w-4" /> {upsertProfile.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </div>

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
                <Textarea 
                  placeholder="Who are we talking to? What do they care about?" 
                  className="min-h-[100px]" 
                  value={audienceNotes} 
                  onChange={e => setAudienceNotes(e.target.value)} 
                />
              </div>
              <div className="space-y-2">
                <Label>Competitor Notes</Label>
                <Textarea 
                  placeholder="Who are the main competitors and how do we differentiate?" 
                  className="min-h-[100px]" 
                  value={competitorNotes} 
                  onChange={e => setCompetitorNotes(e.target.value)} 
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}