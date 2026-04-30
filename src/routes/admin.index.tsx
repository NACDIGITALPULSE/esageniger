import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import {
  BookOpen, Wallet, Image as ImageIcon, Users, Type, History, Inbox,
  TrendingUp, CheckCircle2, Clock, XCircle, FileEdit, Loader2,
} from "lucide-react";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, BarChart, Bar, Legend,
} from "recharts";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
});

type AppRow = {
  id: string;
  status: string;
  program_title: string | null;
  program_level: string | null;
  created_at: string;
  full_name: string;
  receipt_number: string;
};

const STATUS_META: Record<string, { label: string; color: string; icon: typeof Clock }> = {
  pending: { label: "En attente", color: "hsl(var(--muted-foreground))", icon: Clock },
  in_progress: { label: "En cours", color: "hsl(220 90% 56%)", icon: Loader2 },
  to_complete: { label: "À compléter", color: "hsl(38 92% 50%)", icon: FileEdit },
  approved: { label: "Validée", color: "hsl(142 71% 45%)", icon: CheckCircle2 },
  rejected: { label: "Refusée", color: "hsl(0 72% 51%)", icon: XCircle },
};

function AdminDashboard() {
  const [counts, setCounts] = useState({ programs: 0, tuition: 0, gallery: 0, team: 0, texts: 0, audit: 0 });
  const [apps, setApps] = useState<AppRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const tables = ["programs", "tuition_tiers", "gallery_items", "team_members", "site_texts", "audit_log"] as const;
      const [r1, r2, r3, r4, r5, r6, appsRes] = await Promise.all([
        ...tables.map((t) => supabase.from(t).select("*", { count: "exact", head: true })),
        supabase.from("applications").select("id,status,program_title,program_level,created_at,full_name,receipt_number").order("created_at", { ascending: false }),
      ]);
      setCounts({
        programs: r1.count ?? 0, tuition: r2.count ?? 0, gallery: r3.count ?? 0,
        team: r4.count ?? 0, texts: r5.count ?? 0, audit: r6.count ?? 0,
      });
      setApps((appsRes.data as AppRow[]) ?? []);
      setLoading(false);
    }
    load();
    const ch = supabase.channel("admin-dashboard")
      .on("postgres_changes", { event: "*", schema: "public", table: "applications" }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  // ===== KPIs =====
  const totalApps = apps.length;
  const validated = apps.filter((a) => a.status === "approved").length;
  const pending = apps.filter((a) => a.status === "pending" || a.status === "in_progress" || a.status === "to_complete").length;
  const rejected = apps.filter((a) => a.status === "rejected").length;
  const conversionRate = totalApps > 0 ? Math.round((validated / totalApps) * 100) : 0;

  // ===== Évolution mensuelle (12 derniers mois) =====
  const monthlyData = useMemo(() => {
    const now = new Date();
    const months: { key: string; label: string; total: number; validees: number }[] = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      months.push({ key, label: d.toLocaleDateString("fr-FR", { month: "short" }), total: 0, validees: 0 });
    }
    apps.forEach((a) => {
      const d = new Date(a.created_at);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const m = months.find((x) => x.key === key);
      if (m) {
        m.total += 1;
        if (a.status === "approved") m.validees += 1;
      }
    });
    return months;
  }, [apps]);

  // ===== Répartition par statut =====
  const statusData = useMemo(() => {
    const map: Record<string, number> = {};
    apps.forEach((a) => { map[a.status] = (map[a.status] ?? 0) + 1; });
    return Object.entries(map).map(([status, count]) => ({
      name: STATUS_META[status]?.label ?? status,
      value: count,
      color: STATUS_META[status]?.color ?? "hsl(var(--muted-foreground))",
    }));
  }, [apps]);

  // ===== Top programmes =====
  const programData = useMemo(() => {
    const map: Record<string, number> = {};
    apps.forEach((a) => {
      const key = a.program_title ?? "Non spécifié";
      map[key] = (map[key] ?? 0) + 1;
    });
    return Object.entries(map)
      .map(([name, count]) => ({ name: name.length > 22 ? name.slice(0, 22) + "…" : name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
  }, [apps]);

  const recentApps = apps.slice(0, 6);

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-3xl font-bold">Tableau de bord</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Vue d'ensemble en temps réel des inscriptions et du contenu du site.
        </p>
      </div>

      {/* KPIs principaux */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Total inscriptions" value={totalApps} icon={Inbox} accent="bg-primary/10 text-primary" />
        <KpiCard label="En traitement" value={pending} icon={Clock} accent="bg-amber-500/10 text-amber-600" />
        <KpiCard label="Validées" value={validated} icon={CheckCircle2} accent="bg-emerald-500/10 text-emerald-600" />
        <KpiCard label="Taux de conversion" value={`${conversionRate}%`} icon={TrendingUp} accent="bg-blue-500/10 text-blue-600" />
      </div>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="border-border lg:col-span-2">
          <CardHeader><CardTitle className="text-base">Évolution sur 12 mois</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id="gTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="label" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} allowDecimals={false} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                <Area type="monotone" dataKey="total" stroke="hsl(var(--primary))" fill="url(#gTotal)" name="Total" />
                <Area type="monotone" dataKey="validees" stroke="hsl(142 71% 45%)" fill="hsl(142 71% 45% / 0.15)" name="Validées" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader><CardTitle className="text-base">Répartition par statut</CardTitle></CardHeader>
          <CardContent>
            {statusData.length === 0 ? (
              <p className="py-12 text-center text-sm text-muted-foreground">Aucune donnée</p>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={45} paddingAngle={2}>
                    {statusData.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border-border">
          <CardHeader><CardTitle className="text-base">Top programmes demandés</CardTitle></CardHeader>
          <CardContent>
            {programData.length === 0 ? (
              <p className="py-12 text-center text-sm text-muted-foreground">Aucune donnée</p>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={programData} layout="vertical" margin={{ left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={11} allowDecimals={false} />
                  <YAxis type="category" dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={11} width={140} />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader><CardTitle className="text-base">Activité récente</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {recentApps.length === 0 ? (
              <p className="py-12 text-center text-sm text-muted-foreground">Aucune inscription récente</p>
            ) : recentApps.map((a) => {
              const meta = STATUS_META[a.status];
              return (
                <Link key={a.id} to="/admin/applications" className="flex items-center justify-between rounded-md border border-border p-3 transition hover:bg-accent">
                  <div className="min-w-0">
                    <div className="truncate font-medium">{a.full_name}</div>
                    <div className="truncate text-xs text-muted-foreground">{a.program_title ?? "Sans programme"} · {new Date(a.created_at).toLocaleDateString("fr-FR")}</div>
                  </div>
                  <Badge variant="outline" style={{ borderColor: meta?.color, color: meta?.color }}>
                    {meta?.label ?? a.status}
                  </Badge>
                </Link>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* Liens rapides contenu */}
      <div>
        <h2 className="mb-3 font-serif text-lg font-bold">Gestion du contenu</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { to: "/admin/programs", label: "Programmes", value: counts.programs, icon: BookOpen },
            { to: "/admin/tuition", label: "Frais de scolarité", value: counts.tuition, icon: Wallet },
            { to: "/admin/gallery", label: "Images de la galerie", value: counts.gallery, icon: ImageIcon },
            { to: "/admin/team", label: "Membres d'équipe", value: counts.team, icon: Users },
            { to: "/admin/texts", label: "Textes du site", value: counts.texts, icon: Type },
            { to: "/admin/audit", label: "Journal d'audit", value: counts.audit, icon: History },
          ].map((c) => {
            const Icon = c.icon;
            return (
              <Link key={c.to} to={c.to}>
                <Card className="border-border transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-elegant)]">
                  <CardContent className="flex items-center gap-4 p-4">
                    <div className="rounded-lg bg-primary/10 p-2.5 text-primary"><Icon className="h-5 w-5" /></div>
                    <div>
                      <div className="text-xl font-bold">{c.value}</div>
                      <div className="text-xs uppercase tracking-wider text-muted-foreground">{c.label}</div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function KpiCard({ label, value, icon: Icon, accent }: { label: string; value: number | string; icon: typeof Inbox; accent: string }) {
  return (
    <Card className="border-border">
      <CardContent className="flex items-center gap-4 p-5">
        <div className={`rounded-lg p-3 ${accent}`}><Icon className="h-6 w-6" /></div>
        <div>
          <div className="text-2xl font-bold">{value}</div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
        </div>
      </CardContent>
    </Card>
  );
}
