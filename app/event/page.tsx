import { ModuleSlot } from '@/components/module-slot';
import { IndustrialPanel } from '@/components/industrial-panel';
import { SectionHeader } from '@/components/section-header';
import { CalendarDays, Plus, Clock, MapPin, Users } from 'lucide-react';
import Link from 'next/link';

const eventSlots = [
  { name: 'TPW Meetup Q3', date: '15 Sep 2026', location: 'Jakarta', attendees: 120, status: 'scheduled' },
  { name: 'Warung Bootcamp', date: '22 Sep 2026', location: 'Bandung', attendees: 45, status: 'scheduled' },
  { name: 'Entrepreneur Summit', date: '10 Oct 2026', location: 'Surabaya', attendees: 300, status: 'draft' },
];

export default function EventPage() {
  return (
    <div className="space-y-8 animate-fade-in">
      <SectionHeader
        badge="Event Bays"
        title="Event"
        subtitle="Scheduled events and available slots. Create new events to mount them into the system."
      />

      {/* Scheduled Events */}
      <IndustrialPanel title="Mounted Events" badge="3 Active" vent scan>
        <div className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-3">
          {eventSlots.map((event) => (
            <div
              key={event.name}
              className="group relative overflow-hidden rounded-lg border border-subtle-border bg-elevated p-4 transition-all hover:border-accent/30"
            >
              <div className="pointer-events-none absolute inset-0 industrial-grid-fine opacity-15" />
              <div className="relative">
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-md border border-subtle-border bg-surface accent-glow-sm">
                    <CalendarDays className="h-5 w-5 text-accent" />
                  </div>
                  <span
                    className={`font-mono text-[10px] uppercase tracking-wider ${
                      event.status === 'scheduled' ? 'text-success' : 'text-muted-foreground'
                    }`}
                  >
                    {event.status}
                  </span>
                </div>
                <h3 className="mt-3 font-display text-sm font-semibold text-foreground">
                  {event.name}
                </h3>
                <div className="mt-3 space-y-2">
                  <div className="flex items-center gap-2 text-xs">
                    <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-muted-foreground">{event.date}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-muted-foreground">{event.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <Users className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      {event.attendees} registered
                    </span>
                  </div>
                </div>
                <div className="mt-3 h-1 overflow-hidden rounded-full bg-surface">
                  <div
                    className="h-full rounded-full bg-accent/40"
                    style={{ width: `${Math.min(event.attendees / 4, 100)}%` }}
                  />
                </div>
              </div>
              <div className="absolute left-1.5 top-1.5 screw" />
              <div className="absolute right-1.5 top-1.5 screw" />
            </div>
          ))}
        </div>
      </IndustrialPanel>

      {/* Available Slots */}
      <IndustrialPanel title="Available Slots" badge="Open" vent>
        <div className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-4">
          <ModuleSlot label="Slot 04" variant="available" size="sm" />
          <ModuleSlot label="Slot 05" variant="available" size="sm" />
          <ModuleSlot label="Slot 06" variant="available" size="sm" />
          <ModuleSlot label="Slot 07" variant="available" size="sm" />
        </div>
      </IndustrialPanel>

      {/* New Event CTA */}
      <div className="flex justify-center pt-4">
        <Link
          href="/apps/event"
          className="group relative flex items-center gap-3 rounded-lg border border-accent/40 bg-accent/10 px-8 py-4 transition-all hover:border-accent hover:accent-glow"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full border border-accent/40 bg-elevated transition-colors group-hover:bg-accent">
            <Plus className="h-4 w-4 text-accent transition-colors group-hover:text-background" />
          </div>
          <div>
            <span className="font-display text-base font-semibold text-foreground">
              New Event
            </span>
            <span className="block font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              Mount a new event into the system
            </span>
          </div>
          <div className="absolute -left-1 -top-1 screw" />
          <div className="absolute -right-1 -top-1 screw" />
          <div className="absolute -bottom-1 -left-1 screw" />
          <div className="absolute -bottom-1 -right-1 screw" />
        </Link>
      </div>
    </div>
  );
}
