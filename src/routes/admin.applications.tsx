import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Download, Trash2, Mail, Phone, Calendar, Search, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { downloadReceipt, type ReceiptData } from "@/lib/receipt-pdf";
import { logAudit } from "@/lib/admin-auth";
import { whatsappLink } from "@/lib/contact";

export const Route = createFileRoute("/admin/applications")({
  component: AdminApplications,
});

type Application = ReceiptData & {
  id: string;
  status: string;
  updated_at?: string;
};

const STATUSES = [
  { value: "pending", label: "En attente", className: "bg-muted text-foreground" },
  { value: "in_progress", label: "En cours", className: "bg-blue-500/15 text-blue-700 dark:text-blue-300" },
  { value: "to_complete", label: "À compléter", className: "bg-amber-500/15 text-amber-700 dark:text-amber-300" },
  { value: "approved", label: "Validée", className: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300" },
  { value: "rejected", label: "Refusée", className: "bg-destructive/15 text-destructive" },
] as const;

function statusMeta(s: string) {
  return STATUSES.find((x) => x.value === s) ?? { value: s, label: s, className: "bg-muted text-foreground" };
}

function AdminApplications() {
  const [items, setItems] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [query, setQuery] = useState("");

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
    toast.success(`Statut : ${statusMeta(status).label}`);
    await logAudit({ action: "update", entity: "applications", entityId: a.id, details: { status } });
  }

  async function remove(a: Application) {
    if (!confirm(`Supprimer l'inscription de ${a.full_name} (${a.receipt_number}) ?`)) return;
    const { error } = await supabase.from("applications").delete().eq("id", a.id);
    if (error) return toast.error(error.message);
    toast.success("Supprimée");
    await logAudit({ action: "delete", entity: "applications", entityId: a.id });
  }

  function notifyWhatsApp(a: Application) {
    const msg = `Bonjour ${a.full_name},\n\nVotre inscription ESAGE (${a.receipt_number}) — statut : ${statusMeta(a.status).label}.\n\nMerci.`;
    window.open(whatsappLink(msg), "_blank");
  }

  // Counts par statut
  const counts = useMemo(() => {
    const c: Record<string, number> = { all: items.length };
    STATUSES.forEach((s) => { c[s.value] = 0; });
    items.forEach((i) => { c[i.status] = (c[i.status] ?? 0) + 1; });
    return c;
  }, [items]);

  const filtered = useMemo(() => {
    let list = filter === "all" ? items : items.filter((i) => i.status === filter);
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter((i) =>
        i.full_name.toLowerCase().includes(q) ||
        i.email.toLowerCase().includes(q) ||
        i.phone.includes(q) ||
        i.receipt_number.toLowerCase().includes(q),
      );
    }
    return list;
  }, [items, filter, query]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-bold">Inscriptions</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Toutes les candidatures soumises depuis le site ({items.length} au total).
        </p>
      </div>

      {/* Filtres rapides par statut */}
      <div className="flex flex-wrap gap-2">
        <FilterChip label={`Toutes (${counts.all})`} active={filter === "all"} onClick={() => setFilter("all")} />
        {STATUSES.map((s) => (
          <FilterChip
            key={s.value}
            label={`${s.label} (${counts[s.value] ?? 0})`}
            active={filter === s.value}
            onClick={() => setFilter(s.value)}
          />
        ))}
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Rechercher par nom, email, téléphone, n° de reçu…"
          className="pl-9"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : filtered.length === 0 ? (
        <Card className="border-dashed border-border">
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            Aucune inscription correspondante.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filtered.map((a) => {
            const meta = statusMeta(a.status);
            return (
              <Card key={a.id} className="border-border">
                <CardContent className="p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-serif text-lg font-bold">{a.full_name}</h3>
                        <Badge className={meta.className}>{meta.label}</Badge>
                        <span className="font-mono text-xs text-muted-foreground">{a.receipt_number}</span>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1"><Phone className="h-3 w-3" /> {a.phone}</span>
                        <span className="inline-flex items-center gap-1"><Mail className="h-3 w-3" /> {a.email}</span>
                        <span className="inline-flex items-center gap-1"><Calendar className="h-3 w-3" /> Reçue le {new Date(a.created_at).toLocaleString("fr-FR")}</span>
                        {a.updated_at && a.updated_at !== a.created_at && (
                          <span className="inline-flex items-center gap-1">
                            <Calendar className="h-3 w-3" /> Mise à jour le {new Date(a.updated_at).toLocaleString("fr-FR")}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Select value={a.status} onValueChange={(v) => setStatus(a, v)}>
                        <SelectTrigger className="h-9 w-40"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {STATUSES.map((s) => (
                            <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button size="sm" variant="outline" onClick={() => notifyWhatsApp(a)}>
                        <MessageCircle className="mr-1.5 h-3.5 w-3.5" /> WhatsApp
                      </Button>
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
            );
          })}
        </div>
      )}
    </div>
  );
}

function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
        active ? "bg-primary text-primary-foreground" : "border border-border bg-background text-muted-foreground hover:bg-accent"
      }`}
    >
      {label}
    </button>
  );
}
