import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { logAudit } from "@/lib/admin-auth";

export const Route = createFileRoute("/admin/texts")({
  component: AdminTexts,
});

type Text = { id: string; key: string; label: string; value: string; multiline: boolean };

function AdminTexts() {
  const [items, setItems] = useState<Text[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const { data, error } = await supabase.from("site_texts").select("*").order("label");
    if (error) toast.error(error.message);
    setItems((data as Text[]) ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function patch(id: string, value: string) {
    setItems((s) => s.map((t) => (t.id === id ? { ...t, value } : t)));
  }

  async function save(t: Text) {
    setSavingId(t.id);
    const { error } = await supabase.from("site_texts").update({ value: t.value }).eq("id", t.id);
    setSavingId(null);
    if (error) return toast.error(error.message);
    toast.success("Texte enregistré");
    await logAudit({ action: "update", entity: "site_texts", entityId: t.id, details: { key: t.key } });
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-bold">Textes du site</h1>
        <p className="mt-1 text-sm text-muted-foreground">Modifiez les textes affichés sur les pages publiques.</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : (
        <div className="space-y-4">
          {items.map((t) => (
            <Card key={t.id} className="border-border">
              <CardContent className="space-y-3 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <Label>{t.label}</Label>
                    <div className="mt-0.5 font-mono text-[10px] text-muted-foreground">{t.key}</div>
                  </div>
                  <Button size="sm" onClick={() => save(t)} disabled={savingId === t.id}>
                    {savingId === t.id ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Save className="mr-1.5 h-3.5 w-3.5" />}
                    Enregistrer
                  </Button>
                </div>
                {t.multiline ? (
                  <Textarea value={t.value} onChange={(e) => patch(t.id, e.target.value)} rows={3} />
                ) : (
                  <Input value={t.value} onChange={(e) => patch(t.id, e.target.value)} />
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
