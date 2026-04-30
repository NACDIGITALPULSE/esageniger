import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Loader2, Plus, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { logAudit } from "@/lib/admin-auth";

export const Route = createFileRoute("/admin/faq")({
  component: AdminFaq,
});

type Item = {
  id: string;
  category: string;
  question: string;
  answer: string;
  display_order: number;
  is_visible: boolean;
};

const CATEGORIES = [
  { value: "admissions", label: "Admissions" },
  { value: "frais", label: "Frais de scolarité" },
  { value: "pieces", label: "Pièces à fournir" },
  { value: "delais", label: "Délais" },
  { value: "general", label: "Questions générales" },
];

function AdminFaq() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const { data } = await supabase.from("faq_items").select("*").order("category").order("display_order");
    setItems((data as Item[]) ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function patch(id: string, p: Partial<Item>) {
    setItems((s) => s.map((i) => (i.id === id ? { ...i, ...p } : i)));
  }

  async function add() {
    const { data, error } = await supabase
      .from("faq_items")
      .insert({ category: "admissions", question: "Nouvelle question", answer: "Réponse…", display_order: items.length + 1 })
      .select()
      .single();
    if (error) return toast.error(error.message);
    setItems((s) => [...s, data as Item]);
    toast.success("Ajouté");
    await logAudit({ action: "create", entity: "faq_items", entityId: (data as Item).id });
  }

  async function save(it: Item) {
    setSavingId(it.id);
    const { error } = await supabase.from("faq_items").update({
      category: it.category, question: it.question, answer: it.answer,
      display_order: it.display_order, is_visible: it.is_visible,
    }).eq("id", it.id);
    setSavingId(null);
    if (error) return toast.error(error.message);
    toast.success("Enregistré");
    await logAudit({ action: "update", entity: "faq_items", entityId: it.id });
  }

  async function remove(it: Item) {
    if (!confirm("Supprimer cette question ?")) return;
    const { error } = await supabase.from("faq_items").delete().eq("id", it.id);
    if (error) return toast.error(error.message);
    setItems((s) => s.filter((i) => i.id !== it.id));
    toast.success("Supprimée");
    await logAudit({ action: "delete", entity: "faq_items", entityId: it.id });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold">FAQ</h1>
          <p className="mt-1 text-sm text-muted-foreground">Questions/réponses affichées sur le site et la page Admissions.</p>
        </div>
        <Button onClick={add}><Plus className="mr-1.5 h-4 w-4" /> Ajouter</Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : items.length === 0 ? (
        <Card className="border-dashed"><CardContent className="py-12 text-center text-sm text-muted-foreground">Aucune question. Cliquez sur « Ajouter ».</CardContent></Card>
      ) : (
        <div className="space-y-4">
          {items.map((it) => (
            <Card key={it.id} className="border-border">
              <CardContent className="space-y-3 p-5">
                <div className="grid gap-3 sm:grid-cols-[1fr_180px_120px]">
                  <div className="grid gap-1.5">
                    <Label>Question</Label>
                    <Input value={it.question} onChange={(e) => patch(it.id, { question: e.target.value })} />
                  </div>
                  <div className="grid gap-1.5">
                    <Label>Catégorie</Label>
                    <Select value={it.category} onValueChange={(v) => patch(it.id, { category: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map((c) => (<SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-1.5">
                    <Label>Ordre</Label>
                    <Input type="number" value={it.display_order} onChange={(e) => patch(it.id, { display_order: Number(e.target.value) })} />
                  </div>
                </div>
                <div className="grid gap-1.5">
                  <Label>Réponse</Label>
                  <Textarea rows={3} value={it.answer} onChange={(e) => patch(it.id, { answer: e.target.value })} />
                </div>
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-sm">
                    <Switch checked={it.is_visible} onCheckedChange={(v) => patch(it.id, { is_visible: v })} />
                    Visible sur le site
                  </label>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => remove(it)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
                    <Button size="sm" onClick={() => save(it)} disabled={savingId === it.id}>
                      {savingId === it.id ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Save className="mr-1.5 h-3.5 w-3.5" />}
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
