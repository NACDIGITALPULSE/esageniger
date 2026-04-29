import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SiteLayout } from "@/components/site/SiteLayout";
import { CtaBand } from "@/components/site/CtaBand";
import { ArrowRight, GraduationCap, BookOpen, Loader2 } from "lucide-react";
import { useRealtimeTable } from "@/lib/use-realtime-table";

export const Route = createFileRoute("/formations")({
  head: () => ({
    meta: [
      { title: "Formations ESAGE — BTS, Licence et Master en administration et gestion" },
      { name: "description", content: "Découvrez les filières d'ESAGE : 6 BTS d'État et 9 spécialisations Licence/Master en finance, gestion, marketing, GRH, fiscalité et administration." },
      { property: "og:title", content: "Nos formations — ESAGE" },
      { property: "og:description", content: "BTS, Licence et Master en administration, gestion, finance et marketing." },
    ],
  }),
  component: ProgramsPage,
});

type DBProgram = {
  id: string;
  slug: string;
  level: string;
  title: string;
  description: string;
  display_order: number;
  is_visible: boolean;
};

function ProgramCard({ p }: { p: DBProgram }) {
  return (
    <Card className="flex h-full flex-col border-border transition-all hover-lift">
      <CardContent className="flex flex-1 flex-col p-6">
        <div className="inline-flex w-fit items-center gap-1.5 rounded-full bg-accent px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-primary">
          {p.level === "BTS" ? <BookOpen className="h-3 w-3" /> : <GraduationCap className="h-3 w-3" />}
          {p.level}
        </div>
        <h3 className="mt-4 font-serif text-lg font-bold leading-snug">{p.title}</h3>
        <p className="mt-2 flex-1 text-sm text-muted-foreground">{p.description}</p>
        <Button asChild variant="outline" size="sm" className="mt-5 w-fit">
          <Link to="/admissions" search={{ programme: p.slug }}>
            Postuler <ArrowRight className="ml-1 h-3 w-3" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

function ProgramsPage() {
  const { data, loading } = useRealtimeTable<DBProgram>("programs");
  const visible = data.filter((p) => p.is_visible);
  const bts = visible.filter((p) => p.level === "BTS");
  const lm = visible.filter((p) => p.level !== "BTS");

  return (
    <SiteLayout>
      <section className="bg-primary py-20 text-primary-foreground">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-sm font-semibold uppercase tracking-widest text-primary-foreground/70">Formations</div>
          <h1 className="mt-3 font-serif text-4xl font-bold sm:text-5xl">Nos filières de formation</h1>
          <p className="mt-4 max-w-2xl text-lg text-primary-foreground/90">
            Du BTS d'État au Master, choisissez la formation qui correspond à votre ambition professionnelle.
          </p>
        </div>
      </section>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : (
        <>
          <section className="container mx-auto px-4 py-20 lg:px-8">
            <div className="mb-10 flex items-center gap-3">
              <BookOpen className="h-7 w-7 text-primary" />
              <div>
                <h2 className="font-serif text-3xl font-bold">BTS d'État</h2>
                <p className="text-sm text-muted-foreground">Brevet de Technicien Supérieur — 2 ans après le BAC</p>
              </div>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {bts.map((p) => <ProgramCard key={p.id} p={p} />)}
            </div>
          </section>

          <section className="bg-secondary/40 py-20">
            <div className="container mx-auto px-4 lg:px-8">
              <div className="mb-10 flex items-center gap-3">
                <GraduationCap className="h-7 w-7 text-primary" />
                <div>
                  <h2 className="font-serif text-3xl font-bold">Licence & Master</h2>
                  <p className="text-sm text-muted-foreground">Études supérieures spécialisées</p>
                </div>
              </div>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {lm.map((p) => <ProgramCard key={p.id} p={p} />)}
              </div>
            </div>
          </section>
        </>
      )}

      <CtaBand title="Une filière vous intéresse ?" subtitle="Postulez en quelques minutes via notre formulaire d'inscription rapide." />
    </SiteLayout>
  );
}
