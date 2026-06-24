import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "@/components/layout/admin-layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { portfolioApi, type PortfolioItem } from "@/lib/admin-api";
import { Plus, Pencil, Trash2, Star, Image } from "lucide-react";
import { cn } from "@/lib/utils";

const TYPES = ["design", "campaign", "strategy", "copywriting", "motion", "brand", "web", "social"];
const STATUS_COLORS: Record<string, string> = {
  published: "bg-green-100 text-green-800 border-green-200",
  draft:     "bg-secondary text-muted-foreground border-border",
};

const BLANK: Partial<PortfolioItem> = {
  title: "", clientName: "", type: "design", description: "",
  coverImageUrl: "", featured: false, sortOrder: 0, status: "draft", tags: [],
};

export default function AdminPortfolio() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Partial<PortfolioItem>>(BLANK);
  const [isNew, setIsNew] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["admin-portfolio"],
    queryFn: portfolioApi.list,
  });

  const save = useMutation({
    mutationFn: (data: Partial<PortfolioItem>) =>
      isNew ? portfolioApi.create(data) : portfolioApi.update(data.id!, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-portfolio"] });
      toast({ title: isNew ? "Item created" : "Item updated" });
      setOpen(false);
    },
    onError: () => toast({ title: "Failed to save", variant: "destructive" }),
  });

  const remove = useMutation({
    mutationFn: (id: number) => portfolioApi.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-portfolio"] });
      toast({ title: "Item deleted" });
      setConfirmDelete(null);
    },
    onError: () => toast({ title: "Failed to delete", variant: "destructive" }),
  });

  function openNew() {
    setEditing(BLANK);
    setIsNew(true);
    setOpen(true);
  }

  function openEdit(item: PortfolioItem) {
    setEditing({ ...item });
    setIsNew(false);
    setOpen(true);
  }

  return (
    <AdminLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-serif text-3xl font-bold tracking-tight">Portfolio</h1>
            <p className="text-muted-foreground text-sm mt-1">Manage the work items shown on your website.</p>
          </div>
          <Button onClick={openNew} className="gap-2">
            <Plus className="h-4 w-4" /> Add Item
          </Button>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-20 rounded-xl" />)}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-20 border border-dashed rounded-2xl">
            <Image className="h-10 w-10 text-muted-foreground/25 mx-auto mb-3" />
            <p className="text-muted-foreground font-medium mb-4">No portfolio items yet</p>
            <Button variant="outline" onClick={openNew}>Add your first item</Button>
          </div>
        ) : (
          <div className="bg-card border rounded-2xl overflow-hidden divide-y divide-border/60">
            {items.map(item => (
              <div key={item.id}
                className="flex items-center gap-4 px-5 py-4 hover:bg-secondary/20 transition-colors group">
                <div className="h-12 w-12 rounded-xl bg-secondary flex items-center justify-center shrink-0 overflow-hidden">
                  {item.coverImageUrl ? (
                    <img src={item.coverImageUrl} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <Image className="h-5 w-5 text-muted-foreground/40" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="font-semibold text-sm truncate">{item.title}</p>
                    {item.featured && <Star className="h-3 w-3 text-amber-500 shrink-0" fill="currentColor" />}
                  </div>
                  <p className="text-xs text-muted-foreground capitalize">
                    {item.clientName ? `${item.clientName} · ` : ""}{item.type}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <Badge className={cn("text-[10px] border px-2 capitalize", STATUS_COLORS[item.status] ?? STATUS_COLORS.draft)}>
                    {item.status}
                  </Badge>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(item)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => setConfirmDelete(item.id)}>
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
        <SheetContent className="sm:max-w-lg overflow-y-auto">
          <SheetHeader className="mb-6">
            <SheetTitle>{isNew ? "Add Portfolio Item" : "Edit Portfolio Item"}</SheetTitle>
          </SheetHeader>
          <div className="space-y-5">
            <div className="space-y-1.5">
              <Label>Title *</Label>
              <Input value={editing.title ?? ""} onChange={e => setEditing(v => ({ ...v, title: e.target.value }))}
                placeholder="Q3 Campaign Refresh" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Client</Label>
                <Input value={editing.clientName ?? ""} onChange={e => setEditing(v => ({ ...v, clientName: e.target.value }))}
                  placeholder="Acme Inc." />
              </div>
              <div className="space-y-1.5">
                <Label>Type</Label>
                <Select value={editing.type ?? "design"} onValueChange={v => setEditing(p => ({ ...p, type: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {TYPES.map(t => <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Textarea value={editing.description ?? ""} onChange={e => setEditing(v => ({ ...v, description: e.target.value }))}
                placeholder="Brief description of this project…" className="min-h-[80px]" />
            </div>
            <div className="space-y-1.5">
              <Label>Cover Image URL</Label>
              <Input value={editing.coverImageUrl ?? ""} onChange={e => setEditing(v => ({ ...v, coverImageUrl: e.target.value }))}
                placeholder="https://…" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Status</Label>
                <Select value={editing.status ?? "draft"} onValueChange={v => setEditing(p => ({ ...p, status: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Sort Order</Label>
                <Input type="number" value={editing.sortOrder ?? 0}
                  onChange={e => setEditing(v => ({ ...v, sortOrder: parseInt(e.target.value) || 0 }))} />
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-secondary/40 rounded-xl">
              <Switch checked={editing.featured ?? false} onCheckedChange={v => setEditing(p => ({ ...p, featured: v }))} />
              <div>
                <p className="text-sm font-medium">Featured</p>
                <p className="text-xs text-muted-foreground">Show prominently on the website</p>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => setOpen(false)}>Cancel</Button>
              <Button className="flex-1" disabled={save.isPending || !editing.title?.trim()}
                onClick={() => save.mutate(editing)}>
                {save.isPending ? "Saving…" : isNew ? "Create" : "Save Changes"}
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Delete confirmation */}
      {confirmDelete !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={() => setConfirmDelete(null)}>
          <div className="bg-card border rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl" onClick={e => e.stopPropagation()}>
            <p className="font-semibold mb-1">Delete this item?</p>
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
