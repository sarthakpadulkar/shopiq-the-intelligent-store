import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { LogOut, ShieldCheck, UserRound } from "lucide-react";
import { useEffect, useState } from "react";

import { GlassCard, SectionLabel } from "@/components/glass";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { isDemoMode, disableDemoMode } from "@/lib/demo-mode";

export const Route = createFileRoute("/admin/settings")({
  head: () => ({
    meta: [
      { title: "Settings — ShopIQ Admin" },
      { name: "description", content: "Account, roles and session controls." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState<string | null>(null);
  const [roles, setRoles] = useState<string[]>([]);

  useEffect(() => {
    const userId = supabase.auth.getUser().then(({ data }) => {
      setEmail(data.user?.email ?? null);
      return data.user?.id ?? null;
    });
    void userId.then((id) => {
      if (!id) return;
      void supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", id)
        .then(({ data: rows }) => setRoles((rows ?? []).map((r) => r.role as string)));
    });
  }, []);

  async function signOut() {
    disableDemoMode();
    await supabase.auth.signOut();
    navigate({ to: "/auth" });
  }

  return (
    <div className="space-y-6">
      <div>
        <SectionLabel>Settings</SectionLabel>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight">Account</h1>
      </div>

      <GlassCard className="p-6">
        <div className="flex items-center gap-3">
          <div className="grid size-12 place-items-center rounded-2xl bg-primary/15">
            <UserRound className="size-6 text-primary" />
          </div>
          <div>
            <p className="font-medium">{email ?? "Signed in"}</p>
            <p className="text-xs text-muted-foreground">ShopIQ staff account</p>
          </div>
        </div>

        <div className="mt-6">
          <h2 className="text-sm font-medium text-muted-foreground">Roles</h2>
          <div className="mt-2 flex flex-wrap gap-2">
            {roles.length === 0 ? (
              <span className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground">
                No roles assigned
              </span>
            ) : (
              roles.map((r) => (
                <span
                  key={r}
                  className="rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs font-medium capitalize text-primary"
                >
                  {r}
                </span>
              ))
            )}
          </div>
          {isDemoMode() ? (
            <p className="mt-4 text-xs text-warning">
              Demo session active — actions are shown as if you were a brand admin. Connect a real
              staff account to persist changes.
            </p>
          ) : null}
        </div>
      </GlassCard>

      <GlassCard className="p-6">
        <div className="flex items-center gap-3">
          <ShieldCheck className="size-5 text-success" />
          <div className="text-sm text-muted-foreground">
            <p className="font-medium text-foreground">Security</p>
            <p className="mt-1">
              Every write goes through Supabase row-level security. Store screens never touch
              product or inventory data — staff roles decide who can change the catalogue.
            </p>
          </div>
        </div>
      </GlassCard>

      <Button variant="glass" onClick={() => void signOut()}>
        <LogOut /> Sign out
      </Button>
    </div>
  );
}
