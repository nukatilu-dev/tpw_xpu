import { cn } from '@/lib/utils';
import { Radio } from 'lucide-react';

interface NewsItem {
  title: string;
  category: string;
  time: string;
}

interface NewsFeedProps {
  items?: NewsItem[];
  className?: string;
}

const defaultItems: NewsItem[] = [
  { title: 'TPW Warung v2.4 released with inventory forecasting', category: 'Update', time: '2h ago' },
  { title: 'New module: TPW Media entering beta testing phase', category: 'Beta', time: '5h ago' },
  { title: 'Q3 entrepreneur meetup registration now open', category: 'Event', time: '1d ago' },
  { title: 'System maintenance scheduled for Sunday 02:00 WIB', category: 'System', time: '2d ago' },
  { title: 'API rate limits increased for Business tier users', category: 'Update', time: '3d ago' },
];

const categoryColors: Record<string, string> = {
  Update: 'text-info',
  Beta: 'text-accent',
  Event: 'text-success',
  System: 'text-warning',
};

export function NewsFeed({ items = defaultItems, className }: NewsFeedProps) {
  return (
    <div className={cn('relative overflow-hidden rounded-lg border border-subtle-border bg-elevated', className)}>
      <div className="pointer-events-none absolute inset-0 industrial-grid-fine opacity-15" />
      <div className="relative">
        <div className="flex items-center gap-2 border-b border-subtle-border px-4 py-3">
          <Radio className="h-4 w-4 text-accent" />
          <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
            Live Feed
          </span>
          <div className="ml-auto h-2 w-2 rounded-full bg-accent led-pulse" />
        </div>
        <div className="relative divide-y divide-subtle-border">
          {items.map((item, i) => (
            <div
              key={i}
              className="group flex items-start gap-3 px-4 py-3 transition-colors hover:bg-surface/50"
            >
              <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent/40" />
              <div className="flex-1">
                <p className="text-sm text-foreground transition-colors group-hover:text-accent">
                  {item.title}
                </p>
                <div className="mt-1 flex items-center gap-2">
                  <span
                    className={cn(
                      'font-mono text-[10px] uppercase tracking-wider',
                      categoryColors[item.category] ?? 'text-muted-foreground'
                    )}
                  >
                    {item.category}
                  </span>
                  <span className="font-mono text-[10px] text-muted-foreground/60">
                    {item.time}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
