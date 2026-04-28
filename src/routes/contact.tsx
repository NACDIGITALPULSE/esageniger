import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SiteLayout } from "@/components/site/SiteLayout";
import { ESAGE, whatsappLink } from "@/lib/contact";
import { MapPin, Phone, Mail, Clock, MessageCircle } from "lucide-react";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact ESAGE — Adresse, téléphone, email" },
      { name: "description", content: "Contactez ESAGE à Niamey : 2ème rond-point Wadata, route Filingué. Téléphone, email et WhatsApp." },
      { property: "og:title", content: "Contact — ESAGE" },
      { property: "og:description", content: "Joignez-nous à Niamey : adresse, téléphone, email, WhatsApp." },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  return (
    <SiteLayout>
      <section className="bg-primary py-20 text-primary-foreground">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-sm font-semibold uppercase tracking-widest text-primary-foreground/70">Contact</div>
          <h1 className="mt-3 font-serif text-4xl font-bold sm:text-5xl">Nous contacter</h1>
          <p className="mt-4 max-w-2xl text-lg text-primary-foreground/90">
            Notre équipe est à votre écoute pour toute question sur les formations, l'admission ou la vie étudiante.
          </p>
        </div>
      </section>

      <section className="container mx-auto px-4 py-20 lg:px-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-border">
            <CardContent className="p-6">
              <MapPin className="h-7 w-7 text-primary" />
              <h3 className="mt-4 font-serif text-lg font-bold">Adresse</h3>
              <p className="mt-2 text-sm text-muted-foreground">{ESAGE.address}</p>
            </CardContent>
          </Card>
          <Card className="border-border">
            <CardContent className="p-6">
              <Phone className="h-7 w-7 text-primary" />
              <h3 className="mt-4 font-serif text-lg font-bold">Téléphone</h3>
              <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                {ESAGE.phones.map((p) => (
                  <li key={p}>
                    <a href={`tel:${p.replace(/\s/g, "")}`} className="hover:text-primary">{p}</a>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
          <Card className="border-border">
            <CardContent className="p-6">
              <Mail className="h-7 w-7 text-primary" />
              <h3 className="mt-4 font-serif text-lg font-bold">Email</h3>
              <a href={`mailto:${ESAGE.email}`} className="mt-2 block break-all text-sm text-muted-foreground hover:text-primary">
                {ESAGE.email}
              </a>
            </CardContent>
          </Card>
          <Card className="border-border">
            <CardContent className="p-6">
              <Clock className="h-7 w-7 text-primary" />
              <h3 className="mt-4 font-serif text-lg font-bold">Horaires</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Lundi – Vendredi<br />8h00 – 18h00<br />Samedi : 9h00 – 13h00
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 overflow-hidden rounded-2xl border border-border shadow-[var(--shadow-card)]">
            <iframe
              title="Carte ESAGE — Niamey"
              src="https://www.google.com/maps?q=2eme+rond-point+Wadata+route+Filingue+Niamey&output=embed"
              className="h-[420px] w-full"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
          <Card className="border-border bg-[var(--whatsapp)]/5">
            <CardContent className="flex h-full flex-col gap-4 p-8">
              <MessageCircle className="h-10 w-10 text-[var(--whatsapp)]" />
              <h3 className="font-serif text-2xl font-bold">Discutons sur WhatsApp</h3>
              <p className="text-sm text-muted-foreground">
                Pour une réponse rapide, contactez-nous directement sur WhatsApp. Nous répondons généralement en moins d'une heure.
              </p>
              <Button asChild className="mt-auto bg-[var(--whatsapp)] text-white hover:opacity-90">
                <a href={whatsappLink("Bonjour ESAGE, je souhaite des informations.")} target="_blank" rel="noopener noreferrer">
                  Envoyer un message
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </SiteLayout>
  );
}
