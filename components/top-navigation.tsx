'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { LayoutDashboard, Grid3x3, FolderKanban, CalendarDays, LifeBuoy, User, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { label: 'Dashboard', href: '/', icon: LayoutDashboard },
  { label: 'Apps', href: '/apps', icon: Grid3x3 },
  { label: 'Portfolio', href: '/portfolio', icon: FolderKanban },
  { label: 'Event', href: '/event', icon: CalendarDays },
  { label: 'Support', href: '/support', icon: LifeBuoy },
];

export function TopNavigation() {
  const pathname = usePathname();
  const [lang, setLang] = useState<'EN' | 'ID'>('EN');

  return (
    <header className="sticky top-0 z-50 w-full">
      <div className="metal-surface border-b border-subtle-border">
        <div className="h-1 vent-strip opacity-40" />
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="group flex items-center gap-3">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-md border border-subtle-border bg-elevated accent-glow-sm transition-transform group-hover:scale-105">
              <div className="absolute inset-1 rounded-sm border border-accent/30" />
              <span className="font-display text-lg font-bold tracking-tighter text-accent">
                T
              </span>
              <div className="absolute -right-0.5 -top-0.5 h-1.5 w-1.5 rounded-full bg-success led-pulse" />
            </div>
            <div className="hidden flex-col sm:flex">
              <span className="font-display text-base font-bold tracking-tight text-foreground">
                TPW
              </span>
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                Modular Systems
              </span>
            </div>
          </Link>

          <nav className="flex items-center gap-1">
            {navItems.map((item) => {
              const isActive =
                item.href === '/'
                  ? pathname === '/'
                  : pathname.startsWith(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'group relative flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-all sm:px-4',
                    isActive
                      ? 'bg-elevated text-accent'
                      : 'text-muted-foreground hover:bg-elevated/50 hover:text-foreground'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden md:inline">{item.label}</span>
                  {isActive && (
                    <span className="absolute -bottom-[1px] left-1/2 h-0.5 w-8 -translate-x-1/2 rounded-full bg-accent accent-glow-sm" />
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            {/* Language Toggle */}
            <button
              onClick={() => setLang(lang === 'EN' ? 'ID' : 'EN')}
              className="group flex items-center gap-1.5 rounded-md border border-subtle-border bg-elevated px-2.5 py-1.5 transition-colors hover:border-accent/40"
              aria-label="Toggle language"
            >
              <Globe className="h-3.5 w-3.5 text-muted-foreground transition-colors group-hover:text-accent" />
              <span className="font-mono text-xs font-semibold text-muted-foreground transition-colors group-hover:text-accent">
                {lang}
              </span>
            </button>

            {/* Sign In / Profile */}
            <Link
              href="/profile"
              className="group flex items-center gap-1.5 rounded-md border border-subtle-border bg-elevated px-3 py-1.5 transition-colors hover:border-accent/40"
            >
              <div className="flex h-5 w-5 items-center justify-center rounded-full border border-subtle-border bg-surface">
                <User className="h-3 w-3 text-muted-foreground transition-colors group-hover:text-accent" />
              </div>
              <span className="hidden font-mono text-xs font-medium text-muted-foreground transition-colors group-hover:text-accent sm:inline">
                Sign In
              </span>
            </Link>

            <div className="hidden items-center gap-2 rounded-md border border-subtle-border bg-elevated px-3 py-1.5 lg:flex">
              <div className="h-2 w-2 rounded-full bg-success led-pulse" />
              <span className="font-mono text-xs text-muted-foreground">
                SYS ONLINE
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
