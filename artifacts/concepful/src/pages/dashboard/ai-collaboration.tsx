import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { useGetAiProfile, useUpsertAiProfile } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Save, Lock, Cpu } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

const PROVIDERS = ["ChatGPT", "Claude", "Gemini", "Mistral", "Local Models"];
const USE_CASES = ["Copywriting", "Visual Concepts", "Competitive Analysis", "Asset QA", "Strategy Briefs", "Campaign Ideation"];

export default function AiCollaboration() {
  const { data: profile, isLoading } = useGetAiProfile(1, { query: { queryKey: ["ai-profile", 1] } }, { request: { query: { companyId: 1 } } } as any);
  const upsertProfile = useUpsertAiProfile();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [providers, setProviders] = useState<string[]>([]);
  const [modelName, setModelName] = useState("");
  const [useCases, setUseCases] = useState<string[]>([]);
  const [usageNotes, setUsageNotes] = useState("");
  const [consentAiWorkflows, setConsentAiWorkflows] = useState(false);
  const [consentBrandMemory, setConsentBrandMemory] = useState(false);

  useEffect(() => {
    if (profile) {
      setProviders(profile.providers || []);
      setModelName(profile.modelName || "");
      setUseCases(profile.useCases || []);
      setUsageNotes(profile.usageNotes || "");
      setConsentAiWorkflows(profile.consentAiWorkflows || false);
      setConsentBrandMemory(profile.consentBrandMemory || false);
    }
  }, [profile]);

  const handleSave = () => {
    upsertProfile.mutate(
      { data: { companyId: 1, providers, modelName, useCases, usageNotes, consentAiWorkflows, consentBrandMemory } as any },
      {
        onSuccess: () => {
          toast({ title: "AI Profile saved", description: "Collaboration preferences updated." });
          queryClient.invalidateQueries({ queryKey: ["ai-profile", 1] });
        },
        onError: () => toast({ title: "Failed to save", variant: "destructive" })
      }
    );
  };

  const toggleArrayItem = (item: string, list: string[], setList: (v: string[]) => void) => {
    if (list.includes(item)) {
      setList(list.filter(i => i !== item));
    } else {
      setList([...list, item]);
    }
  };

  if (isLoading) return <DashboardLayout><div className="p-8"><Skeleton className="h-96 w-full" /></div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8 pb-12">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-serif text-3xl font-bold tracking-tight flex items-center gap-3">
              <Cpu className="h-8 w-8 text-primary" /> AI Collaboration
            </h1>
            <p className="text-muted-foreground mt-1">Configure orchestration rules and model integration.</p>
          </div>
          <Button onClick={handleSave} disabled={upsertProfile.isPending}>
            <Save className="mr-2 h-4 w-4" /> {upsertProfile.isPending ? "Saving..." : "Save Preferences"}
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="md:col-span-2 border-primary/20 bg-primary/5">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Lock className="h-5 w-5 text-primary" /> Enterprise Vault Infrastructure
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Model connection and secure credential storage should be handled with encrypted vault infrastructure before production use. Concepful's agentic workflows require explicit consent and isolated vector indexes to ensure your proprietary brand data remains secure and is never used to train generalized models.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Approved Providers</CardTitle>
              <CardDescription>Select which models are authorized for your content.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {PROVIDERS.map(provider => (
                  <div key={provider} className="flex items-center space-x-3">
                    <Checkbox 
                      id={`provider-${provider}`} 
                      checked={providers.includes(provider)}
                      onCheckedChange={() => toggleArrayItem(provider, providers, setProviders)}
                    />
                    <Label htmlFor={`provider-${provider}`} className="font-normal cursor-pointer">{provider}</Label>
                  </div>
                ))}
                
                <div className="pt-4 border-t mt-4">
                  <Label className="mb-2 block text-muted-foreground">Specific Custom Model Name (Optional)</Label>
                  <Input 
                    placeholder="e.g. meta-llama/Llama-3-70b" 
                    value={modelName} 
                    onChange={e => setModelName(e.target.value)} 
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Authorized Use Cases</CardTitle>
              <CardDescription>Where AI orchestration is permitted.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {USE_CASES.map(useCase => (
                  <div key={useCase} className="flex items-center space-x-3">
                    <Checkbox 
                      id={`usecase-${useCase}`} 
                      checked={useCases.includes(useCase)}
                      onCheckedChange={() => toggleArrayItem(useCase, useCases, setUseCases)}
                    />
                    <Label htmlFor={`usecase-${useCase}`} className="font-normal cursor-pointer">{useCase}</Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Permissions & Memory</CardTitle>
              <CardDescription>Global orchestration rules.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm bg-card">
                <div className="space-y-1">
                  <Label className="text-base font-semibold">Active Brand Memory</Label>
                  <p className="text-sm text-muted-foreground">Allow Concepful to vectorize approved deliverables for contextual intelligence.</p>
                </div>
                <Switch checked={consentBrandMemory} onCheckedChange={setConsentBrandMemory} />
              </div>

              <div className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm bg-card">
                <div className="space-y-1">
                  <Label className="text-base font-semibold">Agentic Workflows Enabled</Label>
                  <p className="text-sm text-muted-foreground">Permit multi-step AI orchestration for complex briefs (human-in-the-loop required for final).</p>
                </div>
                <Switch checked={consentAiWorkflows} onCheckedChange={setConsentAiWorkflows} />
              </div>

              <div className="space-y-2">
                <Label>Custom Guardrails & Restrictions</Label>
                <Textarea 
                  placeholder="Specify any strict rules (e.g., 'Never generate legal copy', 'Avoid stock illustration styles')" 
                  className="min-h-[100px]" 
                  value={usageNotes} 
                  onChange={e => setUsageNotes(e.target.value)} 
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}