"use client";

import { useState } from "react";
import { useListBrandChecks, useRunBrandCheck } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { ShieldCheck, Sparkles, History as HistoryIcon, AlertTriangle } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function BrandCheckClient() {
  const { data: history, isLoading } = useListBrandChecks({ companyId: 1 } as any, { query: { queryKey: ["brand-checks", 1] } as any });
  const runCheck = useRunBrandCheck();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const [text, setText] = useState("");
  const [activeResult, setActiveResult] = useState<any>(null);

  const handleCheck = () => {
    if (!text.trim()) return;
    
    runCheck.mutate(
      { data: { companyId: 1, inputText: text, inputType: 'text' } },
      {
        onSuccess: (data) => {
          setActiveResult(data);
          queryClient.invalidateQueries({ queryKey: ["brand-checks", 1] });
          toast({ title: "Analysis Complete", description: "Brand check results are ready." });
        },
        onError: () => toast({ title: "Analysis Failed", variant: "destructive" })
      }
    );
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-emerald-500";
    if (score >= 70) return "text-primary";
    if (score >= 50) return "text-amber-500";
    return "text-destructive";
  };

  const getProgressColor = (score: number) => {
    if (score >= 90) return "bg-emerald-500";
    if (score >= 70) return "bg-primary";
    if (score >= 50) return "bg-amber-500";
    return "bg-destructive";
  };

  return (
    <>
      <div className="max-w-6xl mx-auto space-y-8">
        <div>
          <h1 className="font-serif text-3xl font-bold tracking-tight">Brand Check</h1>
          <p className="text-muted-foreground">Automated compliance scoring against your brand intelligence profile.</p>
        </div>

        <Tabs defaultValue="run" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="run" onClick={() => setActiveResult(null)}>Run Analysis</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>
          
          <TabsContent value="run" className="space-y-8">
            <Card className="border-primary/20 shadow-sm">
              <CardContent className="p-6">
                <Textarea 
                  placeholder="Paste copy, an email, or ad text here to check against brand guidelines..." 
                  className="min-h-[200px] text-base resize-y mb-6 border-border focus-visible:ring-primary/20"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                />
                <div className="flex justify-end">
                  <Button size="lg" onClick={handleCheck} disabled={runCheck.isPending || !text.trim()}>
                    {runCheck.isPending ? (
                      <><Sparkles className="mr-2 h-4 w-4 animate-spin" /> Analyzing...</>
                    ) : (
                      <><ShieldCheck className="mr-2 h-5 w-5" /> Run Brand Check</>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {activeResult && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <Card className="lg:col-span-1 bg-card border-none shadow-md overflow-hidden relative">
                  <div className="absolute top-0 right-0 p-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
                  <CardHeader>
                    <CardTitle className="text-lg text-muted-foreground">Overall Alignment</CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col items-center justify-center py-8">
                    <div className={`text-7xl font-bold font-serif tracking-tighter ${getScoreColor(activeResult.alignmentScore)}`}>
                      {activeResult.alignmentScore}
                    </div>
                    <p className="text-muted-foreground mt-4 font-medium uppercase tracking-widest text-xs">Score out of 100</p>
                  </CardContent>
                </Card>

                <Card className="lg:col-span-2 shadow-sm">
                  <CardHeader>
                    <CardTitle>Detailed Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <div className="flex justify-between mb-2 text-sm font-medium">
                        <span>Tone & Voice</span>
                        <span>{activeResult.toneScore}/100</span>
                      </div>
                      <Progress value={activeResult.toneScore} className="h-2" indicatorClassName={getProgressColor(activeResult.toneScore)} />
                    </div>
                    <div>
                      <div className="flex justify-between mb-2 text-sm font-medium">
                        <span>Messaging Accuracy</span>
                        <span>{activeResult.messagingScore}/100</span>
                      </div>
                      <Progress value={activeResult.messagingScore} className="h-2" indicatorClassName={getProgressColor(activeResult.messagingScore)} />
                    </div>
                    
                    {activeResult.recommendations && activeResult.recommendations.length > 0 && (
                      <div className="pt-6 mt-6 border-t">
                        <h4 className="font-semibold mb-4 flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-amber-500" /> Key Recommendations
                        </h4>
                        <ul className="space-y-3">
                          {activeResult.recommendations.map((rec: string, i: number) => (
                            <li key={i} className="flex items-start gap-3 bg-secondary/50 p-3 rounded-lg text-sm text-muted-foreground">
                              <span className="w-1.5 h-1.5 rounded-full bg-primary/50 mt-1.5 shrink-0" />
                              {rec}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Previous Checks</CardTitle>
                <CardDescription>History of automated brand compliance reviews.</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                  </div>
                ) : history && history.length > 0 ? (
                  <div className="divide-y">
                    {history.map((check: any) => (
                      <div key={check.id} className="py-4 flex items-center justify-between gap-4 cursor-pointer hover:bg-secondary/20 p-2 rounded-lg transition-colors" onClick={() => { setActiveResult(check); document.querySelector('[value="run"]')?.dispatchEvent(new MouseEvent('click', { bubbles: true })); }}>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium line-clamp-1 mb-1">{check.inputText?.substring(0, 80)}...</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <HistoryIcon className="h-3 w-3" />
                            {new Date(check.createdAt).toLocaleString()}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <div className={`font-bold ${getScoreColor(check.alignmentScore)}`}>{check.alignmentScore}</div>
                            <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Score</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    No history found. Run an analysis to see results here.
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
