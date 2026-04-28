import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { BookOpen, Wallet, Image as ImageIcon, Users, Type, History } from "lucide-react";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
});

function AdminDashboard() {
  const [counts, setCounts] = useState({ programs: 0, tuition: 0, gallery: 0, team: 0, texts: 0, audit: 0 });

  useEffect(() => {
    async function load() {
      const tables = ["programs", "tuition_tiers", "gallery_items", "team_members", "site_texts", "audit_log"] as const;
      const results = await Promise.all(
        tables.map((t) => supabase.from(t).select("*", { count: "exact", head: true }))
      );
      setCounts({
        programs: results[0].count ?? 0,
        tuition: results[1].count ?? 0,
        gallery: results[2].count ?? 0,
        team: results[3].count ?? 0,
        texts: results[4].count ?? 0,
        audit: results[5].count ?? 0,
      });
    }
    load();
  }, []);

  const cards = [
    { to: "/admin/programs", label: "Programmes", value: counts.programs, icon: BookOpen },
    { to: "/admin/tuition", label: "Paliers de frais", value: counts.tuition, icon: Wallet },
    { to: "/admin/gallery", label: "Images de la galerie", value: counts.gallery, icon: ImageIcon },
    { to: "/admin/team", label: "Membres d'équipe", value: counts.team, icon: Users },
    { to: "/admin/texts", label: "Textes éditables", value: counts.texts, icon: Type },
    { to: "/admin/audit", label: "Entrées du journal", value: counts.audit, icon: History },
  ] as const;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-bold">Tableau de bord</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Bienvenue. Sélectionnez une section pour modifier le contenu du site.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <Link key={c.to} to={c.to}>
              <Card className="border-border transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-elegant)]">
                <CardContent className="flex items-center gap-4 p-5">
                  <div className="rounded-lg bg-primary/10 p-3 text-primary">
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{c.value}</div>
                    <div className="text-xs uppercase tracking-wider text-muted-foreground">{c.label}</div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
