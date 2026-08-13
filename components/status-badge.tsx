import { cn } from '@/lib/utils';

export type ProjectStatus = 'Draft' | 'Online' | 'Process' | 'Finish' | 'Cancel';

interface StatusBadgeProps {
  status: ProjectStatus;
  className?: string;
}

const statusConfig: Record<
  ProjectStatus,
  { bg: string; text: string; border: string; dot: string }
> = {
  Draft: {
    bg: 'bg-muted/20',
    text: 'text-muted-foreground',
    border: 'border-muted-foreground/30',
    dot: 'bg-muted-foreground',
  },
  Online: {
    bg: 'bg-success/10',
    text: 'text-success',
    border: 'border-success/30',
    dot: 'bg-success',
  },
  Process: {
    bg: 'bg-accent/10',
    text: 'text-accent',
    border: 'border-accent/30',
    dot: 'bg-accent',
  },
  Finish: {
    bg: 'bg-info/10',
    text: 'text-info',
    border: 'border-info/30',
    dot: 'bg-info',
  },
  Cancel: {
    bg: 'bg-error/10',
    text: 'text-error',
    border: 'border-error/30',
    dot: 'bg-error',
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const s = statusConfig[status];
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider',
        s.bg,
        s.text,
        s.border,
        className
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full', s.dot)} />
      {status}
    </span>
  );
}
