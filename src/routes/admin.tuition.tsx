import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Plus, Trash2, Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { logAudit } from "@/lib/admin-auth";

export const Route = createFileRoute("/admin/tuition")({
  component: AdminTuition,
});

type Tier = {
  id: string;
  title: string;
  price: string;
  duration: string;
  description: string;
  features: string[];
  is_highlight: boolean;
  display_order: number;
};

function AdminTuition() {
  const [items, setItems] = useState<Tier[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const { data, error } = await supabase.from("tuition_tiers").select("*").order("display_order");
    if (error) toast.error(error.message);
    setItems(((data ?? []) as Array<Omit<Tier, "features"> & { features: unknown }>).map((t) => ({
      ...t,
      features: Array.isArray(t.features) ? (t.features as string[]) : [],
    })));
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function patch(id: string, changes: Partial<Tier>) {
    setItems((s) => s.map((p) => (p.id === id ? { ...p, ...changes } : p)));
  }

  async function save(t: Tier) {
    setSavingId(t.id);
    const { error } = await supabase
      .from("tuition_tiers")
      .update({
        title: t.title, price: t.price, duration: t.duration, description: t.description,
        features: t.features, is_highlight: t.is_highlight, display_order: t.display_order,
      })
      .eq("id", t.id);
    setSavingId(null);
    if (error) return toast.error(error.message);
    toast.success("Enregistré");
    await logAudit({ action: "update", entity: "tuition_tiers", entityId: t.id });
  }

  async function add() {
    const max = items.reduce((m, p) => Math.max(m, p.display_order), 0);
    const { data, error } = await supabase.from("tuition_tiers").insert({
      title: "Nouveau palier", price: "0", duration: "", description: "", features: [], is_highlight: false, display_order: max + 1,
    }).select().single();
    if (error) return toast.error(error.message);
    await logAudit({ action: "create", entity: "tuition_tiers", entityId: data.id });
    load();
  }

  async function remove(t: Tier) {
    if (!confirm(`Supprimer "${t.title}" ?`)) return;
    const { error } = await supabase.from("tuition_tiers").delete().eq("id", t.id);
    if (error) return toast.error(error.message);
    await logAudit({ action: "delete", entity: "tuition_tiers", entityId: t.id });
    load();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold">Frais de scolarité</h1>
          <p className="mt-1 text-sm text-muted-foreground">Modifiez les paliers tarifaires affichés.</p>
        </div>
        <Button onClick={add}><Plus className="mr-2 h-4 w-4" /> Ajouter</Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : (
        <div className="space-y-4">
          {items.map((t) => (
            <Card key={t.id} className="border-border">
              <CardContent className="space-y-3 p-5">
                <div className="grid gap-3 sm:grid-cols-3">
                  <div><Label>Titre</Label><Input value={t.title} onChange={(e) => patch(t.id, { title: e.target.value })} /></div>
                  <div><Label>Prix (FCFA)</Label><Input value={t.price} onChange={(e) => patch(t.id, { price: e.target.value })} /></div>
                  <div><Label>Durée</Label><Input value={t.duration} onChange={(e) => patch(t.id, { duration: e.target.value })} /></div>
                </div>
                <div>
                  <Label>Description</Label>
                  <Input value={t.description} onChange={(e) => patch(t.id, { description: e.target.value })} />
                </div>
                <div>
                  <Label>Caractéristiques (une par ligne)</Label>
                  <Textarea
                    rows={4}
                    value={t.features.join("\n")}
                    onChange={(e) => patch(t.id, { features: e.target.value.split("\n").filter(Boolean) })}
                  />
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="flex items-center gap-2">
                    <Switch checked={t.is_highlight} onCheckedChange={(v) => patch(t.id, { is_highlight: v })} />
                    <span className="text-sm text-muted-foreground">Mettre en avant</span>
                  </div>
                  <div><Label>Ordre</Label><Input type="number" value={t.display_order} onChange={(e) => patch(t.id, { display_order: Number(e.target.value) })} /></div>
                </div>
                <div className="flex justify-end gap-2 border-t border-border pt-3">
                  <Button size="sm" variant="outline" onClick={() => remove(t)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
                  <Button size="sm" onClick={() => save(t)} disabled={savingId === t.id}>
                    {savingId === t.id ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Save className="mr-1.5 h-3.5 w-3.5" />}
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
