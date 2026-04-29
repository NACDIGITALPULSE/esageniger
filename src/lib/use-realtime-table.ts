import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Subscribe to a Supabase table and keep local data fresh in realtime.
 * Used by the public site to instantly reflect changes made in the admin panel.
 */
export function useRealtimeTable<T = any>(
  table: "programs" | "tuition_tiers" | "gallery_items" | "team_members",
  orderBy: string = "display_order",
) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function load() {
      const { data: rows } = await supabase.from(table).select("*").order(orderBy, { ascending: true });
      if (active) {
        setData((rows as T[]) ?? []);
        setLoading(false);
      }
    }
    load();

    const channel = supabase
      .channel(`public-${table}`)
      .on("postgres_changes", { event: "*", schema: "public", table }, () => {
        load();
      })
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, [table, orderBy]);

  return { data, loading };
}
