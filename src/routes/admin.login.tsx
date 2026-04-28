import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAdminAuth } from "@/lib/admin-auth";
import { Lock, Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/login")({
  head: () => ({ meta: [{ title: "Connexion administrateur — ESAGE" }, { name: "robots", content: "noindex, nofollow" }] }),
  component: AdminLoginPage,
});

const schema = z.object({
  email: z.string().trim().email("Email invalide").max(255),
  password: z.string().min(8, "8 caractères minimum").max(128),
});

function AdminLoginPage() {
  const navigate = useNavigate();
  const { loading, isAdmin, session } = useAdminAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && session && isAdmin) {
      navigate({ to: "/admin" });
    }
  }, [loading, session, isAdmin, navigate]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = schema.safeParse({ email, password });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setSubmitting(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email: parsed.data.email,
          password: parsed.data.password,
          options: { emailRedirectTo: `${window.location.origin}/admin` },
        });
        if (error) throw error;
        toast.success("Compte créé. Vous pouvez maintenant vous connecter.");
        setMode("signin");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: parsed.data.email,
          password: parsed.data.password,
        });
        if (error) throw error;
        toast.success("Connexion réussie");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erreur de connexion";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary/30 px-4 py-12">
      <div className="w-full max-w-md">
        <Link to="/" className="mb-6 block text-center text-sm text-muted-foreground hover:text-foreground">
          ← Retour au site
        </Link>
        <Card className="border-border shadow-[var(--shadow-elegant)]">
          <CardContent className="p-8">
            <div className="mb-6 flex flex-col items-center text-center">
              <div className="rounded-full bg-primary/10 p-3">
                <ShieldCheck className="h-7 w-7 text-primary" />
              </div>
              <h1 className="mt-4 font-serif text-2xl font-bold">Espace Administrateur</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {mode === "signin" ? "Connectez-vous pour gérer le contenu" : "Créer un compte administrateur"}
              </p>
            </div>

            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="vous@exemple.com"
                  required
                />
              </div>
              <div>
                <Label htmlFor="password">Mot de passe</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete={mode === "signin" ? "current-password" : "new-password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={8}
                />
              </div>
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Lock className="mr-2 h-4 w-4" />}
                {mode === "signin" ? "Se connecter" : "Créer le compte"}
              </Button>
            </form>

            <button
              type="button"
              className="mt-6 w-full text-center text-xs text-muted-foreground hover:text-foreground"
              onClick={() => setMode((m) => (m === "signin" ? "signup" : "signin"))}
            >
              {mode === "signin"
                ? "Première connexion ? Créer le compte administrateur"
                : "Déjà un compte ? Se connecter"}
            </button>

            {mode === "signup" && (
              <p className="mt-4 rounded-md bg-accent/40 p-3 text-xs text-muted-foreground">
                ℹ️ Seul l'email <strong>nouredinechekaraou@live.fr</strong> recevra automatiquement les droits administrateur.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
