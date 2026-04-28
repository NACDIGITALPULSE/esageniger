import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SiteLayout } from "@/components/site/SiteLayout";
import { allPrograms, btsPrograms, licenceMasterPrograms } from "@/data/programs";
import { whatsappLink, ESAGE } from "@/lib/contact";
import { CheckCircle2, FileText, MessageCircle } from "lucide-react";

const searchSchema = z.object({
  programme: z.string().optional(),
});

export const Route = createFileRoute("/admissions")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Admissions ESAGE — Inscrivez-vous en ligne" },
      { name: "description", content: "Inscrivez-vous à ESAGE : pièces à fournir pour BTS, Licence et Master, et formulaire d'inscription rapide via WhatsApp." },
      { property: "og:title", content: "Admissions — ESAGE" },
      { property: "og:description", content: "Pièces à fournir et formulaire d'inscription rapide." },
    ],
  }),
  component: AdmissionsPage,
});

const formSchema = z.object({
  nom: z.string().trim().min(2, "Nom requis").max(100),
  telephone: z.string().trim().min(6, "Téléphone requis").max(30),
  email: z.string().trim().email("Email invalide").max(150),
  programme: z.string().min(1, "Sélectionnez une filière"),
  message: z.string().trim().max(500).optional(),
});

function AdmissionsPage() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [programme, setProgramme] = useState<string>(search.programme ?? "");

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const data = {
      nom: String(fd.get("nom") ?? ""),
      telephone: String(fd.get("telephone") ?? ""),
      email: String(fd.get("email") ?? ""),
      programme,
      message: String(fd.get("message") ?? ""),
    };
    const parsed = formSchema.safeParse(data);
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      for (const issue of parsed.error.issues) errs[String(issue.path[0])] = issue.message;
      setErrors(errs);
      return;
    }
    setErrors({});
    const prog = allPrograms.find((p) => p.id === parsed.data.programme);
    const text = `Bonjour ESAGE, je souhaite m'inscrire.\n\nNom : ${parsed.data.nom}\nTéléphone : ${parsed.data.telephone}\nEmail : ${parsed.data.email}\nFilière : ${prog ? `${prog.title} (${prog.level})` : parsed.data.programme}${parsed.data.message ? `\nMessage : ${parsed.data.message}` : ""}`;
    window.open(whatsappLink(text), "_blank", "noopener,noreferrer");
    navigate({ to: "/admissions" });
  }

  return (
    <SiteLayout>
      <section className="bg-primary py-20 text-primary-foreground">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-sm font-semibold uppercase tracking-widest text-primary-foreground/70">Admissions</div>
          <h1 className="mt-3 font-serif text-4xl font-bold sm:text-5xl">Rejoignez ESAGE</h1>
          <p className="mt-4 max-w-2xl text-lg text-primary-foreground/90">
            Préparez votre dossier et déposez votre candidature en quelques minutes.
          </p>
        </div>
      </section>

      <section className="container mx-auto px-4 py-20 lg:px-8">
        <div className="grid gap-8 md:grid-cols-2">
          {[
            {
              title: "Pièces à fournir — BTS",
              items: [
                "Acte de naissance légalisé",
                "Copie légalisée du diplôme (BAC ou équivalent)",
                "4 photos d'identité",
                "4 enveloppes timbrées",
              ],
            },
            {
              title: "Pièces à fournir — Licence & Master",
              items: [
                "Copie légalisée du BTS / Licence / Master",
                "Acte de naissance légalisé",
                "4 photos d'identité",
                "4 enveloppes timbrées",
              ],
            },
          ].map((b) => (
            <Card key={b.title} className="border-border">
              <CardContent className="p-8">
                <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-lg bg-accent text-primary">
                  <FileText className="h-5 w-5" />
                </div>
                <h2 className="font-serif text-2xl font-bold">{b.title}</h2>
                <ul className="mt-4 space-y-2">
                  {b.items.map((i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <span>{i}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="bg-secondary/40 py-20">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <div className="text-sm font-semibold uppercase tracking-widest text-primary">Inscription rapide</div>
            <h2 className="mt-3 font-serif text-3xl font-bold">Formulaire d'inscription</h2>
            <p className="mt-3 text-muted-foreground">
              Remplissez le formulaire — vos informations seront envoyées à notre équipe via WhatsApp pour un suivi immédiat.
            </p>
          </div>

          <Card className="mx-auto mt-10 max-w-2xl border-border bg-background">
            <CardContent className="p-8">
              <form onSubmit={onSubmit} className="grid gap-5">
                <div className="grid gap-2">
                  <Label htmlFor="nom">Nom complet *</Label>
                  <Input id="nom" name="nom" required placeholder="Ex. Aminata Diallo" />
                  {errors.nom && <p className="text-xs text-destructive">{errors.nom}</p>}
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="telephone">Téléphone *</Label>
                    <Input id="telephone" name="telephone" required placeholder="+227 ..." />
                    {errors.telephone && <p className="text-xs text-destructive">{errors.telephone}</p>}
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input id="email" name="email" type="email" required placeholder="vous@exemple.com" />
                    {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="programme">Filière souhaitée *</Label>
                  <Select value={programme} onValueChange={setProgramme}>
                    <SelectTrigger id="programme">
                      <SelectValue placeholder="Sélectionnez une filière" />
                    </SelectTrigger>
                    <SelectContent className="max-h-80">
                      <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">BTS d'État</div>
                      {btsPrograms.map((p) => (
                        <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>
                      ))}
                      <div className="mt-1 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Licence & Master</div>
                      {licenceMasterPrograms.map((p) => (
                        <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.programme && <p className="text-xs text-destructive">{errors.programme}</p>}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="message">Message (optionnel)</Label>
                  <Textarea id="message" name="message" rows={4} placeholder="Précisez vos questions ou votre disponibilité..." />
                </div>
                <Button type="submit" size="lg" className="bg-[var(--whatsapp)] text-white hover:opacity-90">
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Envoyer ma candidature via WhatsApp
                </Button>
                <p className="text-center text-xs text-muted-foreground">
                  Vous pouvez aussi nous joindre directement au {ESAGE.phones[0]}
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>
    </SiteLayout>
  );
}
