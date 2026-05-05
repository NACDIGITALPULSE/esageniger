import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  Users, 
  CheckCircle2, 
  MessageCircle, 
  TrendingUp,
  Loader2,
  Rocket
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/" as any)({
  component: AdminDashboard,
});

function AdminDashboard() {
  const [stats, setStats] = useState({
    total: 0,
    whatsappConfirmed: 0,
    pending: 0,
  });
  const [admissionsActive, setAdmissionsActive] = useState<boolean>(true);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    async function fetchData() {
      const { data: apps } = await supabase.from('applications').select('whatsapp_sent, status');
      const { data: config } = await supabase.from('site_config').select('value').eq('key', 'admissions_active').single();
      
      if (apps) {
        setStats({
          total: apps.length,
          whatsappConfirmed: apps.filter(a => a.whatsapp_sent).length,
          pending: apps.filter(a => a.status === 'pending').length,
        });
      }
      
      if (config) {
        setAdmissionsActive(config.value as boolean);
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  async function toggleAdmissions(checked: boolean) {
    setUpdating(true);
    const { error } = await supabase
      .from('site_config')
      .update({ value: checked })
      .eq('key', 'admissions_active');
    
    if (error) {
      toast.error("Erreur lors de la mise à jour");
    } else {
      setAdmissionsActive(checked);
      toast.success(checked ? "Admissions activées !" : "Admissions désactivées");
    }
    setUpdating(false);
  }

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="animate-spin" /></div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-3xl font-bold">Tableau de Bord</h1>
        <p className="text-muted-foreground">Bienvenue dans l'interface de gestion ESAGE.</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Inscriptions Totales</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Depuis le début de la session</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Confirmés WhatsApp</CardTitle>
            <MessageCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.whatsappConfirmed}</div>
            <p className="text-xs text-muted-foreground">Inscrits ayant confirmé l'envoi</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">En attente</CardTitle>
            <TrendingUp className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">Dossiers à traiter</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Taux de confirmation</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total > 0 ? Math.round((stats.whatsappConfirmed / stats.total) * 100) : 0}%</div>
            <p className="text-xs text-muted-foreground">Candidats ayant finalisé l'étape</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Rocket className="h-5 w-5 text-primary" />
            Lancement Officiel des Admissions
          </CardTitle>
          <CardDescription>
            Activez ou désactivez les inscriptions en ligne sur tout le site public.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label className="text-base font-semibold">
              {admissionsActive ? "Admissions OUVERTES" : "Admissions FERMÉES"}
            </Label>
            <p className="text-sm text-muted-foreground">
              {admissionsActive 
                ? "Le formulaire d'inscription est visible et utilisable par les visiteurs." 
                : "Un message d'information s'affiche à la place du formulaire."}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {updating && <Loader2 className="h-4 w-4 animate-spin" />}
            <Switch 
              checked={admissionsActive} 
              onCheckedChange={toggleAdmissions} 
              disabled={updating}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
