import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Building2, LogOut, ShieldCheck, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { GlassCard, SectionLabel } from "@/components/glass";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { audit } from "@/lib/audit";
import { isDemoMode, disableDemoMode } from "@/lib/demo-mode";
import { inr } from "@/lib/format";
import { catalogueQuery } from "@/lib/queries";

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
  const queryClient = useQueryClient();
  const [email, setEmail] = useState<string | null>(null);
  const [roles, setRoles] = useState<string[]>([]);
  const { data: catalogue } = useQuery(catalogueQuery);
  const [storeEdits, setStoreEdits] = useState<Record<string, string>>({});
  const [savingStore, setSavingStore] = useState<string | null>(null);

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

  async function saveStoreName(id: string) {
    const value = storeEdits[id]?.trim();
    if (!value) {
      toast.error("Store name cannot be empty.");
      return;
    }
    setSavingStore(id);
    const { error } = await supabase.from("stores").update({ name: value }).eq("id", id);
    setSavingStore(null);
    if (error) {
      toast.error("Update blocked by your role. Admins can edit store details.");
      return;
    }
    audit("store.name_update", "stores", id, { name: value });
    toast.success("Store name updated.");
    setStoreEdits((e) => {
      const next = { ...e };
      delete next[id];
      return next;
    });
    await queryClient.invalidateQueries({ queryKey: ["catalogue"] });
  }

  const stores = catalogue?.stores ?? [];

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

      <GlassCard className="p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Building2 className="size-5 text-primary" />
          <h2 className="font-medium">Store locations</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Edit store names. Changes are reflected across all screens immediately.
        </p>
        {stores.length === 0 ? (
          <p className="text-sm text-muted-foreground">No stores configured.</p>
        ) : (
          <div className="space-y-3">
            {stores.map((s) => {
              const edited = storeEdits[s.id] !== undefined;
              return (
                <div key={s.id} className="flex items-center gap-3">
                  <div className="min-w-0 flex-1">
                    <Input
                      value={edited ? storeEdits[s.id] : s.name}
                      onChange={(e) => setStoreEdits((d) => ({ ...d, [s.id]: e.target.value }))}
                      className="h-9"
                    />
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground">{s.city}</span>
                  {edited ? (
                    <Button
                      size="sm"
                      disabled={savingStore === s.id}
                      onClick={() => void saveStoreName(s.id)}
                    >
                      Save
                    </Button>
                  ) : null}
                </div>
              );
            })}
          </div>
        )}
      </GlassCard>

      <Button variant="glass" onClick={() => void signOut()}>
        <LogOut /> Sign out
      </Button>
    </div>
  );
}
