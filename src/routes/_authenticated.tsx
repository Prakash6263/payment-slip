import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated")({
  component: AuthGuard,
});

function AuthGuard() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let mounted = true;
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (!mounted) return;
      if (!session) navigate({ to: "/login", replace: true });
    });
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      if (!data.session) navigate({ to: "/login", replace: true });
      else setReady(true);
    });
    return () => { mounted = false; sub.subscription.unsubscribe(); };
  }, [navigate]);
  if (!ready) return <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">Loading…</div>;
  return <Outlet />;
}
