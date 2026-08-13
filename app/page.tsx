'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRight,
  LayoutDashboard,
  Grid3X3,
  Calendar,
  Briefcase,
  FolderKanban,
  Bot,
  Users,
  Cloud,
  Activity,
  Radio,
  Mail,
  Send,
  MessageCircle,
  ExternalLink,
} from 'lucide-react';
import PageLayout from '@/components/layout/PageLayout';
import TPWCloudWidget from '@/components/TPWCloudWidget';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import type { App } from '@/lib/types';

const ICON_MAP: Record<string, React.ElementType> = {
  Calendar, Bot, Users, Cloud, Activity, Radio, LayoutDashboard, Grid3X3, Briefcase,
};

const QUICK_ACCESS = [
  {
    label: 'Dashboard',
    description: 'Overview of your activity and apps',
    href: '/dashboard',
    icon: LayoutDashboard,
    color: 'text-[#ff7a00]',
    bg: 'bg-[#ff7a00]/10',
  },
  {
    label: 'Apps',
    description: 'Browse and launch platform apps',
    href: '/apps',
    icon: Grid3X3,
    color: 'text-[#3b82f6]',
    bg: 'bg-[#3b82f6]/10',
  },
  {
    label: 'Projects',
    description: 'Build automation workflows',
    href: '/projects',
    icon: FolderKanban,
    color: 'text-[#22c55e]',
    bg: 'bg-[#22c55e]/10',
  },
  {
    label: 'Portfolio',
    description: 'Showcase your projects',
    href: '/portfolio',
    icon: Briefcase,
    color: 'text-[#a855f7]',
    bg: 'bg-[#a855f7]/10',
  },
];

export default function HomePage() {
  const { user } = useAuth();
  const [apps, setApps] = useState<App[]>([]);

  useEffect(() => {
    supabase
      .from('apps')
      .select('*')
      .eq('is_featured', true)
      .order('sort_order')
      .limit(6)
      .then(({ data }) => {
        if (data) setApps(data as App[]);
      });
  }, []);

  return (
    <PageLayout>
      {/* Hero */}
      <section className="border-b border-[#1f1f1f]">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-20 md:py-28">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-6">
              <Image src="/tpw_new_0.png" alt="TPW" width={36} height={36} className="rounded-md" />
              <span className="text-xs font-semibold tracking-[0.2em] text-[#ff7a00] uppercase">
                The Portal We
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white leading-[1.1] mb-4">
              Your business<br />
              <span className="text-[#ff7a00]">gateway</span> to everything.
            </h1>
            <p className="text-base text-[#888] mb-8 max-w-lg leading-relaxed">
              A unified platform connecting AI, CRM, projects, cloud infrastructure,
              and collaboration tools — built for teams that move fast.
            </p>
            <div className="flex items-center gap-3 flex-wrap">
              {user ? (
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#ff7a00] text-black text-sm font-semibold rounded-md hover:bg-[#e86e00] transition-colors"
                >
                  Go to Dashboard
                  <ArrowRight className="w-4 h-4" />
                </Link>
              ) : (
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#ff7a00] text-black text-sm font-semibold rounded-md hover:bg-[#e86e00] transition-colors"
                >
                  Get Started
                  <ArrowRight className="w-4 h-4" />
                </Link>
              )}
              <Link
                href="/apps"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#111] text-white text-sm font-medium rounded-md border border-[#1f1f1f] hover:border-[#2a2a2a] hover:bg-[#1a1a1a] transition-colors"
              >
                Browse Apps
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Access */}
      <section className="border-b border-[#1f1f1f]">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-12">
          <h2 className="text-xs font-semibold tracking-[0.15em] text-[#555] uppercase mb-6">
            Quick Access
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {QUICK_ACCESS.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group flex items-start gap-4 p-4 bg-[#0a0a0a] border border-[#1f1f1f] rounded-lg hover:border-[#2a2a2a] hover:bg-[#111] transition-all"
                >
                  <div className={`w-9 h-9 rounded-md flex items-center justify-center shrink-0 ${item.bg}`}>
                    <Icon className={`w-4 h-4 ${item.color}`} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white mb-0.5">{item.label}</p>
                    <p className="text-xs text-[#555] leading-relaxed">{item.description}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Apps + Cloud Status */}
      <section className="border-b border-[#1f1f1f]">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Popular Apps */}
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xs font-semibold tracking-[0.15em] text-[#555] uppercase">
                  Platform Apps
                </h2>
                <Link
                  href="/apps"
                  className="text-xs text-[#ff7a00] hover:text-[#e86e00] flex items-center gap-1 transition-colors"
                >
                  View all <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {apps.map((app) => {
                  const Icon = ICON_MAP[app.icon || ''] || Grid3X3;
                  const isActive = app.status === 'active';
                  return (
                    <Link
                      key={app.id}
                      href={isActive ? (app.url || '/apps') : '/coming-soon'}
                      className="group flex items-start gap-3 p-4 bg-[#0a0a0a] border border-[#1f1f1f] rounded-lg hover:border-[#2a2a2a] hover:bg-[#111] transition-all"
                    >
                      <div className="w-9 h-9 bg-[#1a1a1a] rounded-md flex items-center justify-center shrink-0">
                        <Icon className="w-4 h-4 text-[#ff7a00]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className="text-sm font-medium text-white truncate">{app.name}</p>
                          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full shrink-0 ${
                            isActive
                              ? 'text-[#22c55e] bg-[#22c55e]/10'
                              : 'text-[#f59e0b] bg-[#f59e0b]/10'
                          }`}>
                            {isActive ? 'Active' : 'Dev'}
                          </span>
                        </div>
                        <p className="text-xs text-[#555] leading-relaxed line-clamp-2">
                          {app.description}
                        </p>
                      </div>
                      <ExternalLink className="w-3 h-3 text-[#333] group-hover:text-[#555] shrink-0 mt-0.5" />
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Cloud Status */}
            <div>
              <h2 className="text-xs font-semibold tracking-[0.15em] text-[#555] uppercase mb-6">
                Cloud Status
              </h2>
              <TPWCloudWidget />
            </div>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section>
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h2 className="text-sm font-semibold text-white mb-1">Get in touch</h2>
              <p className="text-sm text-[#555]">Questions or partnership inquiries? Reach us anytime.</p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <a
                href="https://t.me/theportalwe"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-[#0a0a0a] border border-[#1f1f1f] rounded-md text-sm text-[#888] hover:text-white hover:border-[#2a2a2a] transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
                Telegram
              </a>
              <a
                href="https://wa.me/theportalwe"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-[#0a0a0a] border border-[#1f1f1f] rounded-md text-sm text-[#888] hover:text-white hover:border-[#2a2a2a] transition-colors"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                WhatsApp
              </a>
              <a
                href="mailto:hello@theportalwe.com"
                className="flex items-center gap-2 px-4 py-2 bg-[#ff7a00] rounded-md text-sm text-black font-medium hover:bg-[#e86e00] transition-colors"
              >
                <Mail className="w-3.5 h-3.5" />
                Email Us
              </a>
            </div>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
