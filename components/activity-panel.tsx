import { cn } from '@/lib/utils';
import { Activity } from 'lucide-react';

interface ActivityItem {
  action: string;
  target: string;
  time: string;
  type: 'install' | 'update' | 'config' | 'alert' | 'deploy';
}

interface ActivityPanelProps {
  items?: ActivityItem[];
  className?: string;
}

const defaultItems: ActivityItem[] = [
  { action: 'Installed', target: 'TPW Warung v2.4', time: '10:24 WIB', type: 'install' },
  { action: 'Updated', target: 'Pricing configuration', time: '09:15 WIB', type: 'update' },
  { action: 'Configured', target: 'Event module settings', time: '08:42 WIB', type: 'config' },
  { action: 'Deployed', target: 'Portfolio project #042', time: 'Yesterday', type: 'deploy' },
  { action: 'Alert resolved', target: 'High CPU on bay 3', time: 'Yesterday', type: 'alert' },
];

const typeColors: Record<ActivityItem['type'], string> = {
  install: 'text-success',
  update: 'text-info',
  config: 'text-accent',
  alert: 'text-error',
  deploy: 'text-warning',
};

const typeDots: Record<ActivityItem['type'], string> = {
  install: 'bg-success',
  update: 'bg-info',
  config: 'bg-accent',
  alert: 'bg-error',
  deploy: 'bg-warning',
};

export function ActivityPanel({ items = defaultItems, className }: ActivityPanelProps) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-lg border border-subtle-border bg-elevated',
        className
      )}
    >
      <div className="pointer-events-none absolute inset-0 industrial-grid-fine opacity-15" />
      <div className="relative">
        <div className="flex items-center gap-2 border-b border-subtle-border px-4 py-3">
          <Activity className="h-4 w-4 text-accent" />
          <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
            Recent Activity
          </span>
        </div>
        <div className="relative">
          {items.map((item, i) => (
            <div
              key={i}
              className={cn(
                'group flex items-center gap-3 px-4 py-3 transition-colors hover:bg-surface/50',
                i !== items.length - 1 && 'border-b border-subtle-border'
              )}
            >
              <div className={cn('h-2 w-2 shrink-0 rounded-full', typeDots[item.type])} />
              <div className="flex flex-1 items-center justify-between">
                <p className="text-sm">
                  <span className={cn('font-medium', typeColors[item.type])}>
                    {item.action}
                  </span>
                  <span className="text-muted-foreground"> · {item.target}</span>
                </p>
                <span className="ml-3 shrink-0 font-mono text-[10px] text-muted-foreground/60">
                  {item.time}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
