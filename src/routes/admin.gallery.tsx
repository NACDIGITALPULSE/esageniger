import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Trash2, Loader2, Save, Upload } from "lucide-react";
import { toast } from "sonner";
import { logAudit } from "@/lib/admin-auth";

export const Route = createFileRoute("/admin/gallery")({
  component: AdminGallery,
});

type Item = {
  id: string;
  title: string | null;
  caption: string | null;
  image_url: string;
  display_order: number;
  is_visible: boolean;
};

function AdminGallery() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function load() {
    setLoading(true);
    const { data, error } = await supabase.from("gallery_items").select("*").order("display_order");
    if (error) toast.error(error.message);
    setItems((data as Item[]) ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function patch(id: string, c: Partial<Item>) {
    setItems((s) => s.map((p) => (p.id === id ? { ...p, ...c } : p)));
  }

  async function onFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const max = items.reduce((m, p) => Math.max(m, p.display_order), 0);
      let order = max;
      for (const file of Array.from(files)) {
        if (file.size > 5 * 1024 * 1024) {
          toast.error(`${file.name} dépasse 5 Mo`);
          continue;
        }
        order += 1;
        const ext = file.name.split(".").pop() ?? "jpg";
        const path = `gallery/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const { error: upErr } = await supabase.storage.from("site-assets").upload(path, file, { contentType: file.type });
        if (upErr) { toast.error(upErr.message); continue; }
        const { data: pub } = supabase.storage.from("site-assets").getPublicUrl(path);
        const { data: row, error: insErr } = await supabase.from("gallery_items").insert({
          image_url: pub.publicUrl, title: file.name.replace(/\.[^.]+$/, ""), caption: null,
          display_order: order, is_visible: true,
        }).select().single();
        if (insErr) { toast.error(insErr.message); continue; }
        await logAudit({ action: "create", entity: "gallery_items", entityId: row.id });
      }
      toast.success("Images ajoutées");
      load();
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function save(it: Item) {
    setSavingId(it.id);
    const { error } = await supabase.from("gallery_items").update({
      title: it.title, caption: it.caption, image_url: it.image_url,
      display_order: it.display_order, is_visible: it.is_visible,
    }).eq("id", it.id);
    setSavingId(null);
    if (error) return toast.error(error.message);
    toast.success("Enregistré");
    await logAudit({ action: "update", entity: "gallery_items", entityId: it.id });
  }

  async function remove(it: Item) {
    if (!confirm("Supprimer cette image ?")) return;
    const { error } = await supabase.from("gallery_items").delete().eq("id", it.id);
    if (error) return toast.error(error.message);
    await logAudit({ action: "delete", entity: "gallery_items", entityId: it.id });
    load();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold">Galerie</h1>
          <p className="mt-1 text-sm text-muted-foreground">Téléversez et gérez les images de la galerie.</p>
        </div>
        <div>
          <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => onFiles(e.target.files)} />
          <Button onClick={() => fileRef.current?.click()} disabled={uploading}>
            {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
            Téléverser
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((it) => (
            <Card key={it.id} className="overflow-hidden border-border">
              <div className="aspect-video w-full bg-muted">
                {it.image_url && <img src={it.image_url} alt={it.title ?? ""} className="h-full w-full object-cover" loading="lazy" />}
              </div>
              <CardContent className="space-y-3 p-4">
                <div><Label className="text-xs">Titre</Label><Input value={it.title ?? ""} onChange={(e) => patch(it.id, { title: e.target.value })} /></div>
                <div><Label className="text-xs">Légende</Label><Input value={it.caption ?? ""} onChange={(e) => patch(it.id, { caption: e.target.value })} /></div>
                <div className="grid grid-cols-2 gap-2">
                  <div><Label className="text-xs">Ordre</Label><Input type="number" value={it.display_order} onChange={(e) => patch(it.id, { display_order: Number(e.target.value) })} /></div>
                  <div className="flex items-end gap-2">
                    <Switch checked={it.is_visible} onCheckedChange={(v) => patch(it.id, { is_visible: v })} />
                    <span className="text-xs text-muted-foreground">Visible</span>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button size="sm" variant="outline" onClick={() => remove(it)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
                  <Button size="sm" onClick={() => save(it)} disabled={savingId === it.id}>
                    {savingId === it.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {items.length === 0 && (
            <div className="col-span-full rounded-lg border border-dashed border-border p-12 text-center text-sm text-muted-foreground">
              Aucune image. Cliquez sur "Téléverser" pour commencer.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
