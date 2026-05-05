import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  MessageCircle, 
  CheckCircle2, 
  Clock, 
  FileDown,
  Loader2,
  Filter
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export const Route = createFileRoute("/admin/applications" as any)({
  component: AdminApplications,
});

function AdminApplications() {
  const [apps, setApps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    async function fetchApps() {
      const { data, error } = await supabase
        .from('applications')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (data) setApps(data);
      setLoading(false);
    }
    fetchApps();
  }, []);

  const filteredApps = apps.filter(app => 
    app.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.receipt_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.phone.includes(searchTerm)
  );

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-3xl font-bold">Inscriptions</h1>
        <Button variant="outline">
          <FileDown className="mr-2 h-4 w-4" /> Exporter CSV
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>Liste des candidats</CardTitle>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input 
                placeholder="Rechercher (Nom, Reçu, Tél)..." 
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Reçu</TableHead>
                  <TableHead>Candidat</TableHead>
                  <TableHead>Filière (1er choix)</TableHead>
                  <TableHead>WhatsApp</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredApps.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                      Aucune inscription trouvée.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredApps.map((app) => (
                    <TableRow key={app.id}>
                      <TableCell className="font-mono text-xs font-bold">{app.receipt_number}</TableCell>
                      <TableCell>
                        <div className="font-medium">{app.full_name}</div>
                        <div className="text-xs text-muted-foreground">{app.phone}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{app.program_title}</div>
                        <Badge variant="outline" className="text-[10px]">{app.program_level}</Badge>
                      </TableCell>
                      <TableCell>
                        {app.whatsapp_sent ? (
                          <div className="flex flex-col gap-1">
                            <Badge className="bg-green-500 hover:bg-green-600 gap-1 w-fit">
                              <CheckCircle2 className="h-3 w-3" /> Confirmé
                            </Badge>
                            {app.whatsapp_sent_at && (
                              <span className="text-[10px] text-muted-foreground">
                                {format(new Date(app.whatsapp_sent_at), 'HH:mm (dd/MM)', { locale: fr })}
                              </span>
                            )}
                          </div>
                        ) : (
                          <Badge variant="secondary" className="gap-1 text-muted-foreground w-fit">
                            <Clock className="h-3 w-3" /> En attente
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-sm">
                        {format(new Date(app.created_at), 'dd/MM/yy', { locale: fr })}
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" asChild>
                          <a href={`https://wa.me/${app.phone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer">
                            <MessageCircle className="h-4 w-4" />
                          </a>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
