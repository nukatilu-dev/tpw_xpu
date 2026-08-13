import { cn } from '@/lib/utils';

interface IndustrialPanelProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  badge?: string;
  vent?: boolean;
  screws?: boolean;
  scan?: boolean;
}

export function IndustrialPanel({
  children,
  className,
  title,
  badge,
  vent = false,
  screws = true,
  scan = false,
}: IndustrialPanelProps) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-lg border border-subtle-border bg-panel',
        scan && 'scan-line',
        className
      )}
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-lg">
        <div className="absolute inset-0 industrial-grid-fine opacity-10" />
      </div>

      {(title || badge || vent) && (
        <div className="relative flex items-center justify-between border-b border-subtle-border">
          {vent && <div className="h-2 flex-1 vent-strip opacity-30" />}
          {title && (
            <div className="flex items-center gap-2 px-4 py-2.5">
              <div className="h-1.5 w-1.5 rounded-full bg-accent" />
              <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                {title}
              </span>
            </div>
          )}
          {badge && (
            <div className="mr-3 rounded border border-subtle-border bg-elevated px-2 py-0.5">
              <span className="font-mono text-[10px] uppercase tracking-wider text-accent">
                {badge}
              </span>
            </div>
          )}
        </div>
      )}

      <div className="relative">{children}</div>

      {screws && (
        <>
          <div className="absolute left-1.5 top-1.5 screw" />
          <div className="absolute right-1.5 top-1.5 screw" />
          <div className="absolute bottom-1.5 left-1.5 screw" />
          <div className="absolute bottom-1.5 right-1.5 screw" />
        </>
      )}
    </div>
  );
}
