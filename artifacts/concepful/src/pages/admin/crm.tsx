import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "@/components/layout/admin-layout";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { crmApi, type CrmContact } from "@/lib/admin-api";
import { Plus, Pencil, Trash2, UserCheck } from "lucide-react";
import { cn } from "@/lib/utils";

const STAGES = ["new", "contacted", "qualified", "proposal", "won", "lost"] as const;
const TYPES  = ["prospect", "client", "lead"] as const;

const STAGE_STYLES: Record<string, string> = {
  new:       "bg-blue-50   text-blue-700   border-blue-200",
  contacted: "bg-purple-50 text-purple-700 border-purple-200",
  qualified: "bg-amber-50  text-amber-700  border-amber-200",
  proposal:  "bg-orange-50 text-orange-700 border-orange-200",
  won:       "bg-green-50  text-green-700  border-green-200",
  lost:      "bg-secondary text-muted-foreground border-border",
};

const BLANK: Partial<CrmContact> = {
  name: "", email: "", phone: "", company: "",
  type: "prospect", stage: "new", notes: "", source: "",
};

const STAGE_ORDER = STAGES.map((s, i) => ({ s, i }));

export default function AdminCrm() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Partial<CrmContact>>(BLANK);
  const [isNew, setIsNew] = useState(true);
  const [stageFilter, setStageFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

  const { data: contacts = [], isLoading } = useQuery({
    queryKey: ["admin-crm"],
    queryFn: crmApi.list,
  });

  const save = useMutation({
    mutationFn: (data: Partial<CrmContact>) =>
      isNew ? crmApi.create(data) : crmApi.update(data.id!, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-crm"] });
      toast({ title: isNew ? "Contact added" : "Contact updated" });
      setOpen(false);
    },
    onError: () => toast({ title: "Failed to save", variant: "destructive" }),
  });

  const remove = useMutation({
    mutationFn: (id: number) => crmApi.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-crm"] });
      toast({ title: "Contact deleted" });
      setConfirmDelete(null);
    },
    onError: () => toast({ title: "Failed to delete", variant: "destructive" }),
  });

  function openNew() {
    setEditing(BLANK);
    setIsNew(true);
    setOpen(true);
  }

  function openEdit(c: CrmContact) {
    setEditing({ ...c });
    setIsNew(false);
    setOpen(true);
  }

  const stageCounts = STAGES.reduce((acc, s) => {
    acc[s] = contacts.filter(c => c.stage === s).length;
    return acc;
  }, {} as Record<string, number>);

  const typeCounts = TYPES.reduce((acc, t) => {
    acc[t] = contacts.filter(c => c.type === t).length;
    return acc;
  }, {} as Record<string, number>);

  const filtered = contacts.filter(c =>
    (stageFilter === "all" || c.stage === stageFilter) &&
    (typeFilter  === "all" || c.type  === typeFilter),
  );

  return (
    <AdminLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-serif text-3xl font-bold tracking-tight">Contacts</h1>
            <p className="text-muted-foreground text-sm mt-1">Track prospects and customers through the pipeline.</p>
          </div>
          <Button onClick={openNew} className="gap-2">
            <Plus className="h-4 w-4" /> Add Contact
          </Button>
        </div>

        {/* Pipeline stage filter bar */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mr-1 shrink-0">Stage</span>
            <button
              onClick={() => setStageFilter("all")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all border",
                stageFilter === "all" ? "bg-foreground text-background border-transparent" : "border-border text-muted-foreground hover:border-foreground/30",
              )}>
              All <span className="text-[10px]">{contacts.length}</span>
            </button>
            {STAGES.map(s => (
              <button key={s}
                onClick={() => setStageFilter(s)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all border capitalize",
                  stageFilter === s
                    ? cn("border-transparent", STAGE_STYLES[s])
                    : "border-border text-muted-foreground hover:border-foreground/30",
                )}>
                {s} <span className="text-[10px]">{stageCounts[s] ?? 0}</span>
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mr-1 shrink-0">Type</span>
            <button
              onClick={() => setTypeFilter("all")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all border",
                typeFilter === "all" ? "bg-foreground text-background border-transparent" : "border-border text-muted-foreground hover:border-foreground/30",
              )}>
              All
            </button>
            {TYPES.map(t => (
              <button key={t}
                onClick={() => setTypeFilter(t)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all border capitalize",
                  typeFilter === t ? "bg-foreground text-background border-transparent" : "border-border text-muted-foreground hover:border-foreground/30",
                )}>
                {t} <span className="text-[10px]">{typeCounts[t] ?? 0}</span>
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 rounded-xl" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 border border-dashed rounded-2xl">
            <UserCheck className="h-10 w-10 text-muted-foreground/25 mx-auto mb-3" />
            <p className="text-muted-foreground font-medium mb-4">
              {stageFilter === "all" && typeFilter === "all" ? "No contacts yet" : "No contacts match this filter"}
            </p>
            {stageFilter === "all" && typeFilter === "all" && <Button variant="outline" onClick={openNew}>Add your first contact</Button>}
          </div>
        ) : (
          <div className="bg-card border rounded-2xl overflow-hidden divide-y divide-border/60">
            {filtered.map(contact => (
              <div key={contact.id}
                className="flex items-center gap-4 px-5 py-4 hover:bg-secondary/20 transition-colors group">
                <div className="h-9 w-9 rounded-full bg-secondary flex items-center justify-center shrink-0 text-sm font-bold text-muted-foreground">
                  {contact.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm">{contact.name}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {[contact.company, contact.email].filter(Boolean).join(" · ")}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className={cn(
                    "text-[10px] font-semibold border px-2 py-0.5 rounded-full capitalize",
                    STAGE_STYLES[contact.stage] ?? STAGE_STYLES.new,
                  )}>
                    {contact.stage}
                  </span>
                  <span className="text-[10px] text-muted-foreground capitalize hidden sm:block">{contact.type}</span>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(contact)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => setConfirmDelete(contact.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit / Create Sheet */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent className="sm:max-w-md overflow-y-auto">
          <SheetHeader className="mb-6">
            <SheetTitle>{isNew ? "Add Contact" : "Edit Contact"}</SheetTitle>
          </SheetHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Name *</Label>
              <Input value={editing.name ?? ""} onChange={e => setEditing(v => ({ ...v, name: e.target.value }))}
                placeholder="Jane Smith" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Email</Label>
                <Input type="email" value={editing.email ?? ""} onChange={e => setEditing(v => ({ ...v, email: e.target.value }))}
                  placeholder="jane@acme.com" />
              </div>
              <div className="space-y-1.5">
                <Label>Phone</Label>
                <Input value={editing.phone ?? ""} onChange={e => setEditing(v => ({ ...v, phone: e.target.value }))}
                  placeholder="+1 555 000 0000" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Company</Label>
              <Input value={editing.company ?? ""} onChange={e => setEditing(v => ({ ...v, company: e.target.value }))}
                placeholder="Acme Inc." />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Type</Label>
                <Select value={editing.type ?? "prospect"} onValueChange={v => setEditing(p => ({ ...p, type: v }))}>
                  <SelectTrigger className="capitalize"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {TYPES.map(t => <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Pipeline Stage</Label>
                <Select value={editing.stage ?? "new"} onValueChange={v => setEditing(p => ({ ...p, stage: v }))}>
                  <SelectTrigger className="capitalize"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {STAGES.map(s => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Source</Label>
              <Input value={editing.source ?? ""} onChange={e => setEditing(v => ({ ...v, source: e.target.value }))}
                placeholder="Referral, LinkedIn, Website…" />
            </div>
            <div className="space-y-1.5">
              <Label>Notes</Label>
              <Textarea value={editing.notes ?? ""} onChange={e => setEditing(v => ({ ...v, notes: e.target.value }))}
                placeholder="Context, next steps, anything relevant…" className="min-h-[80px]" />
            </div>
            <div className="flex gap-3 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => setOpen(false)}>Cancel</Button>
              <Button className="flex-1" disabled={save.isPending || !editing.name?.trim()}
                onClick={() => save.mutate(editing)}>
                {save.isPending ? "Saving…" : isNew ? "Add Contact" : "Save Changes"}
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {confirmDelete !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={() => setConfirmDelete(null)}>
          <div className="bg-card border rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl" onClick={e => e.stopPropagation()}>
            <p className="font-semibold mb-1">Delete this contact?</p>
            <p className="text-sm text-muted-foreground mb-5">This cannot be undone.</p>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setConfirmDelete(null)}>Cancel</Button>
              <Button variant="destructive" className="flex-1" disabled={remove.isPending}
                onClick={() => remove.mutate(confirmDelete)}>
                {remove.isPending ? "Deleting…" : "Delete"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
