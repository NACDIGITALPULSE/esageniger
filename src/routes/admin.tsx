import { createFileRoute, Outlet, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  Settings, 
  LayoutDashboard, 
  LogOut, 
  Loader2, 
  Menu, 
  X,
  FileText,
  HelpCircle,
  Image as ImageIcon,
  UserCheck
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin" as any)({
  component: AdminLayout,
});

function AdminLayout() {
  const navigate = useNavigate();
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate({ to: "/admin/login" as any });
      } else {
        setSession(session);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session) navigate({ to: "/admin/login" as any });
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  async function handleLogout() {
    await supabase.auth.signOut();
    toast.success("Déconnecté");
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!session) return null;

  const navItems = [
    { label: "Dashboard", to: "/admin", icon: LayoutDashboard },
    { label: "Inscriptions", to: "/admin/applications", icon: Users },
    { label: "Programmes", to: "/admin/programs", icon: FileText },
    { label: "Équipe", to: "/admin/team", icon: UserCheck },
    { label: "FAQ", to: "/admin/faq", icon: HelpCircle },
    { label: "Galerie", to: "/admin/gallery", icon: ImageIcon },
  ];

  return (
    <div className="flex min-h-screen bg-secondary/20">
      {/* Desktop Sidebar */}
      <aside className="hidden w-64 border-r bg-background lg:block">
        <div className="flex h-16 items-center border-b px-6">
          <span className="font-serif text-xl font-bold text-primary">ESAGE Admin</span>
        </div>
        <nav className="space-y-1 p-4">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to as any}
              className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground [&.active]:bg-primary/10 [&.active]:text-primary"
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
          >
            <LogOut className="h-4 w-4" />
            Déconnexion
          </button>
        </nav>
      </aside>

      <div className="flex flex-1 flex-col">
        {/* Mobile Header */}
        <header className="flex h-16 items-center justify-between border-b bg-background px-4 lg:hidden">
          <span className="font-serif text-lg font-bold text-primary">ESAGE Admin</span>
          <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X /> : <Menu />}
          </Button>
        </header>

        {/* Mobile Nav */}
        {mobileMenuOpen && (
          <nav className="border-b bg-background p-4 lg:hidden">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to as any}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground [&.active]:bg-primary/10 [&.active]:text-primary"
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-destructive"
            >
              <LogOut className="h-4 w-4" />
              Déconnexion
            </button>
          </nav>
        )}

        <main className="flex-1 p-6 lg:p-10 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
