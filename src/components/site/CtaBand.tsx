import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { ArrowRight, MessageCircle } from "lucide-react";
import { whatsappLink } from "@/lib/contact";

export function CtaBand({ title, subtitle }: { title?: string; subtitle?: string }) {
  return (
    <section className="bg-gradient-to-br from-primary to-[color:var(--primary-glow)] py-16 text-primary-foreground">
      <div className="container mx-auto flex flex-col items-center gap-6 px-4 text-center lg:px-8">
        <h2 className="font-serif text-3xl font-bold sm:text-4xl">
          {title ?? "Prêt à construire votre avenir ?"}
        </h2>
        <p className="max-w-2xl text-base text-primary-foreground/90 sm:text-lg">
          {subtitle ?? "Rejoignez ESAGE et bénéficiez d'une formation reconnue, encadrée par des enseignants expérimentés."}
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button asChild size="lg" variant="secondary" className="bg-white text-primary hover:bg-white/90">
            <Link to="/admissions">
              S'inscrire maintenant <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="border-white bg-transparent text-white hover:bg-white hover:text-primary">
            <a href={whatsappLink("Bonjour ESAGE, je souhaite m'inscrire.")} target="_blank" rel="noopener noreferrer">
              <MessageCircle className="mr-2 h-4 w-4" /> Nous écrire
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
}
