import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { ArrowRight, GraduationCap, Users, Award, MessageCircle, BookOpen, Building2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SiteLayout } from "@/components/site/SiteLayout";
import { CtaBand } from "@/components/site/CtaBand";
import { whatsappLink } from "@/lib/contact";
import logo from "@/assets/esage-logo.jpg";
import heroImg from "@/assets/hero-classroom.jpg";
import studentsImg from "@/assets/students-group.jpg";
import gradImg from "@/assets/graduation.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ESAGE — École Supérieure d'Administration et de Gestion des Entreprises | Niamey" },
      { name: "description", content: "ESAGE forme les futurs cadres en administration, gestion, finance et marketing au Niger. BTS, Licence et Master. Travail – Rigueur – Succès." },
      { property: "og:title", content: "ESAGE — Travail, Rigueur, Succès" },
      { property: "og:description", content: "École supérieure d'administration et de gestion des entreprises à Niamey. BTS, Licence, Master." },
      { property: "og:image", content: heroImg },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: heroImg },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  return (
    <SiteLayout>
      {/* HERO */}
      <section className="relative isolate overflow-hidden">
        <img
          src={heroImg}
          alt="Étudiants en classe à ESAGE"
          width={1920}
          height={1280}
          className="absolute inset-0 -z-10 h-full w-full object-cover"
        />
        <div className="absolute inset-0 -z-10 bg-[image:var(--gradient-hero)]" />
        <div className="container mx-auto px-4 py-24 lg:px-8 lg:py-36">
          <div className="max-w-3xl text-primary-foreground">
            <div className="mb-6 inline-flex items-center gap-3 rounded-full bg-white/10 px-4 py-2 backdrop-blur">
              <img src={logo} alt="" width={28} height={28} className="h-7 w-7 rounded" />
              <span className="text-xs font-medium uppercase tracking-wider">École Supérieure depuis 20 ans</span>
            </div>
            <h1 className="font-serif text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
              Travail – Rigueur – Succès
            </h1>
            <p className="mt-4 text-lg text-primary-foreground/90 sm:text-xl">
              La réussite au bout de l'effort. Notre choix, notre assurance en l'avenir.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="bg-white text-primary hover:bg-white/90">
                <Link to="/admissions">
                  S'inscrire maintenant <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white bg-transparent text-white hover:bg-white hover:text-primary">
                <Link to="/formations">Découvrir nos formations</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* STRENGTHS */}
      <section className="container mx-auto px-4 py-20 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <div className="text-sm font-semibold uppercase tracking-widest text-primary">Pourquoi choisir ESAGE</div>
          <h2 className="mt-3 font-serif text-3xl font-bold sm:text-4xl">Une école de référence pour votre carrière</h2>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {[
            { icon: GraduationCap, title: "Formation professionnelle", desc: "Des programmes BTS, Licence et Master conçus pour répondre aux besoins réels des entreprises et de l'administration." },
            { icon: Users, title: "Enseignants expérimentés", desc: "Un corps professoral composé d'enseignants permanents et de professionnels en activité dans les entreprises." },
            { icon: Award, title: "Diplômes reconnus", desc: "Des diplômes d'État et internationaux qui ouvrent les portes des meilleures opportunités professionnelles." },
          ].map((s) => (
            <Card key={s.title} className="border-border shadow-[var(--shadow-card)] transition-all hover:-translate-y-1 hover:shadow-[var(--shadow-elegant)]">
              <CardContent className="p-8">
                <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-accent text-primary">
                  <s.icon className="h-6 w-6" />
                </div>
                <h3 className="font-serif text-xl font-bold">{s.title}</h3>
                <p className="mt-3 text-sm text-muted-foreground">{s.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* PROGRAMS PREVIEW */}
      <section className="bg-secondary/40 py-20">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex flex-col items-end justify-between gap-6 sm:flex-row">
            <div className="max-w-xl">
              <div className="text-sm font-semibold uppercase tracking-widest text-primary">Nos formations</div>
              <h2 className="mt-3 font-serif text-3xl font-bold sm:text-4xl">15+ filières en administration et gestion</h2>
              <p className="mt-4 text-muted-foreground">
                Du BTS d'État au Master, choisissez la voie qui correspond à votre projet professionnel.
              </p>
            </div>
            <Button asChild variant="outline">
              <Link to="/formations">Voir toutes les filières <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-2">
            <Card className="overflow-hidden border-border">
              <img src={studentsImg} alt="Étudiants ESAGE" loading="lazy" width={1280} height={896} className="h-56 w-full object-cover" />
              <CardContent className="p-8">
                <div className="inline-flex items-center gap-2 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-primary">
                  <BookOpen className="h-3 w-3" /> BTS d'État
                </div>
                <h3 className="mt-4 font-serif text-2xl font-bold">Brevet de Technicien Supérieur</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  6 filières professionnalisantes : Comptabilité, Finance Banque, Gestion Commerciale, Communication, Administration, Secrétariat de Direction.
                </p>
              </CardContent>
            </Card>
            <Card className="overflow-hidden border-border">
              <img src={gradImg} alt="Diplômés ESAGE" loading="lazy" width={1280} height={896} className="h-56 w-full object-cover" />
              <CardContent className="p-8">
                <div className="inline-flex items-center gap-2 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-primary">
                  <Sparkles className="h-3 w-3" /> Licence & Master
                </div>
                <h3 className="mt-4 font-serif text-2xl font-bold">Études supérieures</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  9 spécialisations : Finance Comptabilité, Marketing, GRH, Administration des Affaires, Fiscalité, Collectivités Territoriales et plus.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="container mx-auto px-4 py-20 lg:px-8">
        <div className="grid gap-8 rounded-2xl bg-primary p-10 text-primary-foreground sm:grid-cols-2 lg:grid-cols-4">
          {[
            { value: "20+", label: "Années d'expérience" },
            { value: "15+", label: "Filières proposées" },
            { value: "1000+", label: "Étudiants formés" },
            { value: "3", label: "Niveaux : BTS, Licence, Master" },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <div className="font-serif text-4xl font-bold sm:text-5xl">{s.value}</div>
              <div className="mt-2 text-sm text-primary-foreground/80">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="bg-secondary/40 py-20">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <div className="text-sm font-semibold uppercase tracking-widest text-primary">Témoignages</div>
            <h2 className="mt-3 font-serif text-3xl font-bold sm:text-4xl">Ce que disent nos étudiants</h2>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              { name: "Aïcha M.", role: "Diplômée Licence Marketing", quote: "ESAGE m'a donné les outils pour décrocher mon premier emploi avant même la fin de mes études." },
              { name: "Ibrahim S.", role: "BTS Finance Banque", quote: "Des enseignants disponibles, des cours pratiques. Je recommande vivement cette école." },
              { name: "Fatima O.", role: "Master GRH", quote: "Une formation rigoureuse qui m'a permis d'évoluer rapidement dans ma carrière professionnelle." },
            ].map((t) => (
              <Card key={t.name} className="border-border bg-background shadow-[var(--shadow-card)]">
                <CardContent className="p-8">
                  <div className="text-4xl text-primary/30">"</div>
                  <p className="mt-2 text-sm italic text-foreground/80">{t.quote}</p>
                  <div className="mt-6 border-t border-border pt-4">
                    <div className="font-semibold">{t.name}</div>
                    <div className="text-xs text-muted-foreground">{t.role}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* QUICK CONTACT */}
      <section className="container mx-auto px-4 py-20 lg:px-8">
        <div className="grid gap-8 md:grid-cols-2">
          <Card className="border-border">
            <CardContent className="flex flex-col items-start gap-4 p-8">
              <Building2 className="h-10 w-10 text-primary" />
              <h3 className="font-serif text-2xl font-bold">Visitez notre campus</h3>
              <p className="text-sm text-muted-foreground">
                2ème rond-point Wadata, route Filingué (vers Jangorzo), Niamey.
              </p>
              <Button asChild variant="outline">
                <Link to="/contact">Nous trouver</Link>
              </Button>
            </CardContent>
          </Card>
          <Card className="border-border bg-[var(--whatsapp)]/5">
            <CardContent className="flex flex-col items-start gap-4 p-8">
              <MessageCircle className="h-10 w-10 text-[var(--whatsapp)]" />
              <h3 className="font-serif text-2xl font-bold">Une question ? Écrivez-nous</h3>
              <p className="text-sm text-muted-foreground">
                Réponse rapide via WhatsApp pour toutes vos questions sur les formations et inscriptions.
              </p>
              <Button asChild className="bg-[var(--whatsapp)] text-white hover:opacity-90">
                <a href={whatsappLink("Bonjour ESAGE, j'ai une question.")} target="_blank" rel="noopener noreferrer">
                  Discuter sur WhatsApp
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      <CtaBand />
    </SiteLayout>
  );
}
