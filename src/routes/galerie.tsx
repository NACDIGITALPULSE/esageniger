import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { CtaBand } from "@/components/site/CtaBand";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { galleryItems } from "@/data/gallery";

export const Route = createFileRoute("/galerie")({
  head: () => ({
    meta: [
      { title: "Galerie photos — Vie étudiante à ESAGE" },
      { name: "description", content: "Découvrez la vie étudiante à ESAGE : salles de classe, bibliothèque, campus et cérémonies." },
      { property: "og:title", content: "Galerie ESAGE" },
      { property: "og:description", content: "Photos du campus et de la vie étudiante." },
    ],
  }),
  component: GalleryPage,
});

function GalleryPage() {
  const [open, setOpen] = useState<string | null>(null);

  return (
    <SiteLayout>
      <section className="bg-primary py-20 text-primary-foreground">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-sm font-semibold uppercase tracking-widest text-primary-foreground/70">Galerie</div>
          <h1 className="mt-3 font-serif text-4xl font-bold sm:text-5xl">La vie à ESAGE en images</h1>
          <p className="mt-4 max-w-2xl text-lg text-primary-foreground/90">
            Plongez dans le quotidien de nos étudiants : cours, travaux pratiques, bibliothèque et événements.
          </p>
        </div>
      </section>

      <section className="container mx-auto px-4 py-20 lg:px-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {galleryItems.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setOpen(p.image_url)}
              className="group relative overflow-hidden rounded-xl shadow-[var(--shadow-card)]"
              aria-label={`Agrandir : ${p.title}`}
            >
              <img
                src={p.image_url}
                alt={p.title}
                loading="lazy"
                width={1280}
                height={896}
                className="h-64 w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-primary/0 transition-colors group-hover:bg-primary/30" />
              {p.caption && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3 text-left text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
                  {p.caption}
                </div>
              )}
            </button>
          ))}
        </div>
      </section>

      <Dialog open={!!open} onOpenChange={(v) => !v && setOpen(null)}>
        <DialogContent className="max-w-4xl border-0 bg-transparent p-0 shadow-none">
          {open && <img src={open} alt="" className="h-auto w-full rounded-lg" />}
        </DialogContent>
      </Dialog>

      <CtaBand />
    </SiteLayout>
  );
}
