import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent } from "@/components/ui/card";
import { SiteLayout } from "@/components/site/SiteLayout";
import { CtaBand } from "@/components/site/CtaBand";
import { Briefcase, GraduationCap, Award } from "lucide-react";
import profImg from "@/assets/professor-teaching.jpg";

export const Route = createFileRoute("/equipe")({
  head: () => ({
    meta: [
      { title: "Notre équipe — Direction et corps enseignant ESAGE" },
      { name: "description", content: "Une direction expérimentée et un corps enseignant composé de professionnels en activité et d'enseignants permanents." },
      { property: "og:title", content: "L'équipe ESAGE" },
      { property: "og:description", content: "Direction, enseignants et professionnels au service de votre réussite." },
      { property: "og:image", content: profImg },
    ],
  }),
  component: TeamPage,
});

function TeamPage() {
  return (
    <SiteLayout>
      <section className="bg-primary py-20 text-primary-foreground">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-sm font-semibold uppercase tracking-widest text-primary-foreground/70">L'équipe</div>
          <h1 className="mt-3 font-serif text-4xl font-bold sm:text-5xl">Une équipe d'expérience à votre service</h1>
          <p className="mt-4 max-w-2xl text-lg text-primary-foreground/90">
            Direction expérimentée, enseignants permanents et professionnels en activité.
          </p>
        </div>
      </section>

      <section className="container mx-auto grid gap-12 px-4 py-20 lg:grid-cols-2 lg:px-8">
        <div>
          <div className="text-sm font-semibold uppercase tracking-widest text-primary">Direction</div>
          <h2 className="mt-3 font-serif text-3xl font-bold">Une directrice avec plus de 20 ans d'expérience</h2>
          <p className="mt-6 text-muted-foreground">
            La direction d'ESAGE est assurée par une professionnelle ayant exercé dans des institutions de
            référence comme l'ENAM (École Nationale d'Administration et de Magistrature). Forte de plus de
            vingt années d'expertise en gestion administrative et en formation professionnelle, elle imprime
            à l'école une exigence d'excellence quotidienne.
          </p>
          <div className="mt-6 grid gap-3 text-sm">
            <div className="flex items-center gap-3"><Award className="h-5 w-5 text-primary" /> 20+ ans d'expérience</div>
            <div className="flex items-center gap-3"><Briefcase className="h-5 w-5 text-primary" /> Expérience en institutions publiques</div>
            <div className="flex items-center gap-3"><GraduationCap className="h-5 w-5 text-primary" /> Expertise en formation professionnelle</div>
          </div>
        </div>
        <img src={profImg} alt="Direction ESAGE" loading="lazy" width={1280} height={896} className="h-full max-h-[480px] w-full rounded-2xl object-cover shadow-[var(--shadow-elegant)]" />
      </section>

      <section className="bg-secondary/40 py-20">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-serif text-3xl font-bold">Corps enseignant</h2>
            <p className="mt-3 text-muted-foreground">
              Un équilibre entre académiciens et professionnels en activité pour garantir la qualité et la pertinence de l'enseignement.
            </p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              { title: "Enseignants permanents", desc: "Une équipe pédagogique stable et engagée, garante de la cohérence des programmes." },
              { title: "Vacataires expérimentés", desc: "Des spécialistes intervenant régulièrement pour apporter leur expertise sectorielle." },
              { title: "Professionnels en activité", desc: "Cadres et dirigeants d'entreprises qui partagent leur expérience du terrain avec les étudiants." },
            ].map((t) => (
              <Card key={t.title} className="border-border bg-background">
                <CardContent className="p-8">
                  <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-lg bg-accent text-primary">
                    <GraduationCap className="h-5 w-5" />
                  </div>
                  <h3 className="font-serif text-lg font-bold">{t.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{t.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <CtaBand />
    </SiteLayout>
  );
}
