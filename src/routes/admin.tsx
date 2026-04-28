import { Outlet, Link, useNavigate, useLocation, createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAdminAuth } from "@/lib/admin-auth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Loader2, LayoutDashboard, BookOpen, Wallet, Image as ImageIcon, Users, Type, History, LogOut, ExternalLink } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Administration ESAGE" }, { name: "robots", content: "noindex, nofollow" }] }),
  component: AdminLayout,
});

const navItems = [
  { to: "/admin", label: "Tableau de bord", icon: LayoutDashboard, exact: true },
  { to: "/admin/programs", label: "Programmes", icon: BookOpen },
  { to: "/admin/tuition", label: "Frais de scolarité", icon: Wallet },
  { to: "/admin/gallery", label: "Galerie", icon: ImageIcon },
  { to: "/admin/team", label: "Équipe", icon: Users },
  { to: "/admin/texts", label: "Textes du site", icon: Type },
  { to: "/admin/audit", label: "Journal", icon: History },
] as const;

function AdminLayout() {
  const { loading, session, isAdmin, user } = useAdminAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (loading) return;
    if (location.pathname === "/admin/login") return;
    if (!session) {
      navigate({ to: "/admin/login" });
    } else if (!isAdmin) {
      toast.error("Accès refusé : compte non administrateur");
      navigate({ to: "/admin/login" });
    }
  }, [loading, session, isAdmin, navigate, location.pathname]);

  // Render the login page outside the protected shell
  if (location.pathname === "/admin/login") {
    return <Outlet />;
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-secondary/30">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!session || !isAdmin) {
    return null;
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    toast.success("Déconnecté");
    navigate({ to: "/admin/login" });
  }

  return (
    <div className="min-h-screen bg-secondary/20">
      <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur">
        <div className="container mx-auto flex h-14 items-center justify-between px-4 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="rounded-md bg-primary/10 px-2 py-1 text-xs font-bold uppercase tracking-wider text-primary">Admin</div>
            <span className="font-serif text-lg font-bold">ESAGE</span>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm">
              <Link to="/" target="_blank">
                <ExternalLink className="mr-1.5 h-3.5 w-3.5" /> Voir le site
              </Link>
            </Button>
            <span className="hidden text-xs text-muted-foreground sm:inline">{user?.email}</span>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="mr-1.5 h-3.5 w-3.5" /> Déconnexion
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto grid gap-6 px-4 py-6 lg:grid-cols-[220px_1fr] lg:px-8">
        <aside className="lg:sticky lg:top-20 lg:self-start">
          <nav className="flex gap-1 overflow-x-auto rounded-lg border border-border bg-background p-2 lg:flex-col lg:overflow-visible">
            {navItems.map((item) => {
              const active = item.exact ? location.pathname === item.to : location.pathname.startsWith(item.to);
              const Icon = item.icon;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex shrink-0 items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors ${
                    active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </aside>
        <main className="min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
