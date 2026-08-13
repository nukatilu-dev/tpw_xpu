'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Grid3X3,
  Calendar,
  Bot,
  Users,
  Cloud,
  Activity,
  Radio,
  Search,
  ExternalLink,
  Briefcase,
} from 'lucide-react';
import PageLayout from '@/components/layout/PageLayout';
import { supabase } from '@/lib/supabase';
import type { App } from '@/lib/types';

const ICON_MAP: Record<string, React.ElementType> = {
  Calendar, Bot, Users, Cloud, Activity, Radio, Grid3X3, Briefcase,
};

const CATEGORIES = ['All', 'AI', 'Productivity', 'Sales', 'Infrastructure', 'DevOps', 'Communication'];

export default function AppsPage() {
  const searchParams = useSearchParams();
  const [apps, setApps] = useState<App[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [category, setCategory] = useState('All');

  useEffect(() => {
    supabase
      .from('apps')
      .select('*')
      .order('sort_order')
      .then(({ data }) => {
        if (data) setApps(data as App[]);
        setLoading(false);
      });
  }, []);

  const filtered = apps.filter((app) => {
    const matchesSearch =
      !search ||
      app.name.toLowerCase().includes(search.toLowerCase()) ||
      (app.description || '').toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === 'All' || app.category === category;
    return matchesSearch && matchesCategory;
  });

  const featured = filtered.filter(a => a.is_featured);
  const rest = filtered.filter(a => !a.is_featured);

  return (
    <PageLayout>
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-8">

        {/* Header */}
        <div className="mb-8">
          <p className="text-xs font-semibold tracking-[0.15em] text-[#555] uppercase mb-1">Platform</p>
          <h1 className="text-2xl font-bold text-white mb-1">Apps Directory</h1>
          <p className="text-sm text-[#555]">All available tools and services in the TPW ecosystem</p>
        </div>

        {/* Search + Filter */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#555]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search apps..."
              className="w-full bg-[#0a0a0a] border border-[#1f1f1f] rounded-md pl-10 pr-4 py-2 text-sm text-white placeholder-[#444] focus:outline-none focus:border-[#ff7a00] focus:ring-1 focus:ring-[#ff7a00]/30"
            />
          </div>
          <div className="flex items-center gap-1 flex-wrap">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  category === cat
                    ? 'bg-[#ff7a00] text-black'
                    : 'bg-[#0a0a0a] border border-[#1f1f1f] text-[#888] hover:text-white hover:border-[#2a2a2a]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-6 h-6 border-2 border-[#ff7a00] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <Grid3X3 className="w-12 h-12 text-[#1f1f1f] mx-auto mb-3" />
            <p className="text-sm text-[#555]">No apps found for &ldquo;{search}&rdquo;</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Featured */}
            {featured.length > 0 && (
              <div>
                <h2 className="text-xs font-semibold tracking-[0.15em] text-[#555] uppercase mb-4">
                  Featured
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {featured.map((app) => <AppCard key={app.id} app={app} />)}
                </div>
              </div>
            )}

            {/* All others */}
            {rest.length > 0 && (
              <div>
                {featured.length > 0 && (
                  <h2 className="text-xs font-semibold tracking-[0.15em] text-[#555] uppercase mb-4">
                    All Apps
                  </h2>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {rest.map((app) => <AppCard key={app.id} app={app} />)}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </PageLayout>
  );
}

function AppCard({ app }: { app: App }) {
  const Icon = ICON_MAP[app.icon || ''] || Grid3X3;
  const isActive = app.status === 'active';
  const href = isActive ? (app.url || '/apps') : '/coming-soon';

  return (
    <Link
      href={href}
      className="group flex flex-col p-5 bg-[#0a0a0a] border border-[#1f1f1f] rounded-lg hover:border-[#2a2a2a] hover:bg-[#111] transition-all"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 bg-[#1a1a1a] rounded-lg flex items-center justify-center">
          <Icon className="w-5 h-5 text-[#ff7a00]" />
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
            isActive
              ? 'text-[#22c55e] bg-[#22c55e]/10'
              : 'text-[#f59e0b] bg-[#f59e0b]/10'
          }`}>
            {isActive ? 'Active' : 'In Development'}
          </span>
          <ExternalLink className="w-3.5 h-3.5 text-[#333] group-hover:text-[#555]" />
        </div>
      </div>
      <div className="flex-1">
        <p className="text-sm font-semibold text-white mb-1">{app.name}</p>
        <p className="text-xs text-[#555] leading-relaxed line-clamp-2">{app.description}</p>
      </div>
      {app.category && (
        <div className="mt-4 pt-3 border-t border-[#1f1f1f]">
          <span className="text-[10px] font-medium text-[#444] uppercase tracking-wider">
            {app.category}
          </span>
        </div>
      )}
    </Link>
  );
}
