import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Loader2, Download, Trash2, Mail, Phone, Calendar, Search, MessageCircle, Eye, Archive, ArchiveRestore, FileSpreadsheet, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { downloadReceipt, previewReceiptUrl, type ReceiptData } from "@/lib/receipt-pdf";
import { logAudit } from "@/lib/admin-auth";
import { whatsappLink } from "@/lib/contact";

export const Route = createFileRoute("/admin/applications")({
  component: AdminApplications,
});

type Application = ReceiptData & {
  id: string;
  status: string;
  updated_at?: string;
  archived?: boolean;
  archive_year?: number | null;
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

function parsePrice(p?: string | null): number {
  if (!p) return 0;
  const n = Number(String(p).replace(/[^\d]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

function AdminApplications() {
  const [items, setItems] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [view, setView] = useState<"active" | "archived">("active");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  // Preview dialog
  const [previewing, setPreviewing] = useState<Application | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  // Reset confirm
  const [resetOpen, setResetOpen] = useState(false);
  const [resetText, setResetText] = useState("");

  // Archive year dialog
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [archiveYear, setArchiveYear] = useState<string>(String(new Date().getFullYear()));

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

  async function openPreview(a: Application) {
    setPreviewing(a);
    setPreviewLoading(true);
    setPreviewUrl(null);
    try {
      const url = await previewReceiptUrl(a);
      setPreviewUrl(url);
    } catch (e) {
      toast.error("Impossible de générer la prévisualisation");
    } finally {
      setPreviewLoading(false);
    }
  }
  function closePreview() {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewing(null); setPreviewUrl(null);
  }

  function toggleSelect(id: string) {
    setSelected((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id); else n.add(id);
      return n;
    });
  }
  function selectAllVisible(ids: string[]) {
    setSelected(new Set(ids));
  }
  function clearSelection() { setSelected(new Set()); }

  // Counts par statut
  const counts = useMemo(() => {
    const active = items.filter((i) => !i.archived);
    const c: Record<string, number> = { all: active.length };
    STATUSES.forEach((s) => { c[s.value] = 0; });
    active.forEach((i) => { c[i.status] = (c[i.status] ?? 0) + 1; });
    return c;
  }, [items]);

  const filtered = useMemo(() => {
    let list = items.filter((i) => view === "archived" ? i.archived : !i.archived);
    if (view === "active") {
      if (filter !== "all") list = list.filter((i) => i.status === filter);
    }
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
  }, [items, filter, query, view]);

  // Stats financières (filtrées)
  const financial = useMemo(() => {
    const approved = filtered.filter((i) => i.status === "approved");
    const ca = approved.reduce((sum, a) => sum + parsePrice(a.tuition_price), 0);
    return { count: filtered.length, approvedCount: approved.length, ca };
  }, [filtered]);

  // Actions de masse
  async function bulkArchive() {
    if (selected.size === 0) return toast.error("Sélectionnez au moins une inscription");
    const year = Number(archiveYear);
    if (!year || year < 2000 || year > 3000) return toast.error("Année invalide");
    const ids = Array.from(selected);
    const { error } = await supabase
      .from("applications")
      .update({ archived: true, archive_year: year, archived_at: new Date().toISOString() })
      .in("id", ids);
    if (error) return toast.error(error.message);
    toast.success(`${ids.length} inscription(s) archivée(s) — ${year}`);
    await logAudit({ action: "archive", entity: "applications", details: { ids, year } });
    setArchiveOpen(false); clearSelection();
  }

  async function bulkUnarchive() {
    if (selected.size === 0) return toast.error("Sélectionnez au moins une inscription");
    const ids = Array.from(selected);
    const { error } = await supabase
      .from("applications")
      .update({ archived: false, archive_year: null, archived_at: null })
      .in("id", ids);
    if (error) return toast.error(error.message);
    toast.success(`${ids.length} inscription(s) restaurée(s)`);
    await logAudit({ action: "unarchive", entity: "applications", details: { ids } });
    clearSelection();
  }

  async function bulkDelete() {
    if (selected.size === 0) return toast.error("Sélectionnez au moins une inscription");
    if (!confirm(`Supprimer définitivement ${selected.size} inscription(s) ? Cette action est irréversible.`)) return;
    const ids = Array.from(selected);
    const { error } = await supabase.from("applications").delete().in("id", ids);
    if (error) return toast.error(error.message);
    toast.success(`${ids.length} supprimée(s)`);
    await logAudit({ action: "bulk_delete", entity: "applications", details: { ids } });
    clearSelection();
  }

  async function resetAll() {
    if (resetText !== "SUPPRIMER") return toast.error('Tapez "SUPPRIMER" pour confirmer');
    const { error } = await supabase.from("applications").delete().not("id", "is", null);
    if (error) return toast.error(error.message);
    toast.success("Toutes les inscriptions ont été supprimées");
    await logAudit({ action: "reset_all", entity: "applications", details: { count: items.length } });
    setResetOpen(false); setResetText("");
  }

  // Rapport CSV
  function exportCSV() {
    const list = filtered;
    const head = [
      "N° reçu", "Date", "Statut", "Nom", "Téléphone", "Email",
      "1er choix", "Niveau 1er", "2ème choix", "Niveau 2ème",
      "Palier", "Montant FCFA", "Archivée", "Année archive", "Message",
    ];
    const rows = list.map((a) => [
      a.receipt_number, new Date(a.created_at).toLocaleString("fr-FR"),
      statusMeta(a.status).label, a.full_name, a.phone, a.email,
      a.program_title ?? "", a.program_level ?? "",
      a.program_title_2 ?? "", a.program_level_2 ?? "",
      a.tuition_title ?? "", String(parsePrice(a.tuition_price)),
      a.archived ? "Oui" : "Non", a.archive_year ? String(a.archive_year) : "",
      (a.message ?? "").replace(/[\r\n]+/g, " "),
    ]);
    const total = rows.reduce((s, r) => s + Number(r[11] || 0), 0);
    const approved = list.filter((a) => a.status === "approved");
    const caApproved = approved.reduce((s, a) => s + parsePrice(a.tuition_price), 0);
    const summary = [
      [],
      ["RAPPORT — résumé"],
      ["Nombre total", String(list.length)],
      ["Validées", String(approved.length)],
      ["CA validées (FCFA)", String(caApproved)],
      ["CA total potentiel (FCFA)", String(total)],
    ];
    const all = [head, ...rows, ...summary];
    const csv = all.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const tag = view === "archived" ? "archives" : "inscriptions";
    a.download = `esage-${tag}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Rapport exporté");
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-serif text-3xl font-bold">Inscriptions</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {view === "archived" ? "Archives par année." : "Toutes les candidatures soumises depuis le site."} ({items.length} au total)
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant={view === "active" ? "default" : "outline"} size="sm" onClick={() => { setView("active"); clearSelection(); }}>
            Actives
          </Button>
          <Button variant={view === "archived" ? "default" : "outline"} size="sm" onClick={() => { setView("archived"); clearSelection(); }}>
            <Archive className="mr-1.5 h-3.5 w-3.5" /> Archives
          </Button>
          <Button variant="outline" size="sm" onClick={exportCSV}>
            <FileSpreadsheet className="mr-1.5 h-3.5 w-3.5" /> Exporter (CSV)
          </Button>
          <Button variant="outline" size="sm" onClick={() => setResetOpen(true)} className="border-destructive text-destructive hover:bg-destructive/10">
            <AlertTriangle className="mr-1.5 h-3.5 w-3.5" /> Réinitialiser tout
          </Button>
        </div>
      </div>

      {/* KPIs financiers */}
      <div className="grid gap-3 sm:grid-cols-3">
        <Card><CardContent className="p-4"><div className="text-xs text-muted-foreground">Affichées</div><div className="font-serif text-2xl font-bold">{financial.count}</div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="text-xs text-muted-foreground">Validées</div><div className="font-serif text-2xl font-bold">{financial.approvedCount}</div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="text-xs text-muted-foreground">CA validées</div><div className="font-serif text-2xl font-bold">{financial.ca.toLocaleString("fr-FR")} FCFA</div></CardContent></Card>
      </div>

      {/* Filtres rapides par statut (active uniquement) */}
      {view === "active" && (
        <div className="flex flex-wrap gap-2">
          <FilterChip label={`Toutes (${counts.all})`} active={filter === "all"} onClick={() => setFilter("all")} />
          {STATUSES.map((s) => (
            <FilterChip key={s.value} label={`${s.label} (${counts[s.value] ?? 0})`} active={filter === s.value} onClick={() => setFilter(s.value)} />
          ))}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative max-w-md flex-1 min-w-[260px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Rechercher par nom, email, téléphone, n° de reçu…" className="pl-9" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        {selected.size > 0 && (
          <div className="flex flex-wrap items-center gap-2 rounded-md border border-border bg-secondary/30 px-3 py-1.5">
            <span className="text-xs font-medium">{selected.size} sélectionnée(s)</span>
            {view === "active" ? (
              <Button size="sm" variant="outline" onClick={() => setArchiveOpen(true)}>
                <Archive className="mr-1.5 h-3.5 w-3.5" /> Archiver
              </Button>
            ) : (
              <Button size="sm" variant="outline" onClick={bulkUnarchive}>
                <ArchiveRestore className="mr-1.5 h-3.5 w-3.5" /> Restaurer
              </Button>
            )}
            <Button size="sm" variant="outline" onClick={bulkDelete} className="border-destructive text-destructive hover:bg-destructive/10">
              <Trash2 className="mr-1.5 h-3.5 w-3.5" /> Supprimer
            </Button>
            <Button size="sm" variant="ghost" onClick={clearSelection}>Annuler</Button>
          </div>
        )}
        {filtered.length > 0 && selected.size === 0 && (
          <Button size="sm" variant="ghost" onClick={() => selectAllVisible(filtered.map((f) => f.id))}>Tout sélectionner</Button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : filtered.length === 0 ? (
        <Card className="border-dashed border-border">
          <CardContent className="py-12 text-center text-sm text-muted-foreground">Aucune inscription correspondante.</CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filtered.map((a) => {
            const meta = statusMeta(a.status);
            const isSel = selected.has(a.id);
            return (
              <Card key={a.id} className={`border-border ${isSel ? "ring-2 ring-primary" : ""}`}>
                <CardContent className="p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex min-w-0 items-start gap-3">
                      <Checkbox checked={isSel} onCheckedChange={() => toggleSelect(a.id)} className="mt-1" />
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-serif text-lg font-bold">{a.full_name}</h3>
                          <Badge className={meta.className}>{meta.label}</Badge>
                          {a.archived && <Badge variant="outline">Archivée {a.archive_year ?? ""}</Badge>}
                          <span className="font-mono text-xs text-muted-foreground">{a.receipt_number}</span>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                          <span className="inline-flex items-center gap-1"><Phone className="h-3 w-3" /> {a.phone}</span>
                          <span className="inline-flex items-center gap-1"><Mail className="h-3 w-3" /> {a.email}</span>
                          <span className="inline-flex items-center gap-1"><Calendar className="h-3 w-3" /> Reçue le {new Date(a.created_at).toLocaleString("fr-FR")}</span>
                          {a.updated_at && a.updated_at !== a.created_at && (
                            <span className="inline-flex items-center gap-1"><Calendar className="h-3 w-3" /> MAJ {new Date(a.updated_at).toLocaleString("fr-FR")}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {!a.archived && (
                        <Select value={a.status} onValueChange={(v) => setStatus(a, v)}>
                          <SelectTrigger className="h-9 w-40"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {STATUSES.map((s) => (<SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>))}
                          </SelectContent>
                        </Select>
                      )}
                      <Button size="sm" variant="outline" onClick={() => openPreview(a)}>
                        <Eye className="mr-1.5 h-3.5 w-3.5" /> Aperçu
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => notifyWhatsApp(a)}>
                        <MessageCircle className="mr-1.5 h-3.5 w-3.5" /> WhatsApp
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => downloadReceipt(a)}>
                        <Download className="mr-1.5 h-3.5 w-3.5" /> PDF
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => remove(a)}>
                        <Trash2 className="h-3.5 w-3.5 text-destructive" />
                      </Button>
                    </div>
                  </div>
                  <div className="mt-3 grid gap-2 border-t border-border pt-3 text-sm sm:grid-cols-2">
                    <div>
                      <span className="text-xs uppercase tracking-wider text-muted-foreground">1er choix</span>
                      <div>{a.program_title ?? "—"} {a.program_level && <span className="text-muted-foreground">({a.program_level})</span>}</div>
                    </div>
                    <div>
                      <span className="text-xs uppercase tracking-wider text-muted-foreground">2ème choix</span>
                      <div>{a.program_title_2 ?? "—"} {a.program_level_2 && <span className="text-muted-foreground">({a.program_level_2})</span>}</div>
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

      {/* Preview PDF dialog */}
      <Dialog open={!!previewing} onOpenChange={(o) => { if (!o) closePreview(); }}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Prévisualisation du reçu — {previewing?.receipt_number}</DialogTitle>
          </DialogHeader>
          <div className="h-[70vh] w-full overflow-hidden rounded-md border border-border bg-secondary/20">
            {previewLoading ? (
              <div className="flex h-full items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
            ) : previewUrl ? (
              <iframe src={previewUrl} title="Aperçu reçu" className="h-full w-full" />
            ) : null}
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={closePreview}>Fermer</Button>
            {previewing && (
              <Button onClick={() => downloadReceipt(previewing)}>
                <Download className="mr-1.5 h-4 w-4" /> Télécharger
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Archive dialog */}
      <Dialog open={archiveOpen} onOpenChange={setArchiveOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Archiver {selected.size} inscription(s)</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">Sélectionnez l'année de l'archive (ex. promotion).</p>
            <Input type="number" value={archiveYear} onChange={(e) => setArchiveYear(e.target.value)} min={2000} max={3000} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setArchiveOpen(false)}>Annuler</Button>
            <Button onClick={bulkArchive}><Archive className="mr-1.5 h-4 w-4" /> Archiver</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reset dialog */}
      <Dialog open={resetOpen} onOpenChange={(o) => { setResetOpen(o); if (!o) setResetText(""); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-destructive">⚠️ Réinitialiser toutes les inscriptions</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 text-sm">
            <p>Cette action <strong>supprime définitivement toutes les inscriptions</strong> (actives et archivées). Idéal avant le lancement officiel.</p>
            <p className="text-muted-foreground">Pensez à exporter le rapport CSV avant si nécessaire.</p>
            <div>
              <label className="text-xs font-medium">Tapez <span className="font-mono">SUPPRIMER</span> pour confirmer :</label>
              <Input value={resetText} onChange={(e) => setResetText(e.target.value)} placeholder="SUPPRIMER" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setResetOpen(false)}>Annuler</Button>
            <Button onClick={resetAll} className="bg-destructive text-destructive-foreground hover:bg-destructive/90" disabled={resetText !== "SUPPRIMER"}>
              <Trash2 className="mr-1.5 h-4 w-4" /> Tout supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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
