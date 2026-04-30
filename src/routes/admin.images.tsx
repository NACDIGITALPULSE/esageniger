import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Plus, Save, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { logAudit } from "@/lib/admin-auth";

export const Route = createFileRoute("/admin/images")({
  component: AdminImages,
});

type Image = { id: string; key: string; label: string; image_url: string; alt_text: string | null };

function AdminImages() {
  const [items, setItems] = useState<Image[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const fileInputs = useRef<Record<string, HTMLInputElement | null>>({});

  async function load() {
    setLoading(true);
    const { data } = await supabase.from("site_images").select("*").order("label");
    setItems((data as Image[]) ?? []);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  function patch(id: string, p: Partial<Image>) {
    setItems((s) => s.map((i) => (i.id === id ? { ...i, ...p } : i)));
  }

  async function add() {
    const key = prompt("Clé unique de l'image (ex: hero_accueil) :");
    if (!key) return;
    const label = prompt("Libellé affiché à l'admin :", key) ?? key;
    const { data, error } = await supabase
      .from("site_images")
      .insert({ key, label, image_url: "https://placehold.co/800x600?text=Image" })
      .select().single();
    if (error) return toast.error(error.message);
    setItems((s) => [...s, data as Image]);
    await logAudit({ action: "create", entity: "site_images", entityId: (data as Image).id });
  }

  async function uploadFor(it: Image, file: File) {
    setUploadingId(it.id);
    const ext = file.name.split(".").pop() || "jpg";
    const path = `images/${it.key}-${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage.from("site-assets").upload(path, file, { upsert: true });
    if (upErr) { setUploadingId(null); return toast.error(upErr.message); }
    const { data: pub } = supabase.storage.from("site-assets").getPublicUrl(path);
    patch(it.id, { image_url: pub.publicUrl });
    setUploadingId(null);
    toast.success("Image téléversée — pensez à enregistrer.");
  }

  async function save(it: Image) {
    setSavingId(it.id);
    const { error } = await supabase.from("site_images").update({
      key: it.key, label: it.label, image_url: it.image_url, alt_text: it.alt_text,
    }).eq("id", it.id);
    setSavingId(null);
    if (error) return toast.error(error.message);
    toast.success("Enregistré");
    await logAudit({ action: "update", entity: "site_images", entityId: it.id });
  }

  async function remove(it: Image) {
    if (!confirm(`Supprimer l'image "${it.label}" ?`)) return;
    const { error } = await supabase.from("site_images").delete().eq("id", it.id);
    if (error) return toast.error(error.message);
    setItems((s) => s.filter((i) => i.id !== it.id));
    await logAudit({ action: "delete", entity: "site_images", entityId: it.id });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold">Images du site</h1>
          <p className="mt-1 text-sm text-muted-foreground">Téléversez et remplacez toutes les images visibles publiquement.</p>
        </div>
        <Button onClick={add}><Plus className="mr-1.5 h-4 w-4" /> Ajouter</Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : items.length === 0 ? (
        <Card className="border-dashed"><CardContent className="py-12 text-center text-sm text-muted-foreground">Aucune image. Ajoutez-en une.</CardContent></Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {items.map((it) => (
            <Card key={it.id} className="border-border">
              <CardContent className="space-y-3 p-5">
                <div className="aspect-video overflow-hidden rounded-md border border-border bg-secondary/30">
                  {it.image_url && (
                    <img src={it.image_url} alt={it.alt_text ?? it.label} className="h-full w-full object-cover" />
                  )}
                </div>
                <div className="grid gap-1.5">
                  <Label>Libellé</Label>
                  <Input value={it.label} onChange={(e) => patch(it.id, { label: e.target.value })} />
                </div>
                <div className="grid gap-1.5">
                  <Label>Clé (technique)</Label>
                  <Input value={it.key} onChange={(e) => patch(it.id, { key: e.target.value })} />
                </div>
                <div className="grid gap-1.5">
                  <Label>URL de l'image</Label>
                  <Input value={it.image_url} onChange={(e) => patch(it.id, { image_url: e.target.value })} />
                </div>
                <div className="grid gap-1.5">
                  <Label>Texte alternatif (alt)</Label>
                  <Input value={it.alt_text ?? ""} onChange={(e) => patch(it.id, { alt_text: e.target.value })} />
                </div>
                <input
                  ref={(el) => { fileInputs.current[it.id] = el; }}
                  type="file" accept="image/*" className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadFor(it, f); }}
                />
                <div className="flex flex-wrap justify-end gap-2 pt-1">
                  <Button size="sm" variant="outline" onClick={() => fileInputs.current[it.id]?.click()} disabled={uploadingId === it.id}>
                    {uploadingId === it.id ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Upload className="mr-1.5 h-3.5 w-3.5" />}
                    Téléverser
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => remove(it)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
                  <Button size="sm" onClick={() => save(it)} disabled={savingId === it.id}>
                    {savingId === it.id ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Save className="mr-1.5 h-3.5 w-3.5" />}
                    Enregistrer
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
