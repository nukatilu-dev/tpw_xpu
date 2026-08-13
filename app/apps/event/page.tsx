import { IndustrialPanel } from '@/components/industrial-panel';
import { SectionHeader } from '@/components/section-header';
import { CalendarPlus, ArrowLeft, Construction } from 'lucide-react';
import Link from 'next/link';

export default function EventBuilderPage() {
  return (
    <div className="space-y-8 animate-fade-in">
      <SectionHeader
        badge="Module Bay — Event Builder"
        title="New Event"
        subtitle="This module bay is reserved for event creation. The event management interface will be mounted here."
      />

      <IndustrialPanel title="Under Construction" badge="Reserved Bay" vent scan>
        <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
          <div className="relative mb-6">
            <div className="flex h-20 w-20 items-center justify-center rounded-lg border border-subtle-border bg-elevated accent-glow">
              <Construction className="h-10 w-10 text-accent" />
            </div>
            <div className="absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-background bg-warning led-pulse" />
          </div>

          <h2 className="font-display text-xl font-semibold text-foreground">
            Event Module Not Yet Installed
          </h2>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            This bay is reserved for the TPW Event builder. The full event creation
            interface — ticketing, registration, scheduling — will be mounted here in a
            future update.
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/event"
              className="flex items-center gap-2 rounded-lg border border-subtle-border bg-elevated px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:border-accent/40"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Events
            </Link>
            <div className="flex items-center gap-2 rounded-lg border border-accent/30 bg-accent/10 px-5 py-2.5 text-sm font-medium text-accent">
              <CalendarPlus className="h-4 w-4" />
              Notify Me When Ready
            </div>
          </div>

          <div className="mt-8 flex items-center gap-6 rounded-lg border border-subtle-border bg-panel px-6 py-3">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-warning led-pulse" />
              <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                Status: In Development
              </span>
            </div>
            <div className="h-4 w-px bg-subtle-border" />
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                ETA: Q4 2026
              </span>
            </div>
          </div>
        </div>
      </IndustrialPanel>
    </div>
  );
}
