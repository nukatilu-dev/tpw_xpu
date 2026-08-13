import { cn } from '@/lib/utils';
import { Plus } from 'lucide-react';

interface ModuleSlotProps {
  variant?: 'empty' | 'available';
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function ModuleSlot({
  variant = 'empty',
  label = 'Empty Bay',
  size = 'md',
  className,
}: ModuleSlotProps) {
  const heights = {
    sm: 'h-32',
    md: 'h-44',
    lg: 'h-56',
  };

  return (
    <div
      className={cn(
        'group relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-subtle-border bg-elevated/30 transition-all hover:border-accent/40 hover:bg-elevated/50',
        heights[size],
        className
      )}
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-lg">
        <div className="absolute inset-0 industrial-grid-fine opacity-30" />
      </div>

      <div className="relative flex flex-col items-center gap-3">
        <div
          className={cn(
            'flex items-center justify-center rounded-full border border-subtle-border bg-elevated transition-colors group-hover:border-accent/40',
            size === 'lg' ? 'h-14 w-14' : 'h-10 w-10'
          )}
        >
          <Plus
            className={cn(
              'text-muted-foreground transition-colors group-hover:text-accent',
              size === 'lg' ? 'h-6 w-6' : 'h-5 w-5'
            )}
          />
        </div>
        <div className="text-center">
          <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
            {label}
          </p>
          {variant === 'available' && (
            <p className="mt-1 font-mono text-[10px] text-accent/60">
              Available for install
            </p>
          )}
        </div>
      </div>

      <div className="absolute left-2 top-2 h-1.5 w-1.5 rounded-full bg-muted-foreground/30" />
      <div className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-muted-foreground/30" />
      <div className="absolute bottom-2 left-2 h-1.5 w-1.5 rounded-full bg-muted-foreground/30" />
      <div className="absolute bottom-2 right-2 h-1.5 w-1.5 rounded-full bg-muted-foreground/30" />
    </div>
  );
}
