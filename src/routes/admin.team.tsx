import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Plus, Trash2, Loader2, Save, Upload } from "lucide-react";
import { toast } from "sonner";
import { logAudit } from "@/lib/admin-auth";

export const Route = createFileRoute("/admin/team")({
  component: AdminTeam,
});

type Member = {
  id: string;
  full_name: string;
  role_title: string;
  bio: string | null;
  photo_url: string | null;
  display_order: number;
  is_visible: boolean;
};

function AdminTeam() {
  const [items, setItems] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});

  async function load() {
    setLoading(true);
    const { data, error } = await supabase.from("team_members").select("*").order("display_order");
    if (error) toast.error(error.message);
    setItems((data as Member[]) ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function patch(id: string, c: Partial<Member>) {
    setItems((s) => s.map((p) => (p.id === id ? { ...p, ...c } : p)));
  }

  async function uploadPhoto(id: string, file: File) {
    if (file.size > 5 * 1024 * 1024) return toast.error("Photo > 5 Mo");
    const ext = file.name.split(".").pop() ?? "jpg";
    const path = `team/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error } = await supabase.storage.from("site-assets").upload(path, file, { contentType: file.type });
    if (error) return toast.error(error.message);
    const { data: pub } = supabase.storage.from("site-assets").getPublicUrl(path);
    patch(id, { photo_url: pub.publicUrl });
    toast.success("Photo téléversée. N'oubliez pas d'enregistrer.");
  }

  async function add() {
    const max = items.reduce((m, p) => Math.max(m, p.display_order), 0);
    const { data, error } = await supabase.from("team_members").insert({
      full_name: "Nouveau membre", role_title: "Fonction", bio: null, photo_url: null,
      display_order: max + 1, is_visible: true,
    }).select().single();
    if (error) return toast.error(error.message);
    await logAudit({ action: "create", entity: "team_members", entityId: data.id });
    load();
  }

  async function save(m: Member) {
    setSavingId(m.id);
    const { error } = await supabase.from("team_members").update({
      full_name: m.full_name, role_title: m.role_title, bio: m.bio, photo_url: m.photo_url,
      display_order: m.display_order, is_visible: m.is_visible,
    }).eq("id", m.id);
    setSavingId(null);
    if (error) return toast.error(error.message);
    toast.success("Enregistré");
    await logAudit({ action: "update", entity: "team_members", entityId: m.id });
  }

  async function remove(m: Member) {
    if (!confirm(`Supprimer "${m.full_name}" ?`)) return;
    const { error } = await supabase.from("team_members").delete().eq("id", m.id);
    if (error) return toast.error(error.message);
    await logAudit({ action: "delete", entity: "team_members", entityId: m.id });
    load();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold">Équipe</h1>
          <p className="mt-1 text-sm text-muted-foreground">Gérez les membres de l'équipe affichés sur le site.</p>
        </div>
        <Button onClick={add}><Plus className="mr-2 h-4 w-4" /> Ajouter</Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : items.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border p-12 text-center text-sm text-muted-foreground">
          Aucun membre. Cliquez sur "Ajouter" pour commencer.
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {items.map((m) => (
            <Card key={m.id} className="border-border">
              <CardContent className="space-y-3 p-5">
                <div className="flex items-start gap-4">
                  <div className="h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-muted">
                    {m.photo_url ? <img src={m.photo_url} alt={m.full_name} className="h-full w-full object-cover" /> : null}
                  </div>
                  <div className="flex-1 space-y-2">
                    <input
                      ref={(el) => { fileRefs.current[m.id] = el; }}
                      type="file" accept="image/*" className="hidden"
                      onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadPhoto(m.id, f); }}
                    />
                    <Button size="sm" variant="outline" onClick={() => fileRefs.current[m.id]?.click()}>
                      <Upload className="mr-1.5 h-3.5 w-3.5" /> Photo
                    </Button>
                    <Input placeholder="URL photo" value={m.photo_url ?? ""} onChange={(e) => patch(m.id, { photo_url: e.target.value })} className="text-xs" />
                  </div>
                </div>
                <div><Label>Nom complet</Label><Input value={m.full_name} onChange={(e) => patch(m.id, { full_name: e.target.value })} /></div>
                <div><Label>Fonction</Label><Input value={m.role_title} onChange={(e) => patch(m.id, { role_title: e.target.value })} /></div>
                <div><Label>Biographie</Label><Textarea value={m.bio ?? ""} onChange={(e) => patch(m.id, { bio: e.target.value })} rows={3} /></div>
                <div className="grid grid-cols-2 gap-2">
                  <div><Label>Ordre</Label><Input type="number" value={m.display_order} onChange={(e) => patch(m.id, { display_order: Number(e.target.value) })} /></div>
                  <div className="flex items-end gap-2">
                    <Switch checked={m.is_visible} onCheckedChange={(v) => patch(m.id, { is_visible: v })} />
                    <span className="text-sm text-muted-foreground">Visible</span>
                  </div>
                </div>
                <div className="flex justify-end gap-2 border-t border-border pt-3">
                  <Button size="sm" variant="outline" onClick={() => remove(m)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
                  <Button size="sm" onClick={() => save(m)} disabled={savingId === m.id}>
                    {savingId === m.id ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Save className="mr-1.5 h-3.5 w-3.5" />}
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
