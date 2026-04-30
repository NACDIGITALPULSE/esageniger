import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

type FaqItem = {
  id: string;
  category: string;
  question: string;
  answer: string;
  display_order: number;
};

const CATEGORY_LABELS: Record<string, string> = {
  admissions: "Admissions",
  frais: "Frais de scolarité",
  pieces: "Pièces à fournir",
  delais: "Délais",
  general: "Questions générales",
};

export function FAQBlock({ categories, title = "Questions fréquentes", subtitle }: {
  categories?: string[];
  title?: string;
  subtitle?: string;
}) {
  const [items, setItems] = useState<FaqItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function load() {
      let q = supabase.from("faq_items").select("*").eq("is_visible", true).order("category").order("display_order");
      const { data } = await q;
      if (!mounted) return;
      let list = (data as FaqItem[]) ?? [];
      if (categories && categories.length > 0) list = list.filter((i) => categories.includes(i.category));
      setItems(list);
      setLoading(false);
    }
    load();
    const ch = supabase
      .channel("faq-public")
      .on("postgres_changes", { event: "*", schema: "public", table: "faq_items" }, () => load())
      .subscribe();
    return () => { mounted = false; supabase.removeChannel(ch); };
  }, [categories?.join(",")]);

  // Group by category
  const groups = items.reduce<Record<string, FaqItem[]>>((acc, it) => {
    (acc[it.category] = acc[it.category] ?? []).push(it);
    return acc;
  }, {});

  if (loading) return null;
  if (items.length === 0) return null;

  return (
    <section className="container mx-auto px-4 py-16 lg:px-8">
      <div className="mx-auto max-w-3xl text-center">
        <div className="text-sm font-semibold uppercase tracking-widest text-primary">FAQ</div>
        <h2 className="mt-3 font-serif text-3xl font-bold">{title}</h2>
        {subtitle && <p className="mt-3 text-muted-foreground">{subtitle}</p>}
      </div>

      <div className="mx-auto mt-10 max-w-3xl space-y-8">
        {Object.entries(groups).map(([cat, list]) => (
          <div key={cat}>
            <h3 className="mb-3 font-serif text-xl font-bold text-primary">{CATEGORY_LABELS[cat] ?? cat}</h3>
            <Accordion type="single" collapsible className="rounded-lg border border-border bg-background">
              {list.map((it) => (
                <AccordionItem key={it.id} value={it.id} className="border-border px-4">
                  <AccordionTrigger className="text-left text-sm font-semibold">{it.question}</AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground whitespace-pre-line">{it.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        ))}
      </div>
    </section>
  );
}
