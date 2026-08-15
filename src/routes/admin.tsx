import { createFileRoute, redirect } from "@tanstack/react-router";

import { AdminShell } from "@/components/admin-shell";
import { supabase } from "@/integrations/supabase/client";
import { isDemoMode } from "@/lib/demo-mode";

export const Route = createFileRoute("/admin")({
  ssr: false,
  beforeLoad: async () => {
    if (isDemoMode()) return;
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/auth" });
  },
  component: () => <AdminShell />,
});
