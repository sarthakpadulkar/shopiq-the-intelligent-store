import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export function GlassCard({
  className,
  children,
  interactive = false,
}: {
  className?: string;
  children: ReactNode;
  interactive?: boolean;
}) {
  return (
    <div
      className={cn(
        "glass surface-lift rounded-3xl",
        interactive && "hover:-translate-y-1 hover:border-primary/40 hover:glow-ring",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <span className="text-[0.7rem] font-semibold uppercase tracking-[0.28em] text-primary">
      {children}
    </span>
  );
}

export function DemoBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-accent/40 bg-accent/10 px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-accent",
        className,
      )}
    >
      <span className="size-1.5 rounded-full bg-accent" />
      Demo data
    </span>
  );
}

export function StatTile({
  label,
  value,
  hint,
  icon,
}: {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <GlassCard className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            {label}
          </p>
          <p className="mt-2 font-display text-3xl font-semibold text-foreground">{value}</p>
          {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
        </div>
        {icon ? (
          <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-primary/12 text-primary">
            {icon}
          </span>
        ) : null}
      </div>
    </GlassCard>
  );
}
