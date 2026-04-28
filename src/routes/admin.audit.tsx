import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/audit")({
  component: AdminAudit,
});

type Entry = {
  id: string;
  user_email: string | null;
  action: string;
  entity: string;
  entity_id: string | null;
  details: Record<string, unknown> | null;
  created_at: string;
};

function AdminAudit() {
  const [items, setItems] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("audit_log").select("*").order("created_at", { ascending: false }).limit(200);
      if (error) toast.error(error.message);
      setItems((data as Entry[]) ?? []);
      setLoading(false);
    })();
  }, []);

  const actionColor: Record<string, string> = {
    create: "bg-green-100 text-green-800",
    update: "bg-blue-100 text-blue-800",
    delete: "bg-red-100 text-red-800",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-bold">Journal des modifications</h1>
        <p className="mt-1 text-sm text-muted-foreground">200 dernières actions effectuées dans l'administration.</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : items.length === 0 ? (
        <Card><CardContent className="p-8 text-center text-sm text-muted-foreground">Aucune entrée.</CardContent></Card>
      ) : (
        <Card className="border-border">
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {items.map((e) => (
                <div key={e.id} className="grid grid-cols-1 gap-2 p-4 sm:grid-cols-[120px_90px_140px_1fr_auto] sm:items-center">
                  <span className={`w-fit rounded-full px-2 py-0.5 text-xs font-semibold ${actionColor[e.action] ?? "bg-secondary text-foreground"}`}>
                    {e.action}
                  </span>
                  <span className="text-sm font-medium">{e.entity}</span>
                  <span className="truncate text-xs text-muted-foreground">{e.user_email ?? "—"}</span>
                  <span className="truncate font-mono text-[10px] text-muted-foreground">{e.entity_id ?? ""}</span>
                  <time className="text-xs text-muted-foreground">{new Date(e.created_at).toLocaleString("fr-FR")}</time>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
