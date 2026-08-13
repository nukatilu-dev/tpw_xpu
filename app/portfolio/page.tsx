'use client';

import { useEffect, useState } from 'react';
import { ExternalLink, Github, Tag, Briefcase, MapPin, Globe2 } from 'lucide-react';
import PageLayout from '@/components/layout/PageLayout';
import { supabase } from '@/lib/supabase';
import { useI18n } from '@/context/I18nContext';
import type { PortfolioProject } from '@/lib/types';

const SAMPLE_PROJECTS: PortfolioProject[] = [
  {
    id: 'sample-1',
    title: 'TPW Event Platform',
    description: 'Full-stack event management system with real-time updates, ticketing, and multi-channel broadcasting.',
    tags: ['Next.js', 'Supabase', 'TypeScript'],
    image_url: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=600',
    project_url: null,
    github_url: null,
    category: 'Platform',
    featured: true,
    sort_order: 1,
    created_at: new Date().toISOString(),
  },
  {
    id: 'sample-2',
    title: 'AI Automation Pipeline',
    description: 'N8N-powered automation workflows connecting CRM, Telegram, WhatsApp, and email channels.',
    tags: ['N8N', 'API', 'Automation'],
    image_url: 'https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=600',
    project_url: null,
    github_url: null,
    category: 'AI',
    featured: true,
    sort_order: 2,
    created_at: new Date().toISOString(),
  },
  {
    id: 'sample-3',
    title: 'Enterprise CRM',
    description: 'Custom CRM solution with pipeline management, contact tracking, and deal forecasting dashboards.',
    tags: ['CRM', 'PostgreSQL', 'React'],
    image_url: 'https://images.pexels.com/photos/3184338/pexels-photo-3184338.jpeg?auto=compress&cs=tinysrgb&w=600',
    project_url: null,
    github_url: null,
    category: 'Sales',
    featured: false,
    sort_order: 3,
    created_at: new Date().toISOString(),
  },
  {
    id: 'sample-4',
    title: 'Cloud Monitoring Dashboard',
    description: 'Real-time infrastructure monitoring with alerting, uptime tracking, and performance analytics.',
    tags: ['DevOps', 'Monitoring', 'Dashboard'],
    image_url: 'https://images.pexels.com/photos/1181467/pexels-photo-1181467.jpeg?auto=compress&cs=tinysrgb&w=600',
    project_url: null,
    github_url: null,
    category: 'DevOps',
    featured: false,
    sort_order: 4,
    created_at: new Date().toISOString(),
  },
  {
    id: 'sample-5',
    title: 'Broadcast System',
    description: 'Multi-channel broadcast engine delivering messages across Telegram, WhatsApp and Email at scale.',
    tags: ['Messaging', 'API', 'Node.js'],
    image_url: 'https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&cs=tinysrgb&w=600',
    project_url: null,
    github_url: null,
    category: 'Communication',
    featured: false,
    sort_order: 5,
    created_at: new Date().toISOString(),
  },
  {
    id: 'sample-6',
    title: 'TPW Portal Framework',
    description: 'The Portal We core framework — a modular enterprise SaaS shell with auth, navigation, and plugin support.',
    tags: ['Framework', 'TypeScript', 'Supabase'],
    image_url: 'https://images.pexels.com/photos/574071/pexels-photo-574071.jpeg?auto=compress&cs=tinysrgb&w=600',
    project_url: null,
    github_url: null,
    category: 'Platform',
    featured: true,
    sort_order: 6,
    created_at: new Date().toISOString(),
  },
];

type Partner = {
  name: string;
  city: string;
  country: string;
  x: number;
  y: number;
  type: 'technology' | 'business' | 'community';
};

const PARTNERS: Partner[] = [
  { name: 'PT Digital Nusantara', city: 'Jakarta', country: 'Indonesia', x: 82.5, y: 62, type: 'technology' },
  { name: 'SingTech Solutions', city: 'Singapore', country: 'Singapore', x: 81.8, y: 60.5, type: 'business' },
  { name: 'Tokyo AI Labs', city: 'Tokyo', country: 'Japan', x: 88.5, y: 41, type: 'technology' },
  { name: 'Nusantara Cloud', city: 'Bandung', country: 'Indonesia', x: 82.3, y: 62.5, type: 'technology' },
  { name: 'Sydney Dev Hub', city: 'Sydney', country: 'Australia', x: 94, y: 82, type: 'community' },
  { name: 'Dubai Tech Partners', city: 'Dubai', country: 'UAE', x: 65, y: 50, type: 'business' },
  { name: 'Berlin Innovation', city: 'Berlin', country: 'Germany', x: 54, y: 35, type: 'technology' },
  { name: 'London Bridge Tech', city: 'London', country: 'UK', x: 50, y: 33, type: 'business' },
  { name: 'Silicon Valley Ventures', city: 'San Francisco', country: 'USA', x: 18, y: 42, type: 'business' },
  { name: 'Sao Paulo Digital', city: 'São Paulo', country: 'Brazil', x: 35, y: 75, type: 'community' },
  { name: 'Mumbai Connect', city: 'Mumbai', country: 'India', x: 73, y: 52, type: 'technology' },
  { name: 'Lagos Tech Hub', city: 'Lagos', country: 'Nigeria', x: 53, y: 60, type: 'community' },
];

const PARTNER_COLORS: Record<Partner['type'], string> = {
  technology: '#ff7a00',
  business: '#22c55e',
  community: '#3b82f6',
};

export default function PortfolioPage() {
  const { t } = useI18n();
  const [projects, setProjects] = useState<PortfolioProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [hoveredPartner, setHoveredPartner] = useState<Partner | null>(null);

  useEffect(() => {
    supabase
      .from('portfolio_projects')
      .select('*')
      .order('sort_order')
      .then(({ data }) => {
        if (data && data.length > 0) {
          setProjects(data as PortfolioProject[]);
        } else {
          setProjects(SAMPLE_PROJECTS);
        }
        setLoading(false);
      });
  }, []);

  const categories = ['All', ...Array.from(new Set(projects.map(p => p.category).filter(Boolean) as string[]))];
  const filtered = filter === 'All' ? projects : projects.filter(p => p.category === filter);

  return (
    <PageLayout>
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-8">

        {/* Header */}
        <div className="mb-8">
          <p className="text-xs font-semibold tracking-[0.15em] text-[#555] uppercase mb-1">Work</p>
          <h1 className="text-2xl font-bold text-white mb-1">{t('portfolio.title')}</h1>
          <p className="text-sm text-[#555]">{t('portfolio.subtitle')}</p>
        </div>

        {/* Partner Map */}
        <div className="mb-10 relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0a0a0a] to-[#0d0d0d] border border-[#1f1f1f]">
          <div className="p-5 border-b border-[#1f1f1f]">
            <div className="flex items-center gap-2 mb-1">
              <Globe2 className="w-4 h-4 text-[#ff7a00]" />
              <h2 className="text-sm font-semibold text-white">{t('portfolio.partners')}</h2>
            </div>
            <p className="text-xs text-[#555]">{t('portfolio.partnersDesc')}</p>
          </div>

          {/* Map */}
          <div className="relative aspect-[2/1] w-full bg-[#050505]">
            {/* World map image as base */}
            <img
              src="https://images.pexels.com/photos/41949/earth-earth-at-night-night-lights-41949.jpeg?auto=compress&cs=tinysrgb&w=1200"
              alt="World map"
              className="absolute inset-0 w-full h-full object-cover opacity-40"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/50" />

            {/* Partner pins */}
            {PARTNERS.map((partner) => (
              <div
                key={partner.name}
                className="absolute group cursor-pointer"
                style={{ left: `${partner.x}%`, top: `${partner.y}%` }}
                onMouseEnter={() => setHoveredPartner(partner)}
                onMouseLeave={() => setHoveredPartner(null)}
              >
                {/* Pulse ring */}
                <span
                  className="absolute -inset-2 rounded-full animate-ping opacity-20"
                  style={{ backgroundColor: PARTNER_COLORS[partner.type] }}
                />
                {/* Pin dot */}
                <span
                  className="relative block w-2.5 h-2.5 rounded-full border-2 border-black/50 transition-transform group-hover:scale-150"
                  style={{ backgroundColor: PARTNER_COLORS[partner.type] }}
                />
              </div>
            ))}

            {/* Hovered partner tooltip */}
            {hoveredPartner && (
              <div
                className="absolute z-10 pointer-events-none"
                style={{
                  left: `${hoveredPartner.x}%`,
                  top: `${hoveredPartner.y}%`,
                  transform: 'translate(-50%, -130%)',
                }}
              >
                <div className="bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg px-3 py-2 shadow-xl whitespace-nowrap">
                  <p className="text-xs font-semibold text-white">{hoveredPartner.name}</p>
                  <p className="text-[10px] text-[#555] flex items-center gap-1 mt-0.5">
                    <MapPin className="w-2.5 h-2.5" />
                    {hoveredPartner.city}, {hoveredPartner.country}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 px-5 py-3 border-t border-[#1f1f1f] flex-wrap">
            <LegendDot color={PARTNER_COLORS.technology} label={t('portfolio.partners') === 'Mitra TPW' ? 'Teknologi' : 'Technology'} />
            <LegendDot color={PARTNER_COLORS.business} label={t('portfolio.partners') === 'Mitra TPW' ? 'Bisnis' : 'Business'} />
            <LegendDot color={PARTNER_COLORS.community} label={t('portfolio.partners') === 'Mitra TPW' ? 'Komunitas' : 'Community'} />
            <span className="text-[10px] text-[#444] ml-auto">{PARTNERS.length} partners worldwide</span>
          </div>
        </div>

        {/* Category filter */}
        <div className="flex items-center gap-2 mb-8 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                filter === cat
                  ? 'bg-[#ff7a00] text-black'
                  : 'bg-[#0a0a0a] border border-[#1f1f1f] text-[#888] hover:text-white hover:border-[#2a2a2a]'
              }`}
            >
              {cat === 'All' ? t('portfolio.all') : cat}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-6 h-6 border-2 border-[#ff7a00] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((project) => (
              <div
                key={project.id}
                className="group bg-[#0a0a0a] border border-[#1f1f1f] rounded-lg overflow-hidden hover:border-[#2a2a2a] transition-all"
              >
                {/* Image */}
                {project.image_url && (
                  <div className="aspect-[16/9] overflow-hidden bg-[#111]">
                    <img
                      src={project.image_url}
                      alt={project.title}
                      className="w-full h-full object-cover opacity-70 group-hover:opacity-85 transition-opacity"
                    />
                  </div>
                )}

                <div className="p-5">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="text-sm font-semibold text-white leading-snug">{project.title}</h3>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {project.github_url && (
                        <a
                          href={project.github_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#555] hover:text-white transition-colors"
                        >
                          <Github className="w-3.5 h-3.5" />
                        </a>
                      )}
                      {project.project_url && (
                        <a
                          href={project.project_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#555] hover:text-[#ff7a00] transition-colors"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  </div>

                  {project.description && (
                    <p className="text-xs text-[#555] leading-relaxed line-clamp-2 mb-3">
                      {project.description}
                    </p>
                  )}

                  {project.tags && project.tags.length > 0 && (
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {project.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="flex items-center gap-1 text-[10px] font-medium text-[#555] bg-[#111] border border-[#1f1f1f] px-2 py-0.5 rounded-full"
                        >
                          <Tag className="w-2.5 h-2.5" />
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {filtered.length === 0 && !loading && (
          <div className="text-center py-20">
            <Briefcase className="w-12 h-12 text-[#1f1f1f] mx-auto mb-3" />
            <p className="text-sm text-[#555]">{t('portfolio.empty')}</p>
          </div>
        )}
      </div>
    </PageLayout>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
      <span className="text-[10px] text-[#555] font-medium">{label}</span>
    </div>
  );
}
