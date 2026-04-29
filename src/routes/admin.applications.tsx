import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Download, Trash2, Mail, Phone, Calendar } from "lucide-react";
import { toast } from "sonner";
import { downloadReceipt, type ReceiptData } from "@/lib/receipt-pdf";
import { logAudit } from "@/lib/admin-auth";

export const Route = createFileRoute("/admin/applications")({
  component: AdminApplications,
});

type Application = ReceiptData & {
  id: string;
  status: string;
};

function AdminApplications() {
  const [items, setItems] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  async function load() {
    setLoading(true);
    const { data, error } = await supabase
      .from("applications")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    setItems((data as Application[]) ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
    const ch = supabase
      .channel("admin-applications")
      .on("postgres_changes", { event: "*", schema: "public", table: "applications" }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  async function setStatus(a: Application, status: string) {
    const { error } = await supabase.from("applications").update({ status }).eq("id", a.id);
    if (error) return toast.error(error.message);
    toast.success("Statut mis à jour");
    await logAudit({ action: "update", entity: "applications", entityId: a.id, details: { status } });
  }

  async function remove(a: Application) {
    if (!confirm(`Supprimer l'inscription de ${a.full_name} (${a.receipt_number}) ?`)) return;
    const { error } = await supabase.from("applications").delete().eq("id", a.id);
    if (error) return toast.error(error.message);
    toast.success("Supprimée");
    await logAudit({ action: "delete", entity: "applications", entityId: a.id });
  }

  const filtered = filter === "all" ? items : items.filter((i) => i.status === filter);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold">Inscriptions</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Toutes les candidatures soumises depuis le site ({items.length} au total).
          </p>
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes</SelectItem>
            <SelectItem value="pending">En attente</SelectItem>
            <SelectItem value="approved">Validées</SelectItem>
            <SelectItem value="rejected">Refusées</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : filtered.length === 0 ? (
        <Card className="border-dashed border-border">
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            Aucune inscription pour le moment.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filtered.map((a) => (
            <Card key={a.id} className="border-border">
              <CardContent className="p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-serif text-lg font-bold">{a.full_name}</h3>
                      <Badge variant={a.status === "approved" ? "default" : a.status === "rejected" ? "destructive" : "secondary"}>
                        {a.status === "approved" ? "Validée" : a.status === "rejected" ? "Refusée" : "En attente"}
                      </Badge>
                      <span className="font-mono text-xs text-muted-foreground">{a.receipt_number}</span>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1"><Phone className="h-3 w-3" /> {a.phone}</span>
                      <span className="inline-flex items-center gap-1"><Mail className="h-3 w-3" /> {a.email}</span>
                      <span className="inline-flex items-center gap-1"><Calendar className="h-3 w-3" /> {new Date(a.created_at).toLocaleString("fr-FR")}</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Select value={a.status} onValueChange={(v) => setStatus(a, v)}>
                      <SelectTrigger className="h-9 w-36"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">En attente</SelectItem>
                        <SelectItem value="approved">Valider</SelectItem>
                        <SelectItem value="rejected">Refuser</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button size="sm" variant="outline" onClick={() => downloadReceipt(a)}>
                      <Download className="mr-1.5 h-3.5 w-3.5" /> Reçu PDF
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => remove(a)}>
                      <Trash2 className="h-3.5 w-3.5 text-destructive" />
                    </Button>
                  </div>
                </div>
                <div className="mt-3 grid gap-2 border-t border-border pt-3 text-sm sm:grid-cols-2">
                  <div>
                    <span className="text-xs uppercase tracking-wider text-muted-foreground">Filière</span>
                    <div>{a.program_title ?? "—"} {a.program_level && <span className="text-muted-foreground">({a.program_level})</span>}</div>
                  </div>
                  <div>
                    <span className="text-xs uppercase tracking-wider text-muted-foreground">Palier de frais</span>
                    <div>{a.tuition_title ?? "—"} {a.tuition_price && <span className="text-muted-foreground">— {a.tuition_price} FCFA</span>}</div>
                  </div>
                  {a.message && (
                    <div className="sm:col-span-2">
                      <span className="text-xs uppercase tracking-wider text-muted-foreground">Message</span>
                      <p className="text-sm text-muted-foreground">{a.message}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
