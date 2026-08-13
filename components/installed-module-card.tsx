import { cn } from '@/lib/utils';
import { Cpu, MoreVertical } from 'lucide-react';

interface InstalledModuleCardProps {
  name: string;
  description: string;
  version: string;
  status: 'online' | 'idle' | 'maintenance';
  icon?: React.ReactNode;
  metrics?: { label: string; value: string }[];
  className?: string;
}

const statusConfig = {
  online: { color: 'bg-success', label: 'ONLINE', text: 'text-success' },
  idle: { color: 'bg-warning', label: 'IDLE', text: 'text-warning' },
  maintenance: { color: 'bg-muted-foreground', label: 'MAINT', text: 'text-muted-foreground' },
};

export function InstalledModuleCard({
  name,
  description,
  version,
  status,
  icon,
  metrics,
  className,
}: InstalledModuleCardProps) {
  const s = statusConfig[status];

  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-lg border border-subtle-border bg-elevated transition-all hover:border-accent/30 hover:shadow-lg',
        className
      )}
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-lg">
        <div className="absolute inset-0 industrial-grid-fine opacity-20" />
      </div>

      <div className="relative flex items-start justify-between p-4 pb-3">
        <div className="flex items-center gap-3">
          <div className="relative flex h-12 w-12 items-center justify-center rounded-md border border-subtle-border bg-surface accent-glow-sm">
            {icon ?? <Cpu className="h-6 w-6 text-accent" />}
            <div className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full border border-elevated bg-success led-pulse" />
          </div>
          <div>
            <h3 className="font-display text-sm font-semibold text-foreground">
              {name}
            </h3>
            <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              v{version}
            </p>
          </div>
        </div>
        <button className="rounded p-1 text-muted-foreground opacity-0 transition-opacity hover:bg-surface group-hover:opacity-100">
          <MoreVertical className="h-4 w-4" />
        </button>
      </div>

      <div className="relative px-4 pb-2">
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>

      {metrics && metrics.length > 0 && (
        <div className="relative grid grid-cols-3 gap-px border-t border-subtle-border bg-subtle-border">
          {metrics.map((m) => (
            <div key={m.label} className="bg-elevated px-2 py-2 text-center">
              <p className="font-mono text-sm font-semibold text-foreground">
                {m.value}
              </p>
              <p className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
                {m.label}
              </p>
            </div>
          ))}
        </div>
      )}

      <div className="relative flex items-center justify-between border-t border-subtle-border px-4 py-2.5">
        <div className="flex items-center gap-2">
          <div className={cn('h-2 w-2 rounded-full led-pulse', s.color)} />
          <span className={cn('font-mono text-[10px] font-semibold tracking-wider', s.text)}>
            {s.label}
          </span>
        </div>
        <div className="flex gap-1">
          <div className="h-1 w-6 rounded-full bg-surface" />
          <div className="h-1 w-6 rounded-full bg-surface" />
          <div className="h-1 w-6 rounded-full bg-accent/40" />
        </div>
      </div>

      <div className="absolute left-1.5 top-1.5 screw" />
      <div className="absolute right-1.5 top-1.5 screw" />
      <div className="absolute bottom-1.5 left-1.5 screw" />
      <div className="absolute bottom-1.5 right-1.5 screw" />
    </div>
  );
}
