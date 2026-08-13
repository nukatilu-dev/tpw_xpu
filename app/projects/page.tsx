'use client';

import { useEffect, useState } from 'react';
import {
  Calendar,
  Plus,
  Cog,
  Megaphone,
  Video,
  Users,
  X,
  MoreHorizontal,
  Play,
  Pause,
  Trash2,
  ExternalLink,
  Crown,
  AlertCircle,
  FolderKanban,
  FileText,
  Briefcase,
  Zap,
  Settings,
  Clock,
  Workflow,
} from 'lucide-react';
import PageLayout from '@/components/layout/PageLayout';
import AutomationForm, { CATEGORY_LABELS } from '@/components/projects/AutomationForm';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { TIER_CONFIGS } from '@/lib/tiers';
import type { ProjectAutomation, ProjectCategory, ProjectTier } from '@/lib/types';

const CATEGORIES: { id: ProjectCategory; label: string; icon: React.ReactNode; description: string }[] = [
  { id: 'event', label: 'Event', icon: <Calendar className="w-4 h-4" />, description: 'Event invitations, RSVPs, and organizer workflows' },
  { id: 'content', label: 'Content', icon: <FileText className="w-4 h-4" />, description: 'Content creation, publishing, and creator tools' },
  { id: 'business', label: 'Business', icon: <Briefcase className="w-4 h-4" />, description: 'Business automation, advertising, and management' },
  { id: 'automation', label: 'Automation', icon: <Zap className="w-4 h-4" />, description: 'Custom automation workflows and integrations' },
  { id: 'custom', label: 'Custom', icon: <Settings className="w-4 h-4" />, description: 'Fully custom project templates and configurations' },
];

const STATUS_STYLES: Record<string, string> = {
  active: 'text-[#22c55e] bg-[#22c55e]/10',
  paused: 'text-[#f59e0b] bg-[#f59e0b]/10',
  archived: 'text-[#555] bg-[#555]/10',
};

const REVIEW_STYLES: Record<string, string> = {
  pending: 'text-[#f59e0b] bg-[#f59e0b]/10',
  approved: 'text-[#22c55e] bg-[#22c55e]/10',
  rejected: 'text-[#ef4444] bg-[#ef4444]/10',
};

export default function ProjectsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<ProjectCategory>('event');
  const [automations, setAutomations] = useState<ProjectAutomation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAutomation, setEditingAutomation] = useState<ProjectAutomation | null>(null);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

  async function fetchAutomations() {
    if (!user) { setLoading(false); return; }
    const { data } = await supabase
      .from('project_automations')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    if (data) setAutomations(data as ProjectAutomation[]);
    setLoading(false);
  }

  useEffect(() => { fetchAutomations(); }, [user]);

  async function quickCreate(cat: ProjectCategory, type: 'schedule' | 'n8n') {
    if (!user) return;
    setActiveTab(cat);

    const isSchedule = type === 'schedule';
    const name = isSchedule ? 'New Scheduled Event' : 'New Event (N8N)';

    const payload = {
      user_id: user.id,
      category: cat,
      name,
      tier: 'basic' as const,
      n8n_enabled: !isSchedule,
      n8n_webhook_url: null,
      n8n_workflow_id: null,
      tagging_enabled: false,
      whatsapp_numbers: null,
      telegram_chat_ids: null,
      tagging_message_template: null,
      ai_agent_enabled: false,
      ai_provider: null,
      ai_model: null,
      ai_system_prompt: null,
      scheduler_enabled: isSchedule,
      schedule_cron: isSchedule ? '0 9 * * *' : null,
      schedule_timezone: 'UTC',
      publisher_facebook: false,
      publisher_instagram: false,
      publisher_threads: false,
      publisher_tiktok: false,
      report_enabled: false,
      report_frequency: null,
      report_email: null,
      db_connection_enabled: false,
      db_host: null,
      db_port: 5432,
      db_name: null,
      db_user: null,
      db_password_ref: null,
      status: 'active' as const,
      credit_tokens: 100,
      tokens_used: 0,
      review_status: 'not_required' as const,
    };

    const { data } = await supabase.from('project_automations').insert(payload).select().single();
    if (data) {
      setEditingAutomation(data as ProjectAutomation);
      setShowForm(true);
    }
  }

  async function handleSave(formData: {
    name: string;
    tier: ProjectTier;
    n8n_enabled: boolean;
    n8n_webhook_url: string;
    n8n_workflow_id: string;
    tagging_enabled: boolean;
    whatsapp_numbers: string;
    telegram_chat_ids: string;
    tagging_message_template: string;
    ai_agent_enabled: boolean;
    ai_provider: 'openai' | 'anthropic' | 'custom' | '';
    ai_model: string;
    ai_system_prompt: string;
    scheduler_enabled: boolean;
    schedule_cron: string;
    schedule_timezone: string;
    publisher_facebook: boolean;
    publisher_instagram: boolean;
    publisher_threads: boolean;
    publisher_tiktok: boolean;
    report_enabled: boolean;
    report_frequency: 'daily' | 'weekly' | 'monthly' | '';
    report_email: string;
    db_connection_enabled: boolean;
    db_host: string;
    db_port: string;
    db_name: string;
    db_user: string;
    db_password_ref: string;
  }) {
    if (!user) return;

    const tierConfig = TIER_CONFIGS[formData.tier];
    const isCustom = formData.tier === 'custom';

    const payload = {
      user_id: user.id,
      category: activeTab,
      name: formData.name,
      tier: formData.tier,
      n8n_enabled: formData.n8n_enabled,
      n8n_webhook_url: formData.n8n_webhook_url || null,
      n8n_workflow_id: formData.n8n_workflow_id || null,
      tagging_enabled: formData.tagging_enabled,
      whatsapp_numbers: formData.whatsapp_numbers ? formData.whatsapp_numbers.split(',').map(s => s.trim()).filter(Boolean) : null,
      telegram_chat_ids: formData.telegram_chat_ids ? formData.telegram_chat_ids.split(',').map(s => s.trim()).filter(Boolean) : null,
      tagging_message_template: formData.tagging_message_template || null,
      ai_agent_enabled: formData.ai_agent_enabled,
      ai_provider: formData.ai_provider || null,
      ai_model: formData.ai_model || null,
      ai_system_prompt: formData.ai_system_prompt || null,
      scheduler_enabled: formData.scheduler_enabled,
      schedule_cron: formData.schedule_cron || null,
      schedule_timezone: formData.schedule_timezone,
      publisher_facebook: formData.publisher_facebook,
      publisher_instagram: formData.publisher_instagram,
      publisher_threads: formData.publisher_threads,
      publisher_tiktok: formData.publisher_tiktok,
      report_enabled: formData.report_enabled,
      report_frequency: formData.report_frequency || null,
      report_email: formData.report_email || null,
      db_connection_enabled: formData.db_connection_enabled,
      db_host: formData.db_host || null,
      db_port: formData.db_port ? parseInt(formData.db_port, 10) : 5432,
      db_name: formData.db_name || null,
      db_user: formData.db_user || null,
      db_password_ref: formData.db_password_ref || null,
      status: isCustom ? 'paused' as const : 'active' as const,
      credit_tokens: tierConfig.defaultCreditTokens,
      tokens_used: 0,
      review_status: isCustom ? 'pending' as const : 'not_required' as const,
    };

    if (editingAutomation) {
      await supabase.from('project_automations').update(payload).eq('id', editingAutomation.id);
    } else {
      await supabase.from('project_automations').insert(payload);
    }

    setShowForm(false);
    setEditingAutomation(null);
    await fetchAutomations();
  }

  async function updateStatus(id: string, status: 'active' | 'paused' | 'archived') {
    await supabase.from('project_automations').update({ status }).eq('id', id);
    setMenuOpenId(null);
    await fetchAutomations();
  }

  async function deleteAutomation(id: string) {
    if (!confirm('Delete this project?')) return;
    await supabase.from('project_automations').delete().eq('id', id);
    setMenuOpenId(null);
    await fetchAutomations();
  }

  const filteredAutomations = automations.filter(a => a.category === activeTab);

  return (
    <PageLayout>
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <p className="text-xs font-semibold tracking-[0.15em] text-[#555] uppercase mb-1">Projects</p>
            <h1 className="text-2xl font-bold text-white mb-1">Project Tools</h1>
            <p className="text-sm text-[#555]">Build and manage automation workflows across project categories</p>
          </div>
          {user && (
            <button
              onClick={() => { setEditingAutomation(null); setShowForm(true); }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#ff7a00] text-black text-sm font-semibold rounded-md hover:bg-[#e86e00] transition-colors shrink-0"
            >
              <Plus className="w-4 h-4" />
              New Project
            </button>
          )}
        </div>

        {/* Tab navigation */}
        <div className="flex items-center gap-1 mb-6 overflow-x-auto pb-2 -mb-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveTab(cat.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium whitespace-nowrap rounded-md transition-colors ${
                activeTab === cat.id
                  ? 'bg-[#ff7a00] text-black'
                  : 'bg-[#0a0a0a] border border-[#1f1f1f] text-[#888] hover:text-white hover:border-[#2a2a2a]'
              }`}
            >
              {cat.icon}
              <span className="hidden sm:inline">{cat.label}</span>
            </button>
          ))}
        </div>

        {/* Category info */}
        <div className="mb-6 p-4 bg-[#0a0a0a] border border-[#1f1f1f] rounded-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#ff7a00]/10 rounded-lg flex items-center justify-center text-[#ff7a00]">
              {CATEGORIES.find(c => c.id === activeTab)?.icon}
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white">{CATEGORY_LABELS[activeTab]}</h2>
              <p className="text-xs text-[#555]">{CATEGORIES.find(c => c.id === activeTab)?.description}</p>
            </div>
          </div>
        </div>

        {/* Quick Create - Event tab only */}
        {activeTab === 'event' && user && (
          <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={() => quickCreate('event', 'schedule')}
              className="flex items-center gap-3 p-4 bg-[#0a0a0a] border border-[#1f1f1f] rounded-lg hover:border-[#ff7a00]/40 hover:bg-[#111] transition-all text-left"
            >
              <div className="w-10 h-10 bg-[#06b6d4]/10 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-[#06b6d4]" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Quick Create: Schedule</p>
                <p className="text-xs text-[#555]">Set up a scheduled event automation with cron timing</p>
              </div>
            </button>
            <button
              onClick={() => quickCreate('event', 'n8n')}
              className="flex items-center gap-3 p-4 bg-[#0a0a0a] border border-[#1f1f1f] rounded-lg hover:border-[#ff7a00]/40 hover:bg-[#111] transition-all text-left"
            >
              <div className="w-10 h-10 bg-[#ff7a00]/10 rounded-lg flex items-center justify-center">
                <Workflow className="w-5 h-5 text-[#ff7a00]" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Quick Create: Event (N8N)</p>
                <p className="text-xs text-[#555]">Create an event workflow powered by N8N automation</p>
              </div>
            </button>
          </div>
        )}

        {/* Content */}
        {!user ? (
          <div className="text-center py-20 bg-[#0a0a0a] border border-[#1f1f1f] rounded-lg">
            <FolderKanban className="w-12 h-12 text-[#1f1f1f] mx-auto mb-3" />
            <p className="text-sm font-medium text-white mb-1">Sign in to manage projects</p>
            <p className="text-xs text-[#555]">Create an account to set up project automation workflows</p>
          </div>
        ) : loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-6 h-6 border-2 border-[#ff7a00] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredAutomations.length === 0 ? (
          <div className="text-center py-20 bg-[#0a0a0a] border border-[#1f1f1f] rounded-lg">
            <Cog className="w-12 h-12 text-[#1f1f1f] mx-auto mb-3" />
            <p className="text-sm font-medium text-white mb-1">No projects yet</p>
            <p className="text-xs text-[#555] mb-4">Create your first {CATEGORY_LABELS[activeTab].toLowerCase()} project</p>
            <button
              onClick={() => { setEditingAutomation(null); setShowForm(true); }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#ff7a00] text-black text-sm font-semibold rounded-md hover:bg-[#e86e00] transition-colors"
            >
              <Plus className="w-4 h-4" />
              New Project
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredAutomations.map((automation) => (
              <div
                key={automation.id}
                className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 bg-[#0a0a0a] border border-[#1f1f1f] rounded-lg hover:border-[#2a2a2a] transition-all"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-semibold text-white">{automation.name}</h3>
                    <TierBadge tier={automation.tier} />
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full capitalize ${STATUS_STYLES[automation.status]}`}>
                      {automation.status}
                    </span>
                    {automation.review_status === 'pending' && (
                      <span className={`flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full ${REVIEW_STYLES.pending}`}>
                        <AlertCircle className="w-2.5 h-2.5" />
                        Pending Review
                      </span>
                    )}
                    {automation.review_status === 'rejected' && (
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${REVIEW_STYLES.rejected}`}>
                        Rejected
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-2 flex-wrap">
                    {automation.n8n_enabled && (
                      <Badge icon={<ExternalLink className="w-2.5 h-2.5" />} label="N8N" />
                    )}
                    {automation.tagging_enabled && (
                      <Badge icon={<Megaphone className="w-2.5 h-2.5" />} label="Tagging" />
                    )}
                    {automation.ai_agent_enabled && (
                      <Badge icon={<Video className="w-2.5 h-2.5" />} label="AI" color="#8b5cf6" />
                    )}
                    {automation.scheduler_enabled && (
                      <Badge icon={<Calendar className="w-2.5 h-2.5" />} label="Schedule" color="#06b6d4" />
                    )}
                    {(automation.publisher_facebook || automation.publisher_instagram || automation.publisher_threads || automation.publisher_tiktok) && (
                      <Badge icon={<Megaphone className="w-2.5 h-2.5" />} label="Publish" color="#ec4899" />
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => { setEditingAutomation(automation); setShowForm(true); }}
                    className="px-3 py-1.5 text-xs text-[#888] border border-[#1f1f1f] rounded-md hover:text-white hover:border-[#2a2a2a] transition-colors"
                  >
                    Edit
                  </button>
                  <div className="relative">
                    <button
                      onClick={() => setMenuOpenId(menuOpenId === automation.id ? null : automation.id)}
                      className="p-1.5 text-[#555] hover:text-white hover:bg-[#111] rounded-md transition-colors"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                    {menuOpenId === automation.id && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setMenuOpenId(null)} />
                        <div className="absolute right-0 top-full mt-1 w-40 bg-[#0a0a0a] border border-[#1f1f1f] rounded-lg shadow-xl z-20 py-1">
                          {automation.status !== 'active' && automation.review_status !== 'pending' && (
                            <button
                              onClick={() => updateStatus(automation.id, 'active')}
                              className="flex items-center gap-2 w-full px-3 py-2 text-xs text-[#888] hover:text-white hover:bg-[#111] transition-colors"
                            >
                              <Play className="w-3 h-3" />
                              Activate
                            </button>
                          )}
                          {automation.status === 'active' && (
                            <button
                              onClick={() => updateStatus(automation.id, 'paused')}
                              className="flex items-center gap-2 w-full px-3 py-2 text-xs text-[#888] hover:text-white hover:bg-[#111] transition-colors"
                            >
                              <Pause className="w-3 h-3" />
                              Pause
                            </button>
                          )}
                          {automation.status !== 'archived' && (
                            <button
                              onClick={() => updateStatus(automation.id, 'archived')}
                              className="flex items-center gap-2 w-full px-3 py-2 text-xs text-[#888] hover:text-white hover:bg-[#111] transition-colors"
                            >
                              <ArchiveIcon className="w-3 h-3" />
                              Archive
                            </button>
                          )}
                          <button
                            onClick={() => deleteAutomation(automation.id)}
                            className="flex items-center gap-2 w-full px-3 py-2 text-xs text-[#ef4444] hover:bg-[#ef4444]/10 transition-colors border-t border-[#1f1f1f] mt-1 pt-2"
                          >
                            <Trash2 className="w-3 h-3" />
                            Delete
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Quick stats */}
        {user && automations.length > 0 && (
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-5 gap-3">
            {CATEGORIES.map((cat) => {
              const count = automations.filter(a => a.category === cat.id).length;
              const activeCount = automations.filter(a => a.category === cat.id && a.status === 'active').length;
              return (
                <div
                  key={cat.id}
                  onClick={() => setActiveTab(cat.id)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    activeTab === cat.id
                      ? 'bg-[#ff7a00]/10 border-[#ff7a00]'
                      : 'bg-[#0a0a0a] border-[#1f1f1f] hover:border-[#2a2a2a]'
                  }`}
                >
                  <div className="flex items-center gap-2 text-[#888] mb-1">
                    {cat.icon}
                    <span className="text-xs">{cat.label}</span>
                  </div>
                  <p className="text-lg font-bold text-white">{count}</p>
                  {activeCount > 0 && (
                    <p className="text-[10px] text-[#22c55e]">{activeCount} active</p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <AutomationForm
          category={activeTab}
          initialData={editingAutomation}
          onSave={handleSave}
          onClose={() => { setShowForm(false); setEditingAutomation(null); }}
        />
      )}
    </PageLayout>
  );
}

function TierBadge({ tier }: { tier: ProjectTier }) {
  const config = TIER_CONFIGS[tier];
  const colors: Record<ProjectTier, string> = {
    basic: 'text-[#888] bg-[#888]/10',
    standard: 'text-[#3b82f6] bg-[#3b82f6]/10',
    expert: 'text-[#8b5cf6] bg-[#8b5cf6]/10',
    advance: 'text-[#ff7a00] bg-[#ff7a00]/10',
    custom: 'text-[#ec4899] bg-[#ec4899]/10',
  };

  return (
    <span className={`flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full capitalize ${colors[tier]}`}>
      {tier === 'advance' && <Crown className="w-2.5 h-2.5" />}
      {config.label}
    </span>
  );
}

function Badge({ icon, label, color }: { icon: React.ReactNode; label: string; color?: string }) {
  return (
    <span className="inline-flex items-center gap-1 text-[10px] text-[#555] bg-[#111] px-2 py-0.5 rounded-full">
      <span style={{ color: color || '#888' }}>{icon}</span>
      {label}
    </span>
  );
}

function ArchiveIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <line x1="3" y1="9" x2="21" y2="9" />
      <line x1="9" y1="21" x2="9" y2="9" />
    </svg>
  );
}
