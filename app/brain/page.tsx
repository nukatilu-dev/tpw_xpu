'use client';

import { useState } from 'react';
import {
  Brain,
  Palette,
  Layout,
  Shield,
  Database,
  Layers,
  Navigation,
  Activity,
  Workflow,
  ChevronRight,
  ChevronDown,
  Copy,
  Check,
  Crown,
  User,
  Users,
  Eye,
  Lock,
  Zap,
} from 'lucide-react';
import PageLayout from '@/components/layout/PageLayout';
import DevelopmentPage from '@/app/development/page';
import { BrainPermitEditor } from '@/components/brain/BrainPermitEditor';

type Section =
  | 'design'
  | 'layout'
  | 'roles'
  | 'apps'
  | 'projects'
  | 'navigation'
  | 'database'
  | 'features'
  | 'permits'
  | 'development';

const SECTIONS: { id: Section; label: string; icon: React.ReactNode }[] = [
  { id: 'design', label: 'Design System', icon: <Palette className="w-4 h-4" /> },
  { id: 'layout', label: 'Page Layout', icon: <Layout className="w-4 h-4" /> },
  { id: 'roles', label: 'Roles & Access', icon: <Shield className="w-4 h-4" /> },
  { id: 'apps', label: 'App Page Rules', icon: <Layers className="w-4 h-4" /> },
  { id: 'projects', label: 'Project Page Rules', icon: <Workflow className="w-4 h-4" /> },
  { id: 'navigation', label: 'Navigation Rules', icon: <Navigation className="w-4 h-4" /> },
  { id: 'database', label: 'Database & RLS', icon: <Database className="w-4 h-4" /> },
  { id: 'features', label: 'Feature Matrix', icon: <Zap className="w-4 h-4" /> },
  { id: 'permits', label: 'Brain Permit Editor', icon: <Shield className="w-4 h-4" /> },
  { id: 'development', label: 'Development', icon: <Activity className="w-4 h-4" /> },
];

export default function BrainPage() {
  const [active, setActive] = useState<Section>('design');
  const [copied, setCopied] = useState<string | null>(null);

  function copy(text: string, id: string) {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  }

  return (
    <PageLayout>
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-8">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-1">
            <Brain className="w-4 h-4 text-[#ff7a00]" />
            <p className="text-xs font-semibold tracking-[0.15em] text-[#555] uppercase">
              Brain
            </p>
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">
            Platform Rules & Standards
          </h1>
          <p className="text-sm text-[#555]">
            Canonical reference for design, structure, roles, and rules that every app and project page must follow
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">

          {/* Sidebar nav */}
          <aside className="lg:w-56 shrink-0">
            <nav className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
              {SECTIONS.map(s => (
                <button
                  key={s.id}
                  onClick={() => setActive(s.id)}
                  className={`flex items-center gap-2.5 px-3 py-2 text-sm font-medium rounded-md whitespace-nowrap transition-colors ${
                    active === s.id
                      ? 'bg-[#ff7a00]/10 text-[#ff7a00] border border-[#ff7a00]/30'
                      : 'text-[#888] hover:text-white hover:bg-[#111] border border-transparent'
                  }`}
                >
                  {s.icon}
                  <span className="hidden sm:inline">{s.label}</span>
                </button>
              ))}
            </nav>
          </aside>

          {/* Content */}
          <div className="flex-1 min-w-0">

            {/* DESIGN SYSTEM */}
            {active === 'design' && (
              <div className="space-y-6">
                <SectionTitle
                  icon={<Palette className="w-4 h-4" />}
                  title="Design System"
                  subtitle="Colors, typography, spacing, and components that define the TPW visual identity"
                />

                <RuleCard title="Color System">
                  <div className="space-y-3">
                    <ColorRow name="--tpw-orange" value="#ff7a00" usage="Primary accent, active states, CTAs" />
                    <ColorRow name="--tpw-orange-hover" value="#e86e00" usage="Hover state for orange buttons" />
                    <ColorRow name="--tpw-surface" value="#0a0a0a" usage="Card backgrounds, input fields" />
                    <ColorRow name="--tpw-surface-2" value="#111111" usage="Hover states, secondary cards" />
                    <ColorRow name="--tpw-surface-3" value="#1a1a1a" usage="Icon containers, active tabs" />
                    <ColorRow name="--tpw-border" value="#1f1f1f" usage="Default borders, dividers" />
                    <ColorRow name="--tpw-border-strong" value="#2a2a2a" usage="Hover borders" />
                    <ColorRow name="--tpw-text-muted" value="#888888" usage="Secondary text, labels" />
                    <ColorRow name="--tpw-text-subtle" value="#555555" usage="Tertiary text, hints" />
                    <ColorRow name="--tpw-success" value="#22c55e" usage="Active status, success messages" />
                    <ColorRow name="--tpw-warning" value="#f59e0b" usage="Pending status, warnings" />
                    <ColorRow name="--tpw-error" value="#ef4444" usage="Error states, destructive actions" />
                    <ColorRow name="--tpw-info" value="#3b82f6" usage="Info badges, neutral highlights" />
                  </div>
                </RuleCard>

                <RuleCard title="Typography Rules">
                  <div className="space-y-3">
                    <TypeRow label="Page Title" spec="text-2xl font-bold text-white" />
                    <TypeRow label="Section Header" spec="text-sm font-semibold text-white" />
                    <TypeRow label="Section Label" spec="text-xs font-semibold tracking-[0.15em] text-[#555] uppercase" />
                    <TypeRow label="Body Text" spec="text-sm text-[#888]" />
                    <TypeRow label="Hint Text" spec="text-[10px] text-[#444]" />
                    <TypeRow label="Badge" spec="text-[10px] font-medium px-2 py-0.5 rounded-full" />
                    <TypeRow label="Button" spec="text-sm font-semibold" />
                  </div>

                  <div className="mt-4 p-3 bg-[#050505] border border-[#1f1f1f] rounded-md">
                    <p className="text-[10px] text-[#444] mb-2">Rules</p>
                    <ul className="space-y-1 text-xs text-[#888]">
                      <li>• Max 3 font weights: normal (400), medium (500), bold (700)</li>
                      <li>• Body line-height: 150% (1.5)</li>
                      <li>• Heading line-height: 120% (1.2)</li>
                      <li>• Section labels always uppercase with letter-spacing</li>
                      <li>• Never use font sizes below 10px except for fine print</li>
                    </ul>
                  </div>
                </RuleCard>

                <RuleCard title="Spacing System (8px grid)">
                  <div className="space-y-2">
                    {[
                      { name: '2px', usage: 'Fine borders, tight gaps' },
                      { name: '4px', usage: 'Icon gaps, small padding' },
                      { name: '8px', usage: 'Base unit, button padding, card gaps' },
                      { name: '12px', usage: 'Input padding, list items' },
                      { name: '16px', usage: 'Card padding, section gaps' },
                      { name: '24px', usage: 'Major section gaps' },
                      { name: '32px', usage: 'Page section spacing' },
                      { name: '48px', usage: 'Large vertical rhythm' },
                    ].map(s => (
                      <div key={s.name} className="flex items-center gap-3">
                        <div className="w-16 text-xs text-[#888] font-mono">{s.name}</div>
                        <div
                          className="flex-1 h-6 bg-[#ff7a00]/10 border border-[#ff7a00]/20 rounded-sm"
                          style={{ width: `calc(${s.name} * 3)` }}
                        />
                        <span className="text-[10px] text-[#555] w-48 text-right">
                          {s.usage}
                        </span>
                      </div>
                    ))}
                  </div>
                </RuleCard>

                <RuleCard title="Core Components">
                  <div className="space-y-4">
                    <ComponentSpec
                      name="tpw-input"
                      usage="All text inputs, textareas, selects"
                      code="bg-[#0a0a0a] border border-[#1f1f1f] rounded-md px-3 py-2 text-sm text-white placeholder-[#444] focus:border-[#ff7a00] focus:ring-1 focus:ring-[#ff7a00]/30"
                    />
                    <ComponentSpec
                      name="Primary Button"
                      usage="CTAs, submit actions"
                      code="bg-[#ff7a00] text-black text-sm font-semibold rounded-md hover:bg-[#e86e00] transition-colors"
                    />
                    <ComponentSpec
                      name="Secondary Button"
                      usage="Cancel, guest, secondary actions"
                      code="bg-[#0a0a0a] border border-[#1f1f1f] text-[#888] rounded-md hover:text-white hover:border-[#2a2a2a] transition-colors"
                    />
                    <ComponentSpec
                      name="Card"
                      usage="Content containers, list items"
                      code="bg-[#0a0a0a] border border-[#1f1f1f] rounded-lg hover:border-[#2a2a2a] transition-all"
                    />
                    <ComponentSpec
                      name="Badge"
                      usage="Status indicators, feature tags"
                      code="text-[10px] font-medium px-2 py-0.5 rounded-full"
                    />
                    <ComponentSpec
                      name="Tab Button"
                      usage="View toggles, category filters"
                      code="px-3 py-1.5 text-xs font-medium rounded-md transition-colors"
                    />
                  </div>
                </RuleCard>
              </div>
            )}

            {/* PAGE LAYOUT */}
            {active === 'layout' && (
              <div className="space-y-6">
                <SectionTitle
                  icon={<Layout className="w-4 h-4" />}
                  title="Page Layout Rules"
                  subtitle="Every page must follow this structural template"
                />

                <RuleCard title="Mandatory Structure">
                  <div className="space-y-3">
                    <StructureStep num={1} text="Wrap entire page in <PageLayout>" code="<PageLayout> ... </PageLayout>" />
                    <StructureStep num={2} text="Container: max-w-[1400px] mx-auto px-4 sm:px-6 py-8" />
                    <StructureStep num={3} text="Header section: label (uppercase, tracked) + title (2xl bold) + subtitle (sm muted)" />
                    <StructureStep num={4} text="Content area with consistent spacing (space-y-6 or space-y-8)" />
                    <StructureStep num={5} text="Loading state: centered spinner (border-2 border-[#ff7a00] border-t-transparent)" />
                    <StructureStep num={6} text="Empty state: centered icon + title + description" />
                    <StructureStep num={7} text="Error state: red-tinted alert box (bg-[#ef4444]/10 border-[#ef4444]/20)" />
                  </div>
                </RuleCard>

                <RuleCard title="Header Pattern (every page)">
                  <div className="bg-[#050505] border border-[#1f1f1f] rounded-md p-4 font-mono text-[10px] text-[#888] overflow-x-auto">
                    <pre>{`<div className="mb-8">
  <p className="text-xs font-semibold tracking-[0.15em] text-[#555] uppercase mb-1">
    Section Label
  </p>
  <h1 className="text-2xl font-bold text-white mb-1">Page Title</h1>
  <p className="text-sm text-[#555]">Subtitle description</p>
</div>`}</pre>
                  </div>

                  <button
                    onClick={() => copy('header-pattern', 'header-pattern')}
                    className="mt-2 flex items-center gap-1 text-[10px] text-[#555] hover:text-[#888] transition-colors"
                  >
                    {copied === 'header-pattern'
                      ? <Check className="w-3 h-3" />
                      : <Copy className="w-3 h-3" />}
                    Copy template
                  </button>
                </RuleCard>

                <RuleCard title="Responsive Breakpoints">
                  <div className="space-y-2">
                    <BreakpointRow name="mobile" spec="< 640px" usage="Single column, stacked cards, hamburger menu" />
                    <BreakpointRow name="sm" spec=">= 640px" usage="2-column grids, show secondary text" />
                    <BreakpointRow name="md" spec=">= 768px" usage="Search bar visible, 3-column grids" />
                    <BreakpointRow name="lg" spec=">= 1024px" usage="Full nav visible, sidebar layouts, 4+ columns" />
                    <BreakpointRow name="xl" spec=">= 1280px" usage="Max content width (1400px container)" />
                  </div>
                </RuleCard>

                <RuleCard title="Animation & Transitions">
                  <div className="space-y-2">
                    <SpecRow label="Hover transitions" value="transition-colors or transition-all (150ms)" />
                    <SpecRow label="Modals" value="bg-black/80 backdrop, max-w-sm or max-w-2xl, rounded-xl" />
                    <SpecRow label="Spinners" value="border-2 border-[#ff7a00] border-t-transparent rounded-full animate-spin" />
                    <SpecRow label="Dropdowns" value="absolute right-0 top-full mt-1, bg-[#0a0a0a] border-[#1f1f1f] rounded-lg shadow-xl" />
                    <SpecRow label="Cards" value="hover:border-[#2a2a2a] hover:bg-[#111] transition-all" />
                  </div>
                </RuleCard>
              </div>
            )}

            {/* ROLES & ACCESS */}
            {active === 'roles' && (
              <div className="space-y-6">
                <SectionTitle
                  icon={<Shield className="w-4 h-4" />}
                  title="Roles & Access Control"
                  subtitle="User roles, permissions, and access rules across the platform"
                />

                <RuleCard title="Role Hierarchy">
                  <div className="space-y-3">
                    <RoleCard
                      icon={<Eye className="w-4 h-4" />}
                      name="Guest"
                      color="#555"
                      permissions={[
                        'View public home page',
                        'View public system metrics',
                        'View public services and pricing',
                        'Access login and sign-in pages',
                        'No authenticated workspace access',
                        'No data persistence',
                      ]}
                    />

                    <RoleCard
                      icon={<User className="w-4 h-4" />}
                      name="User"
                      color="#888"
                      permissions={[
                        'Access authenticated workspace',
                        'Create project automations',
                        'Manage own profile',
                        'View own activity log',
                        'Submit support tickets',
                        'Use credit tokens',
                      ]}
                    />

                    <RoleCard
                      icon={<Users className="w-4 h-4" />}
                      name="Admin"
                      color="#3b82f6"
                      permissions={[
                        'All User permissions',
                        'Review pending automations',
                        'Approve/reject custom tier requests',
                        'View all automations',
                        'Manage admin connections',
                        'View platform statistics',
                        'Access admin-only functions',
                      ]}
                    />

                    <RoleCard
                      icon={<Crown className="w-4 h-4" />}
                      name="Super Admin"
                      color="#ff7a00"
                      permissions={[
                        'All Admin permissions',
                        'Configure external connections (N8N, DB, API)',
                        'Manage admin_connections table',
                        'Set is_admin on profiles',
                        'Full CRUD on admin_connections',
                        'Access internal Brain page',
                        'Access internal Development page',
                        'Access internal Reference page',
                      ]}
                    />
                  </div>
                </RuleCard>

                <RuleCard title="Access Rules by Page">
                  <div className="space-y-2">
                    <AccessRow
                      page="/"
                      access="Public"
                      roles="Guest, User, Admin, Super Admin"
                    />

                    <AccessRow
                      page="/login"
                      access="Public (canonical)"
                      roles="Unauthenticated users"
                    />

                    <AccessRow
                      page="/sign-in"
                      access="Legacy redirect"
                      roles="Existing bookmarks and direct URLs"
                    />

                    <AccessRow
                      page="/dashboard"
                      access="Authenticated"
                      roles="User, Admin, Super Admin"
                    />

                    <AccessRow
                      page="/apps"
                      access="Authenticated"
                      roles="User, Admin, Super Admin"
                    />

                    <AccessRow
                      page="/portfolio"
                      access="Authenticated"
                      roles="User, Admin, Super Admin"
                    />

                    <AccessRow
                      page="/projects"
                      access="Authenticated"
                      roles="User, Admin, Super Admin (own data only)"
                    />

                    <AccessRow
                      page="/projects/*"
                      access="Authenticated"
                      roles="User, Admin, Super Admin (own data only)"
                    />

                    <AccessRow
                      page="/profile"
                      access="Authenticated"
                      roles="User, Admin, Super Admin (own profile)"
                    />

                    <AccessRow
                      page="/support"
                      access="Authenticated"
                      roles="User, Admin, Super Admin"
                    />

                    <AccessRow
                      page="/reference"
                      access="Internal"
                      roles="Admin, Super Admin"
                    />

                    <AccessRow
                      page="/brain"
                      access="Internal"
                      roles="Admin, Super Admin"
                    />

                    <AccessRow
                      page="/development"
                      access="Internal"
                      roles="Admin, Super Admin"
                    />

                    <AccessRow
                      page="/admin"
                      access="Admin only"
                      roles="Admin, Super Admin"
                    />

                    <AccessRow
                      page="/coming-soon"
                      access="Public"
                      roles="All"
                    />
                  </div>
                </RuleCard>

                <RuleCard title="Public vs Authenticated Boundary">
                  <div className="space-y-2">
                    <SpecRow
                      label="Public entry"
                      value="/ is the only primary public platform entry point"
                    />
                    <SpecRow
                      label="Public content"
                      value="Only safe public metrics, services, news, and pricing"
                    />
                    <SpecRow
                      label="Authenticated workspace"
                      value="/dashboard, /apps, /portfolio, /projects, /profile, /support"
                    />
                    <SpecRow
                      label="Internal control"
                      value="/brain, /development, /reference"
                    />
                    <SpecRow
                      label="Administrator control"
                      value="/admin"
                    />
                    <SpecRow
                      label="Direct URL rule"
                      value="Protected pages must reject unauthenticated direct access"
                    />
                  </div>
                </RuleCard>

                <RuleCard title="RLS Policy Rules">
                  <div className="space-y-2">
                    <SpecRow
                      label="Ownership check"
                      value="auth.uid() = user_id (NEVER current_user)"
                    />
                    <SpecRow
                      label="Policy count"
                      value="4 per table (SELECT, INSERT, UPDATE, DELETE) — never FOR ALL"
                    />
                    <SpecRow
                      label="Scope"
                      value="TO authenticated for signed-in apps; TO anon, authenticated for no-auth apps"
                    />
                    <SpecRow
                      label="Admin check"
                      value="EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)"
                    />
                    <SpecRow
                      label="Public read"
                      value="USING (true) only for intentionally shared data"
                    />
                    <SpecRow
                      label="WITH CHECK"
                      value="Must match USING for UPDATE policies; always present for INSERT"
                    />
                  </div>
                </RuleCard>
              </div>
            )}

            {/* APP PAGE RULES */}
            {active === 'apps' && (
              <div className="space-y-6">
                <SectionTitle
                  icon={<Layers className="w-4 h-4" />}
                  title="App Page Rules"
                  subtitle="Standards for building new app pages in the ecosystem"
                />

                <RuleCard title="App Registration">
                  <div className="space-y-2">
                    <SpecRow label="Table" value="apps (Supabase, RLS enabled)" />
                    <SpecRow label="Required fields" value="slug, name, status, url, sort_order" />
                    <SpecRow label="Optional fields" value="description, icon, category, is_featured" />
                    <SpecRow label="Status values" value="active | development | beta | coming_soon" />
                    <SpecRow label="Icon mapping" value="Calendar, Bot, Users, Cloud, Activity, Radio, Grid3X3, Briefcase" />
                    <SpecRow label="URL routing" value="active -> app.url; else -> /coming-soon" />
                  </div>
                </RuleCard>

                <RuleCard title="App Page Structure">
                  <div className="space-y-3">
                    <StructureStep num={1} text="Must use <PageLayout> wrapper" />
                    <StructureStep num={2} text="Header: label + title + subtitle (standard pattern)" />
                    <StructureStep num={3} text="Search bar with Search icon (left-aligned, max-w-sm)" />
                    <StructureStep num={4} text="Category filter buttons (pill style, orange active)" />
                    <StructureStep num={5} text="Featured section (if any is_featured = true)" />
                    <StructureStep num={6} text="Grid: grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" />
                    <StructureStep num={7} text="AppCard: icon container (10x10, bg-[#1a1a1a]), name, description, category footer" />
                    <StructureStep num={8} text="Status badge: green (active) or amber (development)" />
                  </div>
                </RuleCard>

                <RuleCard title="App Card Anatomy">
                  <div className="bg-[#050505] border border-[#1f1f1f] rounded-md p-4 font-mono text-[10px] text-[#888] overflow-x-auto">
                    <pre>{`<Link href={href} className="group flex flex-col p-5
  bg-[#0a0a0a] border border-[#1f1f1f] rounded-lg
  hover:border-[#2a2a2a] hover:bg-[#111] transition-all">

  <div className="flex items-start justify-between mb-4">
    <div className="w-10 h-10 bg-[#1a1a1a] rounded-lg
      flex items-center justify-center">
      <Icon className="w-5 h-5 text-[#ff7a00]" />
    </div>
    <span className="status-badge">{status}</span>
  </div>

  <p className="text-sm font-semibold text-white">{name}</p>
  <p className="text-xs text-[#555] line-clamp-2">{description}</p>

  <div className="mt-4 pt-3 border-t border-[#1f1f1f]">
    <span className="text-[10px] uppercase tracking-wider
      text-[#444]">{category}</span>
  </div>
</Link>`}</pre>
                  </div>
                </RuleCard>
              </div>
            )}

            {/* PROJECT PAGE RULES */}
            {active === 'projects' && (
              <div className="space-y-6">
                <SectionTitle
                  icon={<Workflow className="w-4 h-4" />}
                  title="Project Page Rules"
                  subtitle="Standards for project automation pages and tier system"
                />

                <RuleCard title="Project Categories">
                  <div className="space-y-2">
                    <CategoryRow id="event" label="Event" icon="Calendar" desc="Event invitations, RSVPs, organizer workflows" />
                    <CategoryRow id="content" label="Content" icon="FileText" desc="Content creation, publishing, creator tools" />
                    <CategoryRow id="business" label="Business" icon="Briefcase" desc="Business automation, advertising, management" />
                    <CategoryRow id="automation" label="Automation" icon="Zap" desc="Custom automation workflows and integrations" />
                    <CategoryRow id="custom" label="Custom" icon="Settings" desc="Fully custom project templates and configurations" />
                  </div>
                </RuleCard>

                <RuleCard title="Tier System">
                  <div className="space-y-2">
                    <TierRow name="Basic" color="#888" workflows="1" db="Shared" review="No" tokens="100" />
                    <TierRow name="Standard" color="#3b82f6" workflows="5" db="Shared" review="No" tokens="100" />
                    <TierRow name="Expert" color="#8b5cf6" workflows="20" db="Dedicated" review="No" tokens="100" />
                    <TierRow name="Advance" color="#ff7a00" workflows="Unlimited" db="Dedicated" review="No" tokens="100" />
                    <TierRow name="Custom" color="#ec4899" workflows="Unlimited" db="Dedicated" review="Yes" tokens="100" />
                  </div>
                </RuleCard>

                <RuleCard title="Project Page Structure">
                  <div className="space-y-3">
                    <StructureStep num={1} text="Must use <PageLayout> wrapper" />
                    <StructureStep num={2} text="Header with 'New Project' button (if authenticated)" />
                    <StructureStep num={3} text="Category tabs (horizontal scroll on mobile)" />
                    <StructureStep num={4} text="Category info card (icon + label + description)" />
                    <StructureStep num={5} text="Quick Create buttons (event tab only: Schedule + N8N)" />
                    <StructureStep num={6} text="Project list: cards with name, tier badge, status, feature badges" />
                    <StructureStep num={7} text="Edit button + dropdown menu (Activate/Pause/Archive/Delete)" />
                    <StructureStep num={8} text="Form modal: AutomationForm component" />
                    <StructureStep num={9} text="Quick stats grid at bottom (per-category counts)" />
                  </div>
                </RuleCard>

                <RuleCard title="Feature Flags per Project">
                  <div className="space-y-2">
                    <FeatureFlagRow name="n8n_enabled" desc="N8N workflow integration" />
                    <FeatureFlagRow name="tagging_enabled" desc="WhatsApp/Telegram message tagging" />
                    <FeatureFlagRow name="ai_agent_enabled" desc="AI agent (OpenAI/Anthropic/custom)" />
                    <FeatureFlagRow name="scheduler_enabled" desc="Cron-based scheduling" />
                    <FeatureFlagRow name="publisher_facebook" desc="Facebook publishing" />
                    <FeatureFlagRow name="publisher_instagram" desc="Instagram publishing" />
                    <FeatureFlagRow name="publisher_threads" desc="Threads publishing" />
                    <FeatureFlagRow name="publisher_tiktok" desc="TikTok publishing" />
                    <FeatureFlagRow name="report_enabled" desc="Automated reports (daily/weekly/monthly)" />
                    <FeatureFlagRow name="db_connection_enabled" desc="External database connection" />
                  </div>
                </RuleCard>
              </div>
            )}

            {/* NAVIGATION RULES */}
            {active === 'navigation' && (
              <div className="space-y-6">
                <SectionTitle
                  icon={<Navigation className="w-4 h-4" />}
                  title="Navigation Rules"
                  subtitle="Header and footer standards across all pages"
                />

                <RuleCard title="Header Structure">
                  <div className="space-y-3">
                    <StructureStep num={1} text="Sticky top, z-50, bg-black, border-b border-[#1f1f1f]" />
                    <StructureStep num={2} text="Max width 1400px, height 56px (h-14)" />
                    <StructureStep num={3} text="Logo: 28x28 image + uppercase tracked text" />
                    <StructureStep num={4} text="Search: hidden on mobile, max-w-xs, left icon" />
                    <StructureStep num={5} text="Nav links: hidden on <lg, orange active state" />
                    <StructureStep num={6} text="Language toggle: EN/ID pill buttons" />
                    <StructureStep num={7} text="Notifications: bell icon with orange dot" />
                    <StructureStep num={8} text="Profile: avatar circle + dropdown (Dashboard, Profile, Admin, Sign out)" />
                    <StructureStep num={9} text="Mobile: hamburger menu with full nav + search" />
                  </div>
                </RuleCard>

                <RuleCard title="Nav Links (in order)">
                  <div className="space-y-2">
                    <NavLinkRow keyName="nav.dashboard" href="/dashboard" en="Dashboard" id="Dasbor" />
                    <NavLinkRow keyName="nav.apps" href="/apps" en="Apps" id="Aplikasi" />
                    <NavLinkRow keyName="nav.portfolio" href="/portfolio" en="Portfolio" id="Portofolio" />
                    <NavLinkRow keyName="nav.projects" href="/projects" en="Projects" id="Proyek" />
                    <NavLinkRow keyName="nav.support" href="/support" en="Support" id="Dukungan" />
                  </div>

                  <div className="mt-3 p-3 bg-[#050505] border border-[#1f1f1f] rounded-md">
                    <p className="text-[10px] text-[#444]">Hidden pages (not in nav):</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      <code className="text-[10px] text-[#888] bg-[#0f0f0f] px-2 py-0.5 rounded">/admin</code>
                      <code className="text-[10px] text-[#888] bg-[#0f0f0f] px-2 py-0.5 rounded">/reference</code>
                      <code className="text-[10px] text-[#888] bg-[#0f0f0f] px-2 py-0.5 rounded">/brain</code>
                      <code className="text-[10px] text-[#888] bg-[#0f0f0f] px-2 py-0.5 rounded">/development</code>
                      <code className="text-[10px] text-[#888] bg-[#0f0f0f] px-2 py-0.5 rounded">/coming-soon</code>
                    </div>
                  </div>
                </RuleCard>

                <RuleCard title="Footer Structure">
                  <div className="space-y-3">
                    <StructureStep num={1} text="border-t border-[#1f1f1f], bg-[#0a0a0a]" />
                    <StructureStep num={2} text="Max width 1400px, py-8" />
                    <StructureStep num={3} text="Brand: 24x24 logo (opacity-70) + uppercase tracked text" />
                    <StructureStep num={4} text="Social: Telegram, WhatsApp, Email links" />
                    <StructureStep num={5} text="Version + copyright on right" />
                  </div>
                </RuleCard>

                <RuleCard title="I18n Rules">
                  <div className="space-y-2">
                    <SpecRow label="Languages" value="English (en) + Indonesian (id)" />
                    <SpecRow label="Default" value="en" />
                    <SpecRow label="Toggle" value="EN/ID pill in header, orange active" />
                    <SpecRow label="Dictionary" value="DICT in context/I18nContext.tsx" />
                    <SpecRow label="Usage" value="t('nav.dashboard') returns localized string" />
                    <SpecRow label="Fallback" value="Returns key if translation missing" />
                  </div>
                </RuleCard>
              </div>
            )}

            {/* DATABASE & RLS */}
            {active === 'database' && (
              <div className="space-y-6">
                <SectionTitle
                  icon={<Database className="w-4 h-4" />}
                  title="Database & RLS Rules"
                  subtitle="Table conventions, RLS patterns, and data access standards"
                />

                <RuleCard title="Table Conventions">
                  <div className="space-y-2">
                    <SpecRow label="Primary key" value="uuid DEFAULT gen_random_uuid()" />
                    <SpecRow label="Timestamps" value="created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now()" />
                    <SpecRow label="User link" value="user_id uuid REFERENCES auth.users(id)" />
                    <SpecRow label="Naming" value="snake_case, plural (profiles, apps, project_automations)" />
                    <SpecRow label="JSONB" value="Use for flexible config/metadata fields" />
                    <SpecRow label="Arrays" value="Use text[] for lists (whatsapp_numbers, telegram_chat_ids)" />
                    <SpecRow label="Constraints" value="CHECK constraints for enums (status, type, tier)" />
                  </div>
                </RuleCard>

                <RuleCard title="Current Tables">
                  <div className="space-y-2">
                    <TableRowItem name="profiles" rls="Yes" access="Own row (user_id = auth.uid())" />
                    <TableRowItem name="apps" rls="Yes" access="Public read, auth write" />
                    <TableRowItem name="project_automations" rls="Yes" access="Own rows (user_id = auth.uid())" />
                    <TableRowItem name="activity_log" rls="Yes" access="Own rows (user_id = auth.uid())" />
                    <TableRowItem name="admin_connections" rls="Yes" access="Admin only (is_admin = true)" />
                  </div>
                </RuleCard>

                <RuleCard title="RLS Policy Template (signed-in app)">
                  <div className="bg-[#050505] border border-[#1f1f1f] rounded-md p-4 font-mono text-[10px] text-[#888] overflow-x-auto">
                    <pre>{`-- 4 policies per table, one per CRUD verb:

CREATE POLICY "select_own" ON <table> FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "insert_own" ON <table> FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "update_own" ON <table> FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "delete_own" ON <table> FOR DELETE
  TO authenticated USING (auth.uid() = user_id);`}</pre>
                  </div>

                  <button
                    onClick={() => copy('rls-template', 'rls-template')}
                    className="mt-2 flex items-center gap-1 text-[10px] text-[#555] hover:text-[#888] transition-colors"
                  >
                    {copied === 'rls-template'
                      ? <Check className="w-3 h-3" />
                      : <Copy className="w-3 h-3" />}
                    Copy template
                  </button>
                </RuleCard>

                <RuleCard title="Admin RLS Policy Template">
                  <div className="bg-[#050505] border border-[#1f1f1f] rounded-md p-4 font-mono text-[10px] text-[#888] overflow-x-auto">
                    <pre>{`-- Admin-only table (e.g. admin_connections):

CREATE POLICY "admin_select" ON <table> FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true)
  );
-- Repeat for INSERT, UPDATE, DELETE with WITH CHECK`}</pre>
                  </div>
                </RuleCard>

                <RuleCard title="Data Safety Rules">
                  <div className="space-y-2">
                    <div className="flex items-start gap-2 p-2 bg-[#ef4444]/5 border border-[#ef4444]/10 rounded-md">
                      <Lock className="w-3.5 h-3.5 text-[#ef4444] shrink-0 mt-0.5" />
                      <p className="text-xs text-[#888]">
                        NEVER DROP tables or DELETE columns — data loss is irreversible
                      </p>
                    </div>

                    <div className="flex items-start gap-2 p-2 bg-[#ef4444]/5 border border-[#ef4444]/10 rounded-md">
                      <Lock className="w-3.5 h-3.5 text-[#ef4444] shrink-0 mt-0.5" />
                      <p className="text-xs text-[#888]">
                        NEVER change column types or rename tables — use additive migrations
                      </p>
                    </div>

                    <div className="flex items-start gap-2 p-2 bg-[#ef4444]/5 border border-[#ef4444]/10 rounded-md">
                      <Lock className="w-3.5 h-3.5 text-[#ef4444] shrink-0 mt-0.5" />
                      <p className="text-xs text-[#888]">
                        NEVER use transaction control (BEGIN/COMMIT/ROLLBACK) — except DO $$ blocks
                      </p>
                    </div>

                    <div className="flex items-start gap-2 p-2 bg-[#22c55e]/5 border border-[#22c55e]/10 rounded-md">
                      <Check className="w-3.5 h-3.5 text-[#22c55e] shrink-0 mt-0.5" />
                      <p className="text-xs text-[#888]">
                        Always use IF NOT EXISTS / IF EXISTS for idempotent migrations
                      </p>
                    </div>

                    <div className="flex items-start gap-2 p-2 bg-[#22c55e]/5 border border-[#22c55e]/10 rounded-md">
                      <Check className="w-3.5 h-3.5 text-[#22c55e] shrink-0 mt-0.5" />
                      <p className="text-xs text-[#888]">
                        Store secrets as reference names, never actual values in the database
                      </p>
                    </div>
                  </div>
                </RuleCard>
              </div>
            )}

            {/* FEATURE MATRIX */}
            {active === 'features' && (
              <div className="space-y-6">
                <SectionTitle
                  icon={<Zap className="w-4 h-4" />}
                  title="Feature Matrix"
                  subtitle="Complete map of features, their tiers, and implementation status"
                />

                <RuleCard title="Feature Availability by Tier">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-[#1f1f1f]">
                          <th className="text-left px-3 py-2 text-[10px] font-medium text-[#444] uppercase tracking-wider">
                            Feature
                          </th>
                          <th className="px-3 py-2 text-[10px] font-medium text-[#444] uppercase tracking-wider text-center">
                            Basic
                          </th>
                          <th className="px-3 py-2 text-[10px] font-medium text-[#444] uppercase tracking-wider text-center">
                            Standard
                          </th>
                          <th className="px-3 py-2 text-[10px] font-medium text-[#444] uppercase tracking-wider text-center">
                            Expert
                          </th>
                          <th className="px-3 py-2 text-[10px] font-medium text-[#444] uppercase tracking-wider text-center">
                            Advance
                          </th>
                          <th className="px-3 py-2 text-[10px] font-medium text-[#444] uppercase tracking-wider text-center">
                            Custom
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        <FeatureMatrixRow feature="N8N Workflow" values={[true, true, true, true, true]} />
                        <FeatureMatrixRow feature="WA/Telegram Tagging" values={[true, true, true, true, true]} />
                        <FeatureMatrixRow feature="AI Agent" values={[false, true, true, true, true]} />
                        <FeatureMatrixRow feature="Scheduler" values={[true, true, true, true, true]} />
                        <FeatureMatrixRow feature="Publisher (FB/IG/Threads/TikTok)" values={[false, true, true, true, true]} />
                        <FeatureMatrixRow feature="Report" values={[true, true, true, true, true]} />
                        <FeatureMatrixRow feature="Database" values={[true, true, true, true, true]} />
                        <FeatureMatrixRow feature="Admin Review Required" values={[false, false, false, false, true]} highlightLast />
                      </tbody>
                    </table>
                  </div>
                </RuleCard>

                <RuleCard title="Platform Pages Status">
                  <div className="space-y-2">
                    <PageStatusRow page="/" status="active" />
                    <PageStatusRow page="/login" status="active" />
                    <PageStatusRow page="/dashboard" status="active" />
                    <PageStatusRow page="/apps" status="active" />
                    <PageStatusRow page="/portfolio" status="active" />
                    <PageStatusRow page="/projects" status="active" />
                    <PageStatusRow page="/profile" status="active" />
                    <PageStatusRow page="/support" status="active" />
                    <PageStatusRow page="/admin" status="active" />
                    <PageStatusRow page="/reference" status="active" />
                    <PageStatusRow page="/brain" status="active" />
                    <PageStatusRow page="/development" status="active" />
                    <PageStatusRow page="/coming-soon" status="placeholder" />
                  </div>
                </RuleCard>

                <RuleCard title="Credit Token System">
                  <div className="space-y-2">
                    <SpecRow label="Default allocation" value="100 tokens per project" />
                    <SpecRow label="Token usage" value="Tracked per automation run (tokens_used)" />
                    <SpecRow label="Remaining" value="credit_tokens - tokens_used" />
                    <SpecRow label="Admin control" value="Admin can adjust credit_tokens per project" />
                    <SpecRow label="Reset" value="Not automatic — admin must manually replenish" />
                  </div>
                </RuleCard>

                <RuleCard title="External Connection Types">
                  <div className="space-y-2">
                    <ConnTypeRow type="n8n" label="N8N Workflow" desc="Workflow automation engine" />
                    <ConnTypeRow type="database" label="Database" desc="External PostgreSQL/MySQL connection" />
                    <ConnTypeRow type="api" label="API Endpoint" desc="Third-party REST API" />
                    <ConnTypeRow type="webhook" label="Webhook" desc="Incoming webhook receiver" />
                    <ConnTypeRow type="telegram_bot" label="Telegram Bot" desc="Bot for OTP and notifications" />
                    <ConnTypeRow type="whatsapp_bot" label="WhatsApp Bot" desc="Bot for WhatsApp messaging" />
                    <ConnTypeRow type="smtp" label="SMTP / Email" desc="Email sending service" />
                  </div>
                </RuleCard>
              </div>
            )}

            {/* BRAIN PERMIT EDITOR */}
            {active === 'permits' && <BrainPermitEditor />}

            {/* DEVELOPMENT */}
            {active === 'development' && <DevelopmentPage />}

          </div>
        </div>
      </div>
    </PageLayout>
  );
}

// --- Helper components ---

function SectionTitle({
  icon,
  title,
  subtitle,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="mb-4 pb-4 border-b border-[#1f1f1f]">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-[#ff7a00]">{icon}</span>
        <h2 className="text-lg font-bold text-white">{title}</h2>
      </div>
      <p className="text-sm text-[#555]">{subtitle}</p>
    </div>
  );
}

function RuleCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(true);

  return (
    <div className="bg-[#0a0a0a] border border-[#1f1f1f] rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-[#111] transition-colors"
      >
        <h3 className="text-sm font-semibold text-white">{title}</h3>
        {open
          ? <ChevronDown className="w-4 h-4 text-[#555]" />
          : <ChevronRight className="w-4 h-4 text-[#555]" />}
      </button>

      {open && <div className="px-4 pb-4">{children}</div>}
    </div>
  );
}

function ColorRow({
  name,
  value,
  usage,
}: {
  name: string;
  value: string;
  usage: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div
        className="w-8 h-8 rounded-md border border-[#1f1f1f] shrink-0"
        style={{ backgroundColor: value }}
      />
      <div className="flex-1 min-w-0">
        <code className="text-xs text-[#888] font-mono">{name}</code>
        <span className="text-[10px] text-[#444] ml-2">{value}</span>
      </div>
      <span className="text-[10px] text-[#555] text-right hidden sm:block">
        {usage}
      </span>
    </div>
  );
}

function TypeRow({
  label,
  spec,
}: {
  label: string;
  spec: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 py-1">
      <span className="text-xs text-[#888] shrink-0">{label}</span>
      <code className="text-[10px] text-[#555] font-mono text-right">
        {spec}
      </code>
    </div>
  );
}

function SpecRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start justify-between gap-3 py-1">
      <span className="text-xs text-[#888] shrink-0">{label}</span>
      <span className="text-[10px] text-[#555] text-right">{value}</span>
    </div>
  );
}

function ComponentSpec({
  name,
  usage,
  code,
}: {
  name: string;
  usage: string;
  code: string;
}) {
  return (
    <div className="p-3 bg-[#050505] border border-[#1f1f1f] rounded-md">
      <div className="flex items-center justify-between mb-2">
        <code className="text-xs text-[#ff7a00] font-mono">{name}</code>
        <span className="text-[10px] text-[#444]">{usage}</span>
      </div>

      <pre className="text-[10px] text-[#888] font-mono overflow-x-auto whitespace-pre-wrap">
        {code}
      </pre>
    </div>
  );
}

function StructureStep({
  num,
  text,
  code,
}: {
  num: number;
  text: string;
  code?: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-5 h-5 bg-[#ff7a00]/10 text-[#ff7a00] rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
        {num}
      </div>

      <div className="flex-1">
        <p className="text-xs text-[#888]">{text}</p>
        {code && (
          <code className="text-[10px] text-[#555] font-mono block mt-1">
            {code}
          </code>
        )}
      </div>
    </div>
  );
}

function BreakpointRow({
  name,
  spec,
  usage,
}: {
  name: string;
  spec: string;
  usage: string;
}) {
  return (
    <div className="flex items-center gap-3 py-1">
      <code className="text-xs text-[#ff7a00] font-mono w-16 shrink-0">
        {name}
      </code>
      <code className="text-[10px] text-[#555] font-mono w-20 shrink-0">
        {spec}
      </code>
      <span className="text-[10px] text-[#888]">{usage}</span>
    </div>
  );
}

function RoleCard({
  icon,
  name,
  color,
  permissions,
}: {
  icon: React.ReactNode;
  name: string;
  color: string;
  permissions: string[];
}) {
  return (
    <div className="p-3 bg-[#050505] border border-[#1f1f1f] rounded-md">
      <div className="flex items-center gap-2 mb-2">
        <span style={{ color }}>{icon}</span>
        <h4 className="text-sm font-semibold" style={{ color }}>
          {name}
        </h4>
      </div>

      <ul className="space-y-1">
        {permissions.map((p, i) => (
          <li
            key={i}
            className="text-[10px] text-[#888] flex items-start gap-1.5"
          >
            <ChevronRight className="w-2.5 h-2.5 text-[#444] shrink-0 mt-0.5" />
            {p}
          </li>
        ))}
      </ul>
    </div>
  );
}

function AccessRow({
  page,
  access,
  roles,
}: {
  page: string;
  access: string;
  roles: string;
}) {
  return (
    <div className="flex items-center gap-3 py-1.5 border-b border-[#0f0f0f] last:border-0">
      <code className="text-xs text-[#888] font-mono w-28 shrink-0">
        {page}
      </code>
      <span className="text-[10px] text-[#555] w-32 shrink-0">
        {access}
      </span>
      <span className="text-[10px] text-[#888]">{roles}</span>
    </div>
  );
}

function CategoryRow({
  id,
  label,
  icon,
  desc,
}: {
  id: string;
  label: string;
  icon: string;
  desc: string;
}) {
  return (
    <div className="flex items-center gap-3 py-1.5 border-b border-[#0f0f0f] last:border-0">
      <code className="text-xs text-[#ff7a00] font-mono w-24 shrink-0">
        {id}
      </code>
      <span className="text-xs text-[#888] w-20 shrink-0">{label}</span>
      <code className="text-[10px] text-[#555] w-20 shrink-0 hidden sm:block">
        {icon}
      </code>
      <span className="text-[10px] text-[#888]">{desc}</span>
    </div>
  );
}

function TierRow({
  name,
  color,
  workflows,
  db,
  review,
  tokens,
}: {
  name: string;
  color: string;
  workflows: string;
  db: string;
  review: string;
  tokens: string;
}) {
  return (
    <div className="flex items-center gap-3 py-1.5 border-b border-[#0f0f0f] last:border-0">
      <span
        className="text-xs font-medium w-20 shrink-0"
        style={{ color }}
      >
        {name}
      </span>

      <span className="text-[10px] text-[#888] w-20 shrink-0">
        {workflows} workflows
      </span>

      <span className="text-[10px] text-[#888] w-24 shrink-0 hidden sm:block">
        {db} DB
      </span>

      <span className="text-[10px] text-[#888] w-16 shrink-0">
        Review: {review}
      </span>

      <span className="text-[10px] text-[#888]">
        {tokens} tokens
      </span>
    </div>
  );
}

function FeatureFlagRow({
  name,
  desc,
}: {
  name: string;
  desc: string;
}) {
  return (
    <div className="flex items-center gap-3 py-1 border-b border-[#0f0f0f] last:border-0">
      <code className="text-[10px] text-[#ff7a00] font-mono w-48 shrink-0">
        {name}
      </code>
      <span className="text-[10px] text-[#888]">{desc}</span>
    </div>
  );
}

function NavLinkRow({
  keyName,
  href,
  en,
  id,
}: {
  keyName: string;
  href: string;
  en: string;
  id: string;
}) {
  return (
    <div className="flex items-center gap-3 py-1.5 border-b border-[#0f0f0f] last:border-0">
      <code className="text-[10px] text-[#ff7a00] font-mono w-32 shrink-0">
        {keyName}
      </code>
      <code className="text-[10px] text-[#555] font-mono w-20 shrink-0">
        {href}
      </code>
      <span className="text-xs text-[#888]">{en}</span>
      <span className="text-[10px] text-[#444]">/ {id}</span>
    </div>
  );
}

function TableRowItem({
  name,
  rls,
  access,
}: {
  name: string;
  rls: string;
  access: string;
}) {
  return (
    <div className="flex items-center gap-3 py-1.5 border-b border-[#0f0f0f] last:border-0">
      <code className="text-xs text-[#888] font-mono w-40 shrink-0">
        {name}
      </code>

      <span
        className={`text-[10px] font-medium px-2 py-0.5 rounded-full shrink-0 ${
          rls === 'Yes'
            ? 'text-[#22c55e] bg-[#22c55e]/10'
            : 'text-[#ef4444] bg-[#ef4444]/10'
        }`}
      >
        {rls}
      </span>

      <span className="text-[10px] text-[#555]">{access}</span>
    </div>
  );
}

function FeatureMatrixRow({
  feature,
  values,
  highlightLast,
}: {
  feature: string;
  values: boolean[];
  highlightLast?: boolean;
}) {
  return (
    <tr className="border-b border-[#0f0f0f]">
      <td className="px-3 py-2 text-xs text-[#888]">
        {feature}
      </td>

      {values.map((v, i) => {
        const isLast = highlightLast && i === values.length - 1;

        return (
          <td key={i} className="px-3 py-2 text-center">
            {v ? (
              <Check
                className={`w-3.5 h-3.5 mx-auto ${
                  isLast
                    ? 'text-[#f59e0b]'
                    : 'text-[#22c55e]'
                }`}
              />
            ) : (
              <span className="text-[10px] text-[#333]">—</span>
            )}
          </td>
        );
      })}
    </tr>
  );
}

function PageStatusRow({
  page,
  status,
}: {
  page: string;
  status: 'active' | 'placeholder';
}) {
  return (
    <div className="flex items-center gap-3 py-1.5 border-b border-[#0f0f0f] last:border-0">
      <code className="text-xs text-[#888] font-mono w-28 shrink-0">
        {page}
      </code>

      <span
        className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
          status === 'active'
            ? 'text-[#22c55e] bg-[#22c55e]/10'
            : 'text-[#f59e0b] bg-[#f59e0b]/10'
        }`}
      >
        {status}
      </span>
    </div>
  );
}

function ConnTypeRow({
  type,
  label,
  desc,
}: {
  type: string;
  label: string;
  desc: string;
}) {
  return (
    <div className="flex items-center gap-3 py-1 border-b border-[#0f0f0f] last:border-0">
      <code className="text-[10px] text-[#ff7a00] font-mono w-32 shrink-0">
        {type}
      </code>

      <span className="text-xs text-[#888] w-32 shrink-0">
        {label}
      </span>

      <span className="text-[10px] text-[#555]">
        {desc}
      </span>
    </div>
  );
}
