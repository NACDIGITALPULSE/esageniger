import { createFileRoute } from "@tanstack/react-router";
import { Target, Users2, Lightbulb, BookOpenCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { SiteLayout } from "@/components/site/SiteLayout";
import { CtaBand } from "@/components/site/CtaBand";
import campusImg from "@/assets/campus-building.jpg";
import profImg from "@/assets/professor-teaching.jpg";

export const Route = createFileRoute("/a-propos")({
  head: () => ({
    meta: [
      { title: "À propos d'ESAGE — Notre mission et nos valeurs" },
      { name: "description", content: "Découvrez ESAGE, école professionnelle d'administration et de gestion à Niamey : formation initiale, formation continue, séminaires et renforcement des capacités." },
      { property: "og:title", content: "À propos d'ESAGE" },
      { property: "og:description", content: "École professionnelle d'administration et de gestion à Niamey, Niger." },
      { property: "og:image", content: campusImg },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <SiteLayout>
      <section className="relative isolate overflow-hidden bg-primary py-24 text-primary-foreground">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-3xl">
            <div className="text-sm font-semibold uppercase tracking-widest text-primary-foreground/70">À propos</div>
            <h1 className="mt-3 font-serif text-4xl font-bold sm:text-5xl">
              Former les leaders de demain en administration et gestion
            </h1>
            <p className="mt-4 text-lg text-primary-foreground/90">
              Depuis plus de 15 ans, ESAGE accompagne les étudiants et professionnels du Niger vers la réussite.
            </p>
          </div>
        </div>
      </section>

      <section className="container mx-auto grid gap-12 px-4 py-20 lg:grid-cols-2 lg:px-8">
        <div>
          <div className="text-sm font-semibold uppercase tracking-widest text-primary">Notre mission</div>
          <h2 className="mt-3 font-serif text-3xl font-bold">Une école professionnelle au service du développement</h2>
          <p className="mt-6 text-muted-foreground">
            ESAGE — École Supérieure d'Administration et de Gestion des Entreprises — est une institution
            d'enseignement supérieur privée basée à Niamey. Nous formons des cadres compétents en
            administration, gestion, finance, marketing et ressources humaines.
          </p>
          <p className="mt-4 text-muted-foreground">
            Notre approche pédagogique combine théorie académique solide et pratique professionnelle, afin
            que chaque diplômé soit immédiatement opérationnel sur le marché du travail nigérien et international.
          </p>
        </div>
        <div className="grid gap-4">
          <img src={campusImg} alt="Campus ESAGE" loading="lazy" width={1280} height={896} className="h-64 w-full rounded-xl object-cover shadow-[var(--shadow-card)]" />
          <img src={profImg} alt="Cours à ESAGE" loading="lazy" width={1280} height={896} className="h-64 w-full rounded-xl object-cover shadow-[var(--shadow-card)]" />
        </div>
      </section>

      <section className="bg-secondary/40 py-20">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-serif text-3xl font-bold">Nos domaines d'intervention</h2>
            <p className="mt-3 text-muted-foreground">Une offre complète pour étudiants et professionnels.</p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: BookOpenCheck, title: "Formation initiale", desc: "BTS, Licence et Master en administration et gestion." },
              { icon: Users2, title: "Formation continue", desc: "Cours du jour et du soir pour les actifs souhaitant évoluer." },
              { icon: Lightbulb, title: "Séminaires & ateliers", desc: "Sessions thématiques animées par des experts du secteur." },
              { icon: Target, title: "Renforcement de capacités", desc: "Programmes sur mesure pour les acteurs économiques et sociaux." },
            ].map((b) => (
              <Card key={b.title} className="border-border bg-background">
                <CardContent className="p-6">
                  <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-lg bg-accent text-primary">
                    <b.icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-serif text-lg font-bold">{b.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{b.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-20 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <div className="text-sm font-semibold uppercase tracking-widest text-primary">Nos valeurs</div>
          <h2 className="mt-3 font-serif text-3xl font-bold">Travail – Rigueur – Succès</h2>
          <p className="mt-6 text-muted-foreground">
            Notre devise n'est pas un slogan, c'est notre engagement quotidien envers chaque étudiant.
            La réussite au bout de l'effort : c'est notre choix, notre assurance en l'avenir.
          </p>
        </div>
      </section>

      <CtaBand />
    </SiteLayout>
  );
}
