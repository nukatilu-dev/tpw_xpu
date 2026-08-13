'use client';

import { useState } from 'react';
import {
  X,
  Workflow,
  MessageCircle,
  Bot,
  Clock,
  Share2,
  BarChart3,
  Database,
  ChevronDown,
  ChevronUp,
  Save,
  Loader2,
  Facebook,
  Instagram,
  AtSign,
  Music,
  Info,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import type { ProjectAutomation, ProjectCategory, ProjectTier } from '@/lib/types';
import { TIER_CONFIGS, TIER_OPTIONS, getTierConfig, getLimitsText, getFeaturesList } from '@/lib/tiers';

type Props = {
  category: ProjectCategory;
  initialData?: ProjectAutomation | null;
  onSave: (data: FormData) => Promise<void>;
  onClose: () => void;
};

type FormData = {
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
};

const TIMEZONES = [
  'UTC', 'America/New_York', 'America/Los_Angeles', 'Europe/London', 'Europe/Paris',
  'Asia/Tokyo', 'Asia/Singapore', 'Asia/Jakarta', 'Australia/Sydney',
];

function getDefaultFormForTier(tier: ProjectTier): Partial<FormData> {
  const config = getTierConfig(tier);
  return {
    tier,
    n8n_enabled: config.features.n8n,
    tagging_enabled: config.features.tagging,
    ai_agent_enabled: config.features.ai_agent,
    scheduler_enabled: config.features.scheduler,
    publisher_facebook: config.features.publisher,
    publisher_instagram: config.features.publisher,
    publisher_threads: config.features.publisher,
    publisher_tiktok: config.features.publisher,
    report_enabled: config.features.report,
    db_connection_enabled: config.features.database,
  };
}

const DEFAULT_FORM: FormData = {
  name: '',
  tier: 'basic',
  n8n_enabled: true,
  n8n_webhook_url: '',
  n8n_workflow_id: '',
  tagging_enabled: true,
  whatsapp_numbers: '',
  telegram_chat_ids: '',
  tagging_message_template: '',
  ai_agent_enabled: false,
  ai_provider: '',
  ai_model: '',
  ai_system_prompt: '',
  scheduler_enabled: true,
  schedule_cron: '',
  schedule_timezone: 'UTC',
  publisher_facebook: false,
  publisher_instagram: false,
  publisher_threads: false,
  publisher_tiktok: false,
  report_enabled: true,
  report_frequency: '',
  report_email: '',
  db_connection_enabled: true,
  db_host: '',
  db_port: '5432',
  db_name: '',
  db_user: '',
  db_password_ref: '',
};

export default function AutomationForm({ category, initialData, onSave, onClose }: Props) {
  const [form, setForm] = useState<FormData>(() => {
    if (!initialData) {
      return { ...DEFAULT_FORM, ...getDefaultFormForTier('basic') };
    }
    return {
      name: initialData.name || '',
      tier: initialData.tier || 'basic',
      n8n_enabled: initialData.n8n_enabled ?? true,
      n8n_webhook_url: initialData.n8n_webhook_url || '',
      n8n_workflow_id: initialData.n8n_workflow_id || '',
      tagging_enabled: initialData.tagging_enabled ?? true,
      whatsapp_numbers: (initialData.whatsapp_numbers || []).join(', '),
      telegram_chat_ids: (initialData.telegram_chat_ids || []).join(', '),
      tagging_message_template: initialData.tagging_message_template || '',
      ai_agent_enabled: initialData.ai_agent_enabled ?? false,
      ai_provider: initialData.ai_provider || '',
      ai_model: initialData.ai_model || '',
      ai_system_prompt: initialData.ai_system_prompt || '',
      scheduler_enabled: initialData.scheduler_enabled ?? true,
      schedule_cron: initialData.schedule_cron || '',
      schedule_timezone: initialData.schedule_timezone || 'UTC',
      publisher_facebook: initialData.publisher_facebook ?? false,
      publisher_instagram: initialData.publisher_instagram ?? false,
      publisher_threads: initialData.publisher_threads ?? false,
      publisher_tiktok: initialData.publisher_tiktok ?? false,
      report_enabled: initialData.report_enabled ?? true,
      report_frequency: initialData.report_frequency || '',
      report_email: initialData.report_email || '',
      db_connection_enabled: initialData.db_connection_enabled ?? true,
      db_host: initialData.db_host || '',
      db_port: String(initialData.db_port || 5432),
      db_name: initialData.db_name || '',
      db_user: initialData.db_user || '',
      db_password_ref: initialData.db_password_ref || '',
    };
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    n8n: true,
    tagging: true,
    ai: true,
    scheduler: true,
    publisher: true,
    report: true,
    database: true,
  });

  const tierConfig = getTierConfig(form.tier);

  const handleTierChange = (newTier: ProjectTier) => {
    const tierDefaults = getDefaultFormForTier(newTier);
    setForm(prev => ({
      ...prev,
      tier: newTier,
      ...tierDefaults,
    }));
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await onSave(form);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const updateForm = <K extends keyof FormData>(key: K, value: FormData[K]) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 bg-black/80">
      <div className="w-full max-w-2xl bg-[#0a0a0a] border border-[#1f1f1f] rounded-xl shadow-2xl my-8">
        <div className="sticky top-0 flex items-center justify-between px-5 py-4 border-b border-[#1f1f1f] bg-[#0a0a0a] z-10">
          <div>
            <h2 className="text-sm font-semibold text-white">
              {initialData ? 'Edit' : 'New'} {CATEGORY_LABELS[category]} Project
            </h2>
            <p className="text-xs text-[#555]">Configure automation settings</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#555] hover:text-white hover:bg-[#111] rounded-md transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-3">
          {error && (
            <div className="p-3 bg-[#ef4444]/10 border border-[#ef4444]/20 rounded-md text-xs text-[#ef4444]">
              {error}
            </div>
          )}

          {/* Name and Tier */}
          <div className="p-4 bg-[#111] border border-[#1f1f1f] rounded-lg space-y-4">
            <Field label="Name *">
              <input
                type="text"
                value={form.name}
                onChange={e => updateForm('name', e.target.value)}
                placeholder="Enter project name..."
                required
                className="tpw-input"
              />
            </Field>

            <Field label="Automation Tier *">
              <select
                value={form.tier}
                onChange={e => handleTierChange(e.target.value as ProjectTier)}
                className="tpw-input"
              >
                {TIER_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </Field>
          </div>

          {/* Tier Info Panel (Read-only) */}
          <div className="p-4 bg-[#0a0a0a] border border-[#ff7a00]/30 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-[#ff7a00]/10 rounded-lg">
                <Info className="w-4 h-4 text-[#ff7a00]" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-sm font-semibold text-white">{tierConfig.label} Tier</h3>
                  {tierConfig.requiresReview && (
                    <span className="text-[10px] font-medium text-[#f59e0b] bg-[#f59e0b]/10 px-2 py-0.5 rounded-full">
                      Requires Review
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#555] mb-3">{tierConfig.description}</p>

                <div className="space-y-2">
                  <div>
                    <p className="text-[10px] font-medium text-[#ff7a00] uppercase tracking-wider mb-1">Included Limits</p>
                    <p className="text-xs text-[#888]">{getLimitsText(form.tier)}</p>
                  </div>

                  <div>
                    <p className="text-[10px] font-medium text-[#ff7a00] uppercase tracking-wider mb-1">Features</p>
                    <div className="flex flex-wrap gap-1.5">
                      {getFeaturesList(form.tier).map((feature, i) => (
                        <span key={i} className="inline-flex items-center gap-1 text-[10px] text-[#888] bg-[#111] px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="w-2.5 h-2.5 text-[#22c55e]" />
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {tierConfig.requiresReview && (
                  <div className="mt-3 p-2 bg-[#f59e0b]/10 border border-[#f59e0b]/20 rounded-md flex items-start gap-2">
                    <AlertCircle className="w-3.5 h-3.5 text-[#f59e0b] shrink-0 mt-0.5" />
                    <p className="text-[10px] text-[#f59e0b]">
                      Custom tier requires admin review. Your project will be pending until approved.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* N8N Integration */}
          {tierConfig.features.n8n && (
            <Section
              icon={<Workflow className="w-4 h-4 text-[#ff7a00]" />}
              title="N8N Workflow"
              expanded={expandedSections.n8n}
              onToggle={() => toggleSection('n8n')}
              enabled={form.n8n_enabled}
              onEnableChange={v => updateForm('n8n_enabled', v)}
              locked={!tierConfig.features.n8n}
            >
              <div className="space-y-3">
                <Field label="Webhook URL">
                  <input
                    type="url"
                    value={form.n8n_webhook_url}
                    onChange={e => updateForm('n8n_webhook_url', e.target.value)}
                    placeholder="https://n8n.example.com/webhook/..."
                    className="tpw-input"
                  />
                </Field>
                <Field label="Workflow ID">
                  <input
                    type="text"
                    value={form.n8n_workflow_id}
                    onChange={e => updateForm('n8n_workflow_id', e.target.value)}
                    placeholder="workflow-123"
                    className="tpw-input"
                  />
                </Field>
              </div>
            </Section>
          )}

          {/* WA/Telegram Tagging */}
          {tierConfig.features.tagging && (
            <Section
              icon={<MessageCircle className="w-4 h-4 text-[#25D366]" />}
              title="WA/Telegram Tagging"
              expanded={expandedSections.tagging}
              onToggle={() => toggleSection('tagging')}
              enabled={form.tagging_enabled}
              onEnableChange={v => updateForm('tagging_enabled', v)}
              locked={!tierConfig.features.tagging}
            >
              <div className="space-y-3">
                <Field label="WhatsApp Numbers">
                  <textarea
                    value={form.whatsapp_numbers}
                    onChange={e => updateForm('whatsapp_numbers', e.target.value)}
                    placeholder="Enter numbers, one per line (e.g., +62812345678)"
                    rows={2}
                    className="tpw-input resize-none"
                  />
                </Field>
                <Field label="Telegram Chat IDs">
                  <textarea
                    value={form.telegram_chat_ids}
                    onChange={e => updateForm('telegram_chat_ids', e.target.value)}
                    placeholder="Enter chat IDs, one per line"
                    rows={2}
                    className="tpw-input resize-none"
                  />
                </Field>
                <Field label="Message Template">
                  <textarea
                    value={form.tagging_message_template}
                    onChange={e => updateForm('tagging_message_template', e.target.value)}
                    placeholder="Your message template. Use {{name}}, {{event}}, etc."
                    rows={3}
                    className="tpw-input resize-none"
                  />
                </Field>
              </div>
            </Section>
          )}

          {/* AI Agent */}
          {tierConfig.features.ai_agent && (
            <Section
              icon={<Bot className="w-4 h-4 text-[#8b5cf6]" />}
              title="AI Agent"
              expanded={expandedSections.ai}
              onToggle={() => toggleSection('ai')}
              enabled={form.ai_agent_enabled}
              onEnableChange={v => updateForm('ai_agent_enabled', v)}
              locked={!tierConfig.features.ai_agent}
            >
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Provider">
                    <select
                      value={form.ai_provider}
                      onChange={e => updateForm('ai_provider', e.target.value as FormData['ai_provider'])}
                      className="tpw-input"
                    >
                      <option value="">Select provider</option>
                      <option value="openai">OpenAI</option>
                      <option value="anthropic">Anthropic</option>
                      <option value="custom">Custom</option>
                    </select>
                  </Field>
                  <Field label="Model">
                    <input
                      type="text"
                      value={form.ai_model}
                      onChange={e => updateForm('ai_model', e.target.value)}
                      placeholder="gpt-4, claude-3-opus..."
                      className="tpw-input"
                    />
                  </Field>
                </div>
                <Field label="System Prompt">
                  <textarea
                    value={form.ai_system_prompt}
                    onChange={e => updateForm('ai_system_prompt', e.target.value)}
                    placeholder="Define the AI agent's behavior..."
                    rows={4}
                    className="tpw-input resize-none"
                  />
                </Field>
              </div>
            </Section>
          )}

          {/* Scheduler */}
          {tierConfig.features.scheduler && (
            <Section
              icon={<Clock className="w-4 h-4 text-[#06b6d4]" />}
              title="Scheduler"
              expanded={expandedSections.scheduler}
              onToggle={() => toggleSection('scheduler')}
              enabled={form.scheduler_enabled}
              onEnableChange={v => updateForm('scheduler_enabled', v)}
              locked={!tierConfig.features.scheduler}
            >
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Cron Expression">
                    <input
                      type="text"
                      value={form.schedule_cron}
                      onChange={e => updateForm('schedule_cron', e.target.value)}
                      placeholder="0 9 * * * (daily at 9am)"
                      className="tpw-input"
                    />
                  </Field>
                  <Field label="Timezone">
                    <select
                      value={form.schedule_timezone}
                      onChange={e => updateForm('schedule_timezone', e.target.value)}
                      className="tpw-input"
                    >
                      {TIMEZONES.map(tz => (
                        <option key={tz} value={tz}>{tz}</option>
                      ))}
                    </select>
                  </Field>
                </div>
                <p className="text-[10px] text-[#444]">
                  Examples: "0 9 * * *" (daily at 9am), "0 9 * * 1" (every Monday), "*/30 * * * *" (every 30 min)
                </p>
              </div>
            </Section>
          )}

          {/* Publisher */}
          {tierConfig.features.publisher && (
            <Section
              icon={<Share2 className="w-4 h-4 text-[#ec4899]" />}
              title="Publisher"
              expanded={expandedSections.publisher}
              onToggle={() => toggleSection('publisher')}
              locked={!tierConfig.features.publisher}
              showEnable={false}
            >
              <div className="flex flex-wrap gap-2">
                <PublisherToggle
                  icon={<Facebook className="w-3.5 h-3.5" />}
                  label="Facebook"
                  active={form.publisher_facebook}
                  onChange={v => updateForm('publisher_facebook', v)}
                  color="#1877f2"
                />
                <PublisherToggle
                  icon={<Instagram className="w-3.5 h-3.5" />}
                  label="Instagram"
                  active={form.publisher_instagram}
                  onChange={v => updateForm('publisher_instagram', v)}
                  color="#e4405f"
                />
                <PublisherToggle
                  icon={<AtSign className="w-3.5 h-3.5" />}
                  label="Threads"
                  active={form.publisher_threads}
                  onChange={v => updateForm('publisher_threads', v)}
                  color="#000"
                />
                <PublisherToggle
                  icon={<Music className="w-3.5 h-3.5" />}
                  label="TikTok"
                  active={form.publisher_tiktok}
                  onChange={v => updateForm('publisher_tiktok', v)}
                  color="#000"
                />
              </div>
              <p className="text-[10px] text-[#444] mt-3">
                Enable platforms to publish content automatically. Credentials must be configured in settings.
              </p>
            </Section>
          )}

          {/* Report */}
          {tierConfig.features.report && (
            <Section
              icon={<BarChart3 className="w-4 h-4 text-[#10b981]" />}
              title="Report"
              expanded={expandedSections.report}
              onToggle={() => toggleSection('report')}
              enabled={form.report_enabled}
              onEnableChange={v => updateForm('report_enabled', v)}
              locked={!tierConfig.features.report}
            >
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Frequency">
                    <select
                      value={form.report_frequency}
                      onChange={e => updateForm('report_frequency', e.target.value as FormData['report_frequency'])}
                      className="tpw-input"
                    >
                      <option value="">Select frequency</option>
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </Field>
                  <Field label="Email">
                    <input
                      type="email"
                      value={form.report_email}
                      onChange={e => updateForm('report_email', e.target.value)}
                      placeholder="report@example.com"
                      className="tpw-input"
                    />
                  </Field>
                </div>
              </div>
            </Section>
          )}

          {/* PostgreSQL Database */}
          {tierConfig.features.database && (
            <Section
              icon={<Database className="w-4 h-4 text-[#336791]" />}
              title="PostgreSQL Database"
              expanded={expandedSections.database}
              onToggle={() => toggleSection('database')}
              enabled={form.db_connection_enabled}
              onEnableChange={v => updateForm('db_connection_enabled', v)}
              locked={!tierConfig.features.database}
            >
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Host">
                    <input
                      type="text"
                      value={form.db_host}
                      onChange={e => updateForm('db_host', e.target.value)}
                      placeholder="db.example.com"
                      className="tpw-input"
                    />
                  </Field>
                  <Field label="Port">
                    <input
                      type="number"
                      value={form.db_port}
                      onChange={e => updateForm('db_port', e.target.value)}
                      placeholder="5432"
                      className="tpw-input"
                    />
                  </Field>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Database Name">
                    <input
                      type="text"
                      value={form.db_name}
                      onChange={e => updateForm('db_name', e.target.value)}
                      placeholder="mydb"
                      className="tpw-input"
                    />
                  </Field>
                  <Field label="Username">
                    <input
                      type="text"
                      value={form.db_user}
                      onChange={e => updateForm('db_user', e.target.value)}
                      placeholder="postgres"
                      className="tpw-input"
                    />
                  </Field>
                </div>
                <Field label="Password Reference">
                  <input
                    type="text"
                    value={form.db_password_ref}
                    onChange={e => updateForm('db_password_ref', e.target.value)}
                    placeholder="Secret key name (stored securely)"
                    className="tpw-input"
                  />
                  <p className="text-[10px] text-[#444] mt-1">Password stored in Supabase secrets</p>
                </Field>
              </div>
            </Section>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-[#1f1f1f]">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 text-sm text-[#888] border border-[#1f1f1f] rounded-md hover:text-white hover:border-[#2a2a2a] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !form.name.trim()}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold bg-[#ff7a00] text-black rounded-md hover:bg-[#e86e00] transition-colors disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  {form.tier === 'custom' ? 'Submit for Review' : 'Save Project'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Section({
  icon,
  title,
  expanded,
  onToggle,
  children,
  enabled,
  onEnableChange,
  showEnable = true,
  locked = false,
}: {
  icon: React.ReactNode;
  title: string;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  enabled?: boolean;
  onEnableChange?: (v: boolean) => void;
  showEnable?: boolean;
  locked?: boolean;
}) {
  return (
    <div className={`border rounded-lg overflow-hidden ${locked ? 'opacity-40 pointer-events-none' : 'border-[#1f1f1f]'}`}>
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3 bg-[#111] hover:bg-[#151515] transition-colors"
      >
        <div className="flex items-center gap-3">
          {icon}
          <span className="text-sm font-medium text-white">{title}</span>
          {showEnable && enabled && !locked && (
            <span className="text-[10px] font-medium text-[#22c55e] bg-[#22c55e]/10 px-2 py-0.5 rounded-full">Enabled</span>
          )}
          {locked && (
            <span className="text-[10px] font-medium text-[#555] bg-[#222] px-2 py-0.5 rounded-full">Not Available</span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {showEnable && onEnableChange && !locked && (
            <label className="flex items-center gap-2 cursor-pointer" onClick={e => e.stopPropagation()}>
              <input
                type="checkbox"
                checked={enabled || false}
                onChange={e => onEnableChange(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-8 h-4 bg-[#2a2a2a] peer-checked:bg-[#ff7a00] rounded-full relative transition-colors">
                <div className="absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full peer-checked:translate-x-4 transition-transform" />
              </div>
            </label>
          )}
          {expanded ? (
            <ChevronUp className="w-4 h-4 text-[#555]" />
          ) : (
            <ChevronDown className="w-4 h-4 text-[#555]" />
          )}
        </div>
      </button>
      {expanded && (
        <div className="p-4 bg-[#0a0a0a] border-t border-[#1f1f1f]">
          {children}
        </div>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-[#888] mb-1.5">{label}</label>
      {children}
    </div>
  );
}

function PublisherToggle({
  icon,
  label,
  active,
  onChange,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onChange: (v: boolean) => void;
  color: string;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!active)}
      className={`flex items-center gap-2 px-3 py-2 rounded-md border transition-all ${
        active
          ? 'border-[#ff7a00] bg-[#ff7a00]/10 text-white'
          : 'border-[#1f1f1f] bg-[#111] text-[#555] hover:border-[#2a2a2a] hover:text-white'
      }`}
    >
      <span style={{ color: active ? color : undefined }}>{icon}</span>
      <span className="text-xs font-medium">{label}</span>
    </button>
  );
}

export const CATEGORY_LABELS: Record<ProjectCategory, string> = {
  event: 'Event',
  content: 'Content',
  business: 'Business',
  automation: 'Automation',
  custom: 'Custom',
};
