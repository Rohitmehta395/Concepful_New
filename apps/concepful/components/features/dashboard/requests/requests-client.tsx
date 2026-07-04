"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useListWorkRequests, useCreateWorkRequest } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Clock, ArrowRight, Sparkles } from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  title: z.string().min(2),
  type: z.string().min(2),
  priority: z.enum(["low", "medium", "high", "urgent"]),
  goal: z.string().optional(),
  description: z.string().optional(),
  aiAssistance: z.boolean().optional().default(false),
});

export function RequestsClient() {
  const router = useRouter();
  const { data: requests, isLoading } = useListWorkRequests(
    { companyId: 1 },
    { query: { queryKey: ["requests", 1] } },
  );
  const createRequest = useCreateWorkRequest();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState("all");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      type: "",
      priority: "medium",
      goal: "",
      description: "",
      aiAssistance: false,
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    createRequest.mutate(
      { data: { ...values, companyId: 1 } },
      {
        onSuccess: () => {
          toast({ title: "Request submitted successfully" });
          queryClient.invalidateQueries({ queryKey: ["requests", 1] });
          setOpen(false);
          form.reset();
        },
        onError: () => {
          toast({ title: "Failed to submit request", variant: "destructive" });
        }
      }
    );
  };

  const filteredRequests = requests?.filter(r => {
    if (filter === "all") return true;
    if (filter === "active") return r.status !== 'completed' && r.status !== 'delivered';
    return r.status === filter;
  }) || [];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold tracking-tight">Work Requests</h1>
          <p className="text-muted-foreground">Manage and track your active creative tasks.</p>
        </div>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" /> New Request</Button>
          </SheetTrigger>
          <SheetContent className="sm:max-w-xl overflow-y-auto">
            <SheetHeader className="mb-6">
              <SheetTitle>Submit Work Request</SheetTitle>
              <SheetDescription>Provide details about the creative work you need.</SheetDescription>
            </SheetHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Q3 Campaign Landing Page" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Type of Work</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="design">Design</SelectItem>
                            <SelectItem value="copywriting">Copywriting</SelectItem>
                            <SelectItem value="strategy">Strategy</SelectItem>
                            <SelectItem value="motion">Motion</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="priority"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Priority</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select priority" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="urgent">Urgent</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="goal"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Business Goal</FormLabel>
                      <FormControl>
                        <Input placeholder="What does this need to achieve?" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description &amp; Requirements</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Provide detailed context..." className="min-h-[150px]" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="aiAssistance"
                  render={({ field }) => (
                    <FormItem>
                      <div
                        onClick={() => field.onChange(!field.value)}
                        className={cn(
                          "flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all select-none",
                          field.value
                            ? "border-primary/40 bg-primary/[0.04]"
                            : "border-border hover:border-primary/25 hover:bg-secondary/40",
                        )}
                      >
                        <FormControl>
                          <Checkbox
                            checked={field.value ?? false}
                            onCheckedChange={field.onChange}
                            className="mt-0.5 shrink-0"
                          />
                        </FormControl>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <Sparkles className="h-3.5 w-3.5 text-primary shrink-0" />
                            <span className="text-sm font-semibold leading-none">Add AI Assistance</span>
                          </div>
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            An AI agent will be added to this task to help with drafts, initial concepts, and research — giving your team a head start.
                          </p>
                        </div>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={createRequest.isPending}>
                  {createRequest.isPending ? "Submitting..." : "Submit Request"}
                </Button>
              </form>
            </Form>
          </SheetContent>
        </Sheet>
      </div>

      <Tabs value={filter} onValueChange={setFilter} className="w-full">
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="in_review">In Review</TabsTrigger>
        </TabsList>
      </Tabs>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      ) : filteredRequests.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredRequests.map(req => (
            <Card
              key={req.id}
              onClick={() => router.push(`/dashboard/project/${req.id}`)}
              className="hover:border-primary/50 transition-colors cursor-pointer group hover:shadow-md"
            >
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start mb-2">
                  <Badge variant="outline" className="capitalize">{req.status.replace('_', ' ')}</Badge>
                  <Badge variant={req.priority === 'urgent' ? 'destructive' : 'secondary'} className="capitalize">
                    {req.priority}
                  </Badge>
                </div>
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-lg">{req.title}</CardTitle>
                  <ArrowRight className="h-4 w-4 text-muted-foreground/30 group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0 mt-1" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {req.description || "No description provided."}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground pt-4 border-t">
                    <span className="flex items-center gap-1 capitalize">
                      <span className="w-2 h-2 rounded-full bg-primary/50" />
                      {req.type}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Created {new Date(req.createdAt).toLocaleDateString()}
                    </span>
                    <span className="ml-auto text-[10px] font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                      View project →
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-24 bg-card rounded-xl border border-dashed">
          <h3 className="text-lg font-medium mb-2">No requests found</h3>
          <p className="text-muted-foreground mb-6">Create a new request to get started.</p>
          <Button onClick={() => setOpen(true)} variant="outline">Create Request</Button>
        </div>
      )}
    </div>
  );
}
