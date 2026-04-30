import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { FAQBlock } from "@/components/site/FAQBlock";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "FAQ ESAGE — Questions fréquentes sur les admissions et frais" },
      { name: "description", content: "Toutes les réponses aux questions fréquentes sur les admissions, les frais de scolarité, les pièces à fournir et les délais de traitement à ESAGE." },
      { property: "og:title", content: "FAQ ESAGE" },
      { property: "og:description", content: "Admissions, frais, pièces à fournir, délais — toutes les réponses utiles pour rejoindre ESAGE." },
    ],
  }),
  component: FAQPage,
});

function FAQPage() {
  return (
    <SiteLayout>
      <section className="bg-primary py-20 text-primary-foreground">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-sm font-semibold uppercase tracking-widest text-primary-foreground/70">Aide</div>
          <h1 className="mt-3 font-serif text-4xl font-bold sm:text-5xl">Questions fréquentes</h1>
          <p className="mt-4 max-w-2xl text-lg text-primary-foreground/90">
            Admissions, frais de scolarité, pièces à fournir, délais — retrouvez ici les réponses aux questions les plus posées.
          </p>
        </div>
      </section>

      <FAQBlock title="Toutes nos réponses" subtitle="Si vous ne trouvez pas votre réponse, contactez-nous directement." />
    </SiteLayout>
  );
}
