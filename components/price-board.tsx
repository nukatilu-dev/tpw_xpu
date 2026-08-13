import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface PriceTier {
  name: string;
  price: string;
  period: string;
  features: string[];
  highlighted?: boolean;
}

interface PriceBoardProps {
  tiers?: PriceTier[];
  className?: string;
}

const defaultTiers: PriceTier[] = [
  {
    name: 'Starter',
    price: 'Rp 0',
    period: '/month',
    features: ['1 Module', 'Community Support', 'Basic Analytics', '100 Transactions'],
  },
  {
    name: 'Business',
    price: 'Rp 299K',
    period: '/month',
    features: ['5 Modules', 'Priority Support', 'Advanced Analytics', 'Unlimited Transactions', 'API Access'],
    highlighted: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    features: ['Unlimited Modules', 'Dedicated Support', 'Custom Integrations', 'On-premise Option', 'SLA 99.9%'],
  },
];

export function PriceBoard({ tiers = defaultTiers, className }: PriceBoardProps) {
  return (
    <div className={cn('grid gap-4 md:grid-cols-3', className)}>
      {tiers.map((tier) => (
        <div
          key={tier.name}
          className={cn(
            'relative overflow-hidden rounded-lg border bg-elevated p-5 transition-all',
            tier.highlighted
              ? 'border-accent/50 accent-glow'
              : 'border-subtle-border hover:border-strong-border'
          )}
        >
          {tier.highlighted && (
            <div className="absolute right-0 top-0 rounded-bl-lg bg-accent px-3 py-1">
              <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-background">
                Recommended
              </span>
            </div>
          )}

          <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-lg">
            <div className="absolute inset-0 industrial-grid-fine opacity-20" />
          </div>

          <div className="relative">
            <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-foreground">
              {tier.name}
            </h3>
            <div className="mt-3 flex items-baseline gap-1">
              <span className="font-display text-3xl font-bold text-foreground">
                {tier.price}
              </span>
              <span className="font-mono text-xs text-muted-foreground">
                {tier.period}
              </span>
            </div>

            <div className="my-4 h-px bg-subtle-border" />

            <ul className="space-y-2.5">
              {tier.features.map((f) => (
                <li key={f} className="flex items-center gap-2">
                  <div
                    className={cn(
                      'flex h-4 w-4 items-center justify-center rounded-full',
                      tier.highlighted ? 'bg-accent/20' : 'bg-surface'
                    )}
                  >
                    <Check
                      className={cn(
                        'h-3 w-3',
                        tier.highlighted ? 'text-accent' : 'text-muted-foreground'
                      )}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground">{f}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="absolute left-1.5 top-1.5 screw" />
          <div className="absolute right-1.5 top-1.5 screw" />
        </div>
      ))}
    </div>
  );
}
