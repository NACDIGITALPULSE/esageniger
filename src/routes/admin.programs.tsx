import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Plus, Trash2, ArrowUp, ArrowDown, Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { logAudit } from "@/lib/admin-auth";

export const Route = createFileRoute("/admin/programs")({
  component: AdminPrograms,
});

type Program = {
  id: string;
  slug: string;
  level: "BTS" | "Licence/Master";
  title: string;
  description: string;
  display_order: number;
  is_visible: boolean;
};

function AdminPrograms() {
  const [items, setItems] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const { data, error } = await supabase
      .from("programs")
      .select("*")
      .order("display_order", { ascending: true });
    if (error) toast.error(error.message);
    setItems((data as Program[]) ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  function patch(id: string, changes: Partial<Program>) {
    setItems((s) => s.map((p) => (p.id === id ? { ...p, ...changes } : p)));
  }

  async function save(p: Program) {
    setSavingId(p.id);
    const { error } = await supabase
      .from("programs")
      .update({
        slug: p.slug,
        level: p.level,
        title: p.title,
        description: p.description,
        display_order: p.display_order,
        is_visible: p.is_visible,
      })
      .eq("id", p.id);
    setSavingId(null);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Programme enregistré");
    await logAudit({ action: "update", entity: "programs", entityId: p.id, details: { title: p.title } });
  }

  async function remove(p: Program) {
    if (!confirm(`Supprimer "${p.title}" ?`)) return;
    const { error } = await supabase.from("programs").delete().eq("id", p.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Supprimé");
    await logAudit({ action: "delete", entity: "programs", entityId: p.id, details: { title: p.title } });
    load();
  }

  async function add() {
    const max = items.reduce((m, p) => Math.max(m, p.display_order), 0);
    const slug = `prog-${Date.now()}`;
    const { data, error } = await supabase
      .from("programs")
      .insert({
        slug,
        level: "BTS",
        title: "Nouvelle formation",
        description: "Description à compléter.",
        display_order: max + 1,
        is_visible: true,
      })
      .select()
      .single();
    if (error) {
      toast.error(error.message);
      return;
    }
    await logAudit({ action: "create", entity: "programs", entityId: data.id });
    load();
  }

  async function move(p: Program, dir: -1 | 1) {
    const sorted = [...items].sort((a, b) => a.display_order - b.display_order);
    const idx = sorted.findIndex((x) => x.id === p.id);
    const swap = sorted[idx + dir];
    if (!swap) return;
    await Promise.all([
      supabase.from("programs").update({ display_order: swap.display_order }).eq("id", p.id),
      supabase.from("programs").update({ display_order: p.display_order }).eq("id", swap.id),
    ]);
    load();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold">Programmes</h1>
          <p className="mt-1 text-sm text-muted-foreground">Modifiez les BTS, Licences et Masters affichés sur le site.</p>
        </div>
        <Button onClick={add}><Plus className="mr-2 h-4 w-4" /> Ajouter</Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : (
        <div className="space-y-4">
          {items.map((p) => (
            <Card key={p.id} className="border-border">
              <CardContent className="space-y-3 p-5">
                <div className="grid gap-3 sm:grid-cols-[1fr_180px_120px]">
                  <div>
                    <Label>Titre</Label>
                    <Input value={p.title} onChange={(e) => patch(p.id, { title: e.target.value })} />
                  </div>
                  <div>
                    <Label>Niveau</Label>
                    <Select value={p.level} onValueChange={(v) => patch(p.id, { level: v as Program["level"] })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="BTS">BTS</SelectItem>
                        <SelectItem value="Licence/Master">Licence/Master</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Ordre</Label>
                    <Input type="number" value={p.display_order} onChange={(e) => patch(p.id, { display_order: Number(e.target.value) })} />
                  </div>
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea value={p.description} onChange={(e) => patch(p.id, { description: e.target.value })} rows={2} />
                </div>
                <div>
                  <Label className="text-xs">Identifiant (slug)</Label>
                  <Input value={p.slug} onChange={(e) => patch(p.id, { slug: e.target.value })} className="font-mono text-xs" />
                </div>
                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-3">
                  <div className="flex items-center gap-2">
                    <Switch checked={p.is_visible} onCheckedChange={(v) => patch(p.id, { is_visible: v })} />
                    <span className="text-sm text-muted-foreground">{p.is_visible ? "Visible" : "Masqué"}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => move(p, -1)}><ArrowUp className="h-3.5 w-3.5" /></Button>
                    <Button size="sm" variant="outline" onClick={() => move(p, 1)}><ArrowDown className="h-3.5 w-3.5" /></Button>
                    <Button size="sm" variant="outline" onClick={() => remove(p)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
                    <Button size="sm" onClick={() => save(p)} disabled={savingId === p.id}>
                      {savingId === p.id ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Save className="mr-1.5 h-3.5 w-3.5" />}
                      Enregistrer
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
