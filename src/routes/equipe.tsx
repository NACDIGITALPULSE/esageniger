import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent } from "@/components/ui/card";
import { SiteLayout } from "@/components/site/SiteLayout";
import { CtaBand } from "@/components/site/CtaBand";
import { GraduationCap, Loader2, User } from "lucide-react";
import { useRealtimeTable } from "@/lib/use-realtime-table";

type Member = {
  id: string;
  full_name: string;
  role_title: string;
  bio: string | null;
  photo_url: string | null;
  display_order: number;
  is_visible: boolean;
};

export const Route = createFileRoute("/equipe")({
  head: () => ({
    meta: [
      { title: "Notre équipe — Direction et corps enseignant ESAGE" },
      { name: "description", content: "Une direction expérimentée et un corps enseignant composé de professionnels en activité et d'enseignants permanents." },
      { property: "og:title", content: "L'équipe ESAGE" },
      { property: "og:description", content: "Direction, enseignants et professionnels au service de votre réussite." },
    ],
  }),
  component: TeamPage,
});

function TeamPage() {
  const { data, loading } = useRealtimeTable<Member>("team_members");
  const members = data.filter((m) => m.is_visible);

  return (
    <SiteLayout>
      <section className="bg-primary py-20 text-primary-foreground">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-sm font-semibold uppercase tracking-widest text-primary-foreground/70">L'équipe</div>
          <h1 className="mt-3 font-serif text-4xl font-bold sm:text-5xl">Une équipe d'expérience à votre service</h1>
          <p className="mt-4 max-w-2xl text-lg text-primary-foreground/90">
            Direction expérimentée, enseignants permanents et professionnels en activité.
          </p>
        </div>
      </section>

      <section className="container mx-auto px-4 py-20 lg:px-8">
        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : members.length === 0 ? (
          <p className="text-center text-muted-foreground">Équipe à venir.</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {members.map((m) => (
              <Card key={m.id} className="overflow-hidden border-border hover-lift">
                {m.photo_url ? (
                  <img src={m.photo_url} alt={m.full_name} loading="lazy" className="h-56 w-full object-cover" />
                ) : (
                  <div className="flex h-56 w-full items-center justify-center bg-accent">
                    <GraduationCap className="h-14 w-14 text-primary" />
                  </div>
                )}
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
                    <User className="h-3 w-3" /> {m.role_title}
                  </div>
                  <h3 className="mt-2 font-serif text-xl font-bold">{m.full_name}</h3>
                  {m.bio && <p className="mt-3 text-sm text-muted-foreground">{m.bio}</p>}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      <CtaBand />
    </SiteLayout>
  );
}
