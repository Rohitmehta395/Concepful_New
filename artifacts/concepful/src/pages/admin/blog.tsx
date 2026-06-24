import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "@/components/layout/admin-layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { blogApi, type BlogPost } from "@/lib/admin-api";
import { Plus, Pencil, Trash2, BookOpen, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

const CATEGORIES = ["insights", "process", "updates", "case-study"];

const STATUS_COLORS: Record<string, string> = {
  published: "bg-green-100 text-green-800 border-green-200",
  draft:     "bg-secondary text-muted-foreground border-border",
};

function slugify(str: string) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

const BLANK: Partial<BlogPost> = {
  title: "", slug: "", content: "", excerpt: "",
  category: "insights", status: "draft", coverImageUrl: "", tags: [],
};

type View = "list" | "edit";

export default function AdminBlog() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [view, setView] = useState<View>("list");
  const [editing, setEditing] = useState<Partial<BlogPost>>(BLANK);
  const [isNew, setIsNew] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ["admin-blog"],
    queryFn: blogApi.list,
  });

  const save = useMutation({
    mutationFn: (data: Partial<BlogPost>) =>
      isNew ? blogApi.create(data) : blogApi.update(data.id!, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-blog"] });
      toast({ title: isNew ? "Post created" : "Post updated" });
      setView("list");
    },
    onError: () => toast({ title: "Failed to save", variant: "destructive" }),
  });

  const remove = useMutation({
    mutationFn: (id: number) => blogApi.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-blog"] });
      toast({ title: "Post deleted" });
      setConfirmDelete(null);
    },
    onError: () => toast({ title: "Failed to delete", variant: "destructive" }),
  });

  function openNew() {
    setEditing(BLANK);
    setIsNew(true);
    setView("edit");
  }

  function openEdit(post: BlogPost) {
    setEditing({ ...post });
    setIsNew(false);
    setView("edit");
  }

  function handleTitleChange(title: string) {
    setEditing(v => ({
      ...v,
      title,
      slug: isNew ? slugify(title) : v.slug,
    }));
  }

  if (view === "edit") {
    return (
      <AdminLayout>
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" className="gap-1" onClick={() => setView("list")}>
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
            <div className="flex-1" />
            <Select value={editing.status ?? "draft"} onValueChange={v => setEditing(p => ({ ...p, status: v }))}>
              <SelectTrigger className="w-36 h-8 text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="published">Published</SelectItem>
              </SelectContent>
            </Select>
            <Button disabled={save.isPending || !editing.title?.trim()} onClick={() => save.mutate(editing)}>
              {save.isPending ? "Saving…" : isNew ? "Create Post" : "Save Changes"}
            </Button>
          </div>

          <div className="bg-card border rounded-2xl p-8 space-y-6">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Title</Label>
              <input
                value={editing.title ?? ""}
                onChange={e => handleTitleChange(e.target.value)}
                placeholder="Post title…"
                className="w-full text-2xl font-bold font-serif bg-transparent border-none outline-none placeholder:text-muted-foreground/40 text-foreground"
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label>Slug</Label>
                <Input value={editing.slug ?? ""} onChange={e => setEditing(v => ({ ...v, slug: e.target.value }))}
                  placeholder="post-slug" className="text-xs font-mono" />
              </div>
              <div className="space-y-1.5">
                <Label>Category</Label>
                <Select value={editing.category ?? "insights"} onValueChange={v => setEditing(p => ({ ...p, category: v }))}>
                  <SelectTrigger className="capitalize"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map(c => <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Cover Image URL</Label>
                <Input value={editing.coverImageUrl ?? ""} onChange={e => setEditing(v => ({ ...v, coverImageUrl: e.target.value }))}
                  placeholder="https://…" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Excerpt</Label>
              <Textarea value={editing.excerpt ?? ""} onChange={e => setEditing(v => ({ ...v, excerpt: e.target.value }))}
                placeholder="Short summary shown in post listings…" className="min-h-[60px]" />
            </div>
            <div className="space-y-1.5">
              <Label>Content <span className="text-muted-foreground font-normal">(Markdown)</span></Label>
              <Textarea value={editing.content ?? ""} onChange={e => setEditing(v => ({ ...v, content: e.target.value }))}
                placeholder="Write your post in markdown…"
                className="min-h-[360px] font-mono text-sm leading-relaxed" />
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-serif text-3xl font-bold tracking-tight">Blog</h1>
            <p className="text-muted-foreground text-sm mt-1">Manage your posts across Process, Insights, and Updates.</p>
          </div>
          <Button onClick={openNew} className="gap-2">
            <Plus className="h-4 w-4" /> New Post
          </Button>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-20 rounded-xl" />)}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20 border border-dashed rounded-2xl">
            <BookOpen className="h-10 w-10 text-muted-foreground/25 mx-auto mb-3" />
            <p className="text-muted-foreground font-medium mb-4">No posts yet</p>
            <Button variant="outline" onClick={openNew}>Write your first post</Button>
          </div>
        ) : (
          <div className="bg-card border rounded-2xl overflow-hidden divide-y divide-border/60">
            {posts.map(post => (
              <div key={post.id}
                className="flex items-center gap-4 px-5 py-4 hover:bg-secondary/20 transition-colors group">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="font-semibold text-sm truncate">{post.title}</p>
                  </div>
                  <p className="text-xs text-muted-foreground capitalize">
                    {post.category}
                    {post.publishedAt ? ` · Published ${new Date(post.publishedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <Badge className={cn("text-[10px] border px-2 capitalize", STATUS_COLORS[post.status] ?? STATUS_COLORS.draft)}>
                    {post.status}
                  </Badge>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(post)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => setConfirmDelete(post.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {confirmDelete !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={() => setConfirmDelete(null)}>
          <div className="bg-card border rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl" onClick={e => e.stopPropagation()}>
            <p className="font-semibold mb-1">Delete this post?</p>
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
