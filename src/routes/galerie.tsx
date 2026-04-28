import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { CtaBand } from "@/components/site/CtaBand";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import heroImg from "@/assets/hero-classroom.jpg";
import studentsImg from "@/assets/students-group.jpg";
import profImg from "@/assets/professor-teaching.jpg";
import gradImg from "@/assets/graduation.jpg";
import libImg from "@/assets/library-study.jpg";
import campusImg from "@/assets/campus-building.jpg";

const photos = [
  { src: heroImg, alt: "Salle de classe ESAGE" },
  { src: studentsImg, alt: "Groupe d'étudiants ESAGE" },
  { src: profImg, alt: "Cours magistral à ESAGE" },
  { src: gradImg, alt: "Cérémonie de remise des diplômes" },
  { src: libImg, alt: "Étudiants en bibliothèque" },
  { src: campusImg, alt: "Bâtiment du campus ESAGE" },
];

export const Route = createFileRoute("/galerie")({
  head: () => ({
    meta: [
      { title: "Galerie photos — Vie étudiante à ESAGE" },
      { name: "description", content: "Découvrez la vie étudiante à ESAGE : salles de classe, bibliothèque, campus et cérémonies." },
      { property: "og:title", content: "Galerie — ESAGE" },
      { property: "og:description", content: "La vie étudiante en images." },
      { property: "og:image", content: heroImg },
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
        </div>
      </section>

      <section className="container mx-auto px-4 py-20 lg:px-8">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {photos.map((p) => (
            <button
              key={p.src}
              type="button"
              onClick={() => setOpen(p.src)}
              className="group relative overflow-hidden rounded-xl shadow-[var(--shadow-card)]"
              aria-label={`Agrandir : ${p.alt}`}
            >
              <img
                src={p.src}
                alt={p.alt}
                loading="lazy"
                width={1280}
                height={896}
                className="h-64 w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-primary/0 transition-colors group-hover:bg-primary/30" />
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
