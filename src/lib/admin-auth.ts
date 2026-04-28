import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Session, User } from "@supabase/supabase-js";

export type AdminAuthState = {
  loading: boolean;
  session: Session | null;
  user: User | null;
  isAdmin: boolean;
};

export function useAdminAuth(): AdminAuthState {
  const [state, setState] = useState<AdminAuthState>({
    loading: true,
    session: null,
    user: null,
    isAdmin: false,
  });

  useEffect(() => {
    let mounted = true;

    async function checkRole(userId: string): Promise<boolean> {
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .eq("role", "admin")
        .maybeSingle();
      return Boolean(data);
    }

    // Set up listener first
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      if (!session) {
        setState({ loading: false, session: null, user: null, isAdmin: false });
        return;
      }
      setState((s) => ({ ...s, session, user: session.user, loading: true }));
      // Defer Supabase call
      setTimeout(async () => {
        const isAdmin = await checkRole(session.user.id);
        if (!mounted) return;
        setState({ loading: false, session, user: session.user, isAdmin });
      }, 0);
    });

    // Then fetch existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!mounted) return;
      if (!session) {
        setState({ loading: false, session: null, user: null, isAdmin: false });
        return;
      }
      const isAdmin = await checkRole(session.user.id);
      if (!mounted) return;
      setState({ loading: false, session, user: session.user, isAdmin });
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return state;
}

export async function logAudit(params: {
  action: string;
  entity: string;
  entityId?: string | null;
  details?: Record<string, unknown>;
}) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  await supabase.from("audit_log").insert({
    user_id: user.id,
    user_email: user.email ?? null,
    action: params.action,
    entity: params.entity,
    entity_id: params.entityId ?? null,
    details: (params.details ?? {}) as never,
  });
}
