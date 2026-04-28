import { createFileRoute, Link } from "@tanstack/react-router";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SiteLayout } from "@/components/site/SiteLayout";
import { CtaBand } from "@/components/site/CtaBand";
import { Check } from "lucide-react";

export const Route = createFileRoute("/frais")({
  head: () => ({
    meta: [
      { title: "Frais de scolarité ESAGE — BTS, Licence, Master" },
      { name: "description", content: "Tarifs ESAGE : BTS 350 000 FCFA, Licence 450 000 FCFA, Master 700 000 FCFA. Frais d'inscription 10 000 FCFA. Paiement en 3 tranches." },
      { property: "og:title", content: "Frais de scolarité — ESAGE" },
      { property: "og:description", content: "Tarifs accessibles, paiement en 3 tranches." },
    ],
  }),
  component: TuitionPage,
});

const tiers = [
  {
    title: "BTS",
    price: "350 000",
    duration: "2 ans",
    desc: "Brevet de Technicien Supérieur",
    items: ["Diplôme d'État reconnu", "6 spécialisations au choix", "Cours du jour ou du soir"],
    highlight: false,
  },
  {
    title: "Licence",
    price: "450 000",
    duration: "3 ans",
    desc: "Études supérieures",
    items: ["9 spécialisations", "Encadrement personnalisé", "Stages en entreprise"],
    highlight: true,
  },
  {
    title: "Master",
    price: "700 000",
    duration: "2 ans après Licence",
    desc: "Spécialisation avancée",
    items: ["Mémoire de fin d'études", "Professeurs experts", "Réseau professionnel"],
    highlight: false,
  },
];

function TuitionPage() {
  return (
    <SiteLayout>
      <section className="bg-primary py-20 text-primary-foreground">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-sm font-semibold uppercase tracking-widest text-primary-foreground/70">Frais</div>
          <h1 className="mt-3 font-serif text-4xl font-bold sm:text-5xl">Frais de scolarité</h1>
          <p className="mt-4 max-w-2xl text-lg text-primary-foreground/90">
            Une formation de qualité accessible, avec un paiement échelonné en 3 tranches.
          </p>
        </div>
      </section>

      <section className="container mx-auto px-4 py-20 lg:px-8">
        <div className="grid gap-6 md:grid-cols-3">
          {tiers.map((t) => (
            <Card key={t.title} className={`relative border-border ${t.highlight ? "border-primary shadow-[var(--shadow-elegant)] ring-1 ring-primary" : ""}`}>
              {t.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-primary-foreground">
                  Le plus choisi
                </div>
              )}
              <CardContent className="p-8">
                <div className="text-sm font-semibold uppercase tracking-widest text-primary">{t.title}</div>
                <div className="mt-1 text-xs text-muted-foreground">{t.desc}</div>
                <div className="mt-6">
                  <span className="font-serif text-4xl font-bold">{t.price}</span>
                  <span className="ml-1 text-sm text-muted-foreground">FCFA / an</span>
                </div>
                <div className="mt-1 text-xs text-muted-foreground">Durée : {t.duration}</div>
                <ul className="mt-6 space-y-2">
                  {t.items.map((i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <span>{i}</span>
                    </li>
                  ))}
                </ul>
                <Button asChild className="mt-8 w-full">
                  <Link to="/admissions">S'inscrire</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mx-auto mt-12 max-w-3xl rounded-2xl bg-secondary/60 p-8 text-center">
          <div className="text-sm font-semibold uppercase tracking-widest text-primary">Frais d'inscription</div>
          <div className="mt-2 font-serif text-3xl font-bold">10 000 FCFA</div>
          <p className="mt-3 text-sm text-muted-foreground">
            Frais d'inscription unique, à régler au dépôt du dossier. Le paiement de la scolarité peut se faire
            en <strong className="text-foreground">3 tranches</strong> sans surcoût.
          </p>
        </div>
      </section>

      <CtaBand title="Prêt à démarrer votre formation ?" subtitle="Inscrivez-vous dès maintenant et bénéficiez d'un suivi personnalisé." />
    </SiteLayout>
  );
}
