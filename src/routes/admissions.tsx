import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SiteLayout } from "@/components/site/SiteLayout";
import { FAQBlock } from "@/components/site/FAQBlock";
import { whatsappLink, ESAGE } from "@/lib/contact";
import { downloadReceipt } from "@/lib/receipt-pdf";
import { allPrograms } from "@/data/programs";
import { tuitionTiers } from "@/data/tuition";
import { CheckCircle2, FileText, MessageCircle, Download, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const searchSchema = z.object({ programme: z.string().optional() });

export const Route = createFileRoute("/admissions")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Admissions ESAGE — Inscrivez-vous en ligne" },
      { name: "description", content: "Inscrivez-vous à ESAGE : pièces à fournir pour BTS, Licence et Master, et formulaire d'inscription en ligne avec reçu PDF." },
    ],
  }),
  component: AdmissionsPage,
});

const formSchema = z.object({
  nom: z.string().trim().min(2, "Nom requis").max(100),
  telephone: z.string().trim().min(6, "Téléphone requis").max(30),
  email: z.string().trim().email("Email invalide").max(150),
  programme: z.string().min(1, "Sélectionnez une filière"),
  programme2: z.string().optional(),
  palier: z.string().optional(),
  message: z.string().trim().max(500).optional(),
});

type Submitted = {
  id: string;
  receipt_number: string;
  full_name: string;
  phone: string;
  email: string;
  program_title: string | null;
  program_level: string | null;
  program_title_2: string | null;
  program_level_2: string | null;
  tuition_title: string | null;
  tuition_price: string | null;
  message: string | null;
  created_at: string;
  status: string;
  whatsapp_sent: boolean;
};

function generateReceiptNumber(): string {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `ESAGE-${yyyy}${mm}${dd}-${rand}`;
}

function AdmissionsPage() {
  const search = Route.useSearch();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [programme, setProgramme] = useState<string>(search.programme ?? "");
  const [programme2, setProgramme2] = useState<string>("");
  const [palier, setPalier] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState<Submitted | null>(null);
  const [admissionsActive, setAdmissionsActive] = useState<boolean | null>(null);
  const [confirmingWhatsapp, setConfirmingWhatsapp] = useState(false);

  const bts = allPrograms.filter((p) => p.level === "BTS");
  const lm = allPrograms.filter((p) => p.level !== "BTS");

  useEffect(() => {
    async function checkAdmissions() {
      const { data, error } = await supabase
        .from('site_config')
        .select('value')
        .eq('key', 'admissions_active')
        .single();
      
      if (!error && data) {
        setAdmissionsActive(data.value as boolean);
      } else {
        setAdmissionsActive(true); // Default to active if error
      }
    }
    checkAdmissions();
  }, []);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const data = {
      nom: String(fd.get("nom") ?? ""),
      telephone: String(fd.get("telephone") ?? ""),
      email: String(fd.get("email") ?? ""),
      programme,
      programme2: programme2 === "__none__" ? "" : programme2,
      palier,
      message: String(fd.get("message") ?? ""),
    };
    const parsed = formSchema.safeParse(data);
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      for (const issue of parsed.error.issues) errs[String(issue.path[0])] = issue.message;
      setErrors(errs);
      return;
    }
    if (parsed.data.programme2 && parsed.data.programme2 === parsed.data.programme) {
      setErrors({ programme2: "Le 2ème choix doit être différent du 1er" });
      return;
    }
    setErrors({});
    setSubmitting(true);

    const prog = allPrograms.find((p) => p.id === parsed.data.programme);
    const prog2 = parsed.data.programme2 ? allPrograms.find((p) => p.id === parsed.data.programme2) : undefined;
    const tier = tuitionTiers.find((t) => t.id === parsed.data.palier);

    const receiptNumber = generateReceiptNumber();
    
    // Save to Supabase
    const { data: dbData, error: dbError } = await supabase
      .from('applications')
      .insert({
        receipt_number: receiptNumber,
        full_name: parsed.data.nom,
        phone: parsed.data.telephone,
        email: parsed.data.email,
        program_id: parsed.data.programme,
        program_id_2: parsed.data.programme2 || null,
        program_title: prog?.title ?? null,
        program_level: prog?.level ?? null,
        program_title_2: prog2?.title ?? null,
        program_level_2: prog2?.level ?? null,
        tuition_tier_id: parsed.data.palier || null,
        tuition_title: tier?.title ?? null,
        tuition_price: tier?.price ?? null,
        message: parsed.data.message || null,
        status: "pending",
      })
      .select()
      .single();

    if (dbError) {
      console.error(dbError);
      toast.error("Erreur lors de l'enregistrement de l'inscription");
      setSubmitting(false);
      return;
    }

    const inserted: Submitted = {
      id: dbData.id,
      receipt_number: dbData.receipt_number,
      full_name: dbData.full_name,
      phone: dbData.phone,
      email: dbData.email,
      program_title: dbData.program_title,
      program_level: dbData.program_level as any,
      program_title_2: dbData.program_title_2,
      program_level_2: dbData.program_level_2 as any,
      tuition_title: dbData.tuition_title,
      tuition_price: dbData.tuition_price,
      message: dbData.message,
      created_at: dbData.created_at,
      status: dbData.status,
      whatsapp_sent: false,
    };

    // Génération + téléchargement du reçu PDF
    try {
      await downloadReceipt(inserted);
      toast.success("Reçu PDF téléchargé !");
    } catch (err) {
      console.error(err);
      toast.error("Erreur lors de la génération du PDF");
    }

    setSubmitting(false);
    setSubmitted(inserted);

    // Ouverture automatique de WhatsApp avec message pré-rempli
    setTimeout(() => {
      window.open(whatsappLink(buildWhatsappText(inserted)), "_blank", "noopener,noreferrer");
    }, 800);
  }

  async function confirmWhatsappSent() {
    if (!submitted) return;
    setConfirmingWhatsapp(true);
    const { error } = await supabase
      .from('applications')
      .update({ 
        whatsapp_sent: true,
        whatsapp_sent_at: new Date().toISOString()
      })
      .eq('id', submitted.id);

    if (error) {
      toast.error("Erreur lors de la confirmation");
    } else {
      setSubmitted({ ...submitted, whatsapp_sent: true });
      toast.success("Message WhatsApp confirmé !");
    }
    setConfirmingWhatsapp(false);
  }

  function buildWhatsappText(s: Submitted) {
    const c2 = s.program_title_2 ? `\n2ème choix : ${s.program_title_2}${s.program_level_2 ? ` (${s.program_level_2})` : ""}` : "";
    return `Bonjour ESAGE, je viens d'effectuer mon inscription en ligne.\n\nReçu : ${s.receipt_number}\nNom : ${s.full_name}\nTéléphone : ${s.phone}\nEmail : ${s.email}\n1er choix : ${s.program_title ?? "—"}${s.program_level ? ` (${s.program_level})` : ""}${c2}\nPalier : ${s.tuition_title ?? "—"}\n\nJe vous transmets également mon reçu PDF.`;
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
            { title: "Pièces à fournir — BTS", items: ["Acte de naissance légalisé", "Copie légalisée du diplôme (BAC ou équivalent)", "4 photos d'identité", "4 enveloppes timbrées"] },
            { title: "Pièces à fournir — Licence & Master", items: ["Copie légalisée du BTS / Licence / Master", "Acte de naissance légalisé", "4 photos d'identité", "4 enveloppes timbrées"] },
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
            <div className="text-sm font-semibold uppercase tracking-widest text-primary">Inscription en ligne</div>
            <h2 className="mt-3 font-serif text-3xl font-bold">Formulaire d'inscription</h2>
            <p className="mt-3 text-muted-foreground">
              Remplissez le formulaire : votre reçu PDF se télécharge automatiquement et WhatsApp s'ouvre pour transmettre vos informations à ESAGE.
            </p>
          </div>

          {submitted ? (
            <Card className="mx-auto mt-10 max-w-2xl border-primary/30 bg-background">
              <CardContent className="space-y-4 p-8 text-center">
                <CheckCircle2 className="mx-auto h-14 w-14 text-primary" />
                <h3 className="font-serif text-2xl font-bold">Inscription enregistrée</h3>
                <p className="text-sm text-muted-foreground">
                  Votre numéro de reçu : <span className="font-mono font-bold text-foreground">{submitted.receipt_number}</span>
                </p>
                <p className="text-sm text-muted-foreground">
                  Votre reçu PDF a été téléchargé et WhatsApp s'est ouvert pour finaliser votre inscription.
                  Si WhatsApp ne s'est pas ouvert, cliquez ci-dessous.
                </p>
                <div className="flex flex-wrap justify-center gap-3 pt-2">
                  <Button onClick={() => downloadReceipt(submitted)}>
                    <Download className="mr-2 h-4 w-4" /> Re-télécharger le reçu PDF
                  </Button>
                  <Button asChild className="bg-[var(--whatsapp)] text-white hover:opacity-90">
                    <a href={whatsappLink(buildWhatsappText(submitted))} target="_blank" rel="noopener noreferrer">
                      <MessageCircle className="mr-2 h-4 w-4" /> Envoyer sur WhatsApp
                    </a>
                  </Button>
                  <Button variant="ghost" onClick={() => { setSubmitted(null); setProgramme(""); setProgramme2(""); setPalier(""); }}>
                    Nouvelle inscription
                  </Button>
                </div>
                <p className="pt-3 text-xs text-muted-foreground">
                  Pensez à apporter votre reçu PDF imprimé lors de votre passage à l'école avec les pièces requises.
                </p>
              </CardContent>
            </Card>
          ) : (
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
                    <Label htmlFor="programme">Filière souhaitée — 1er choix *</Label>
                    <Select value={programme} onValueChange={setProgramme}>
                      <SelectTrigger id="programme"><SelectValue placeholder="Sélectionnez votre 1er choix" /></SelectTrigger>
                      <SelectContent className="max-h-80">
                        {bts.length > 0 && <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">BTS d'État</div>}
                        {bts.map((p) => (<SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>))}
                        {lm.length > 0 && <div className="mt-1 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Licence & Master</div>}
                        {lm.map((p) => (<SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>))}
                      </SelectContent>
                    </Select>
                    {errors.programme && <p className="text-xs text-destructive">{errors.programme}</p>}
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="programme2">Filière souhaitée — 2ème choix (optionnel)</Label>
                    <Select value={programme2} onValueChange={setProgramme2}>
                      <SelectTrigger id="programme2"><SelectValue placeholder="Aucun second choix" /></SelectTrigger>
                      <SelectContent className="max-h-80">
                        <SelectItem value="__none__">— Aucun —</SelectItem>
                        {bts.length > 0 && <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">BTS d'État</div>}
                        {bts.filter((p) => p.id !== programme).map((p) => (<SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>))}
                        {lm.length > 0 && <div className="mt-1 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Licence & Master</div>}
                        {lm.filter((p) => p.id !== programme).map((p) => (<SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>))}
                      </SelectContent>
                    </Select>
                    {errors.programme2 && <p className="text-xs text-destructive">{errors.programme2}</p>}
                    <p className="text-[11px] text-muted-foreground">Indiquez une filière de secours si votre 1er choix n'est pas disponible.</p>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="palier">Niveau de scolarité (optionnel)</Label>
                    <Select value={palier} onValueChange={setPalier}>
                      <SelectTrigger id="palier"><SelectValue placeholder="Sélectionnez un niveau" /></SelectTrigger>
                      <SelectContent>
                        {tuitionTiers.map((t) => (<SelectItem key={t.id} value={t.id}>{t.title} — {t.price} FCFA</SelectItem>))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="message">Message (optionnel)</Label>
                    <Textarea id="message" name="message" rows={4} placeholder="Précisez vos questions ou votre disponibilité..." />
                  </div>
                  <Button type="submit" size="lg" disabled={submitting}>
                    {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileText className="mr-2 h-4 w-4" />}
                    Télécharger mon reçu et envoyer sur WhatsApp
                  </Button>
                  <p className="text-center text-xs text-muted-foreground">
                    Vous pouvez aussi nous joindre directement au {ESAGE.phones[0]} ou par email à {ESAGE.email}
                  </p>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      <FAQBlock
        categories={["admissions", "frais", "pieces", "delais"]}
        title="Vos questions sur l'inscription"
        subtitle="Tout ce qu'il faut savoir avant de déposer votre dossier."
      />
    </SiteLayout>
  );
}
