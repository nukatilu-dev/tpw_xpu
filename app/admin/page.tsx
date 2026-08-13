'use client';

import { useEffect, useState } from 'react';
import {
  Shield,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  DollarSign,
  Activity,
  Database,
  Workflow,
  HardDrive,
  Users,
  Plus,
  Trash2,
  Power,
  Link as LinkIcon,
  Server,
  Webhook,
  Bot,
  Mail,
  Save,
  X,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import PageLayout from '@/components/layout/PageLayout';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { TIER_CONFIGS } from '@/lib/tiers';
import type { ProjectAutomation, Profile, AdminConnection } from '@/lib/types';

type AdminStats = {
  totalAutomations: number;
  activeAutomations: number;
  pendingReviews: number;
  totalCreditTokens: number;
  totalTokensUsed: number;
  totalUsers: number;
};

const CONNECTION_TYPES: { value: AdminConnection['type']; label: string; icon: React.ReactNode }[] = [
  { value: 'n8n', label: 'N8N Workflow', icon: <Workflow className="w-4 h-4" /> },
  { value: 'database', label: 'Database', icon: <Database className="w-4 h-4" /> },
  { value: 'api', label: 'API Endpoint', icon: <Server className="w-4 h-4" /> },
  { value: 'webhook', label: 'Webhook', icon: <Webhook className="w-4 h-4" /> },
  { value: 'telegram_bot', label: 'Telegram Bot', icon: <Bot className="w-4 h-4" /> },
  { value: 'whatsapp_bot', label: 'WhatsApp Bot', icon: <Bot className="w-4 h-4" /> },
  { value: 'smtp', label: 'SMTP / Email', icon: <Mail className="w-4 h-4" /> },
];

export default function AdminPage() {
  const { user, profile } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [pendingAutomations, setPendingAutomations] = useState<ProjectAutomation[]>([]);
  const [allAutomations, setAllAutomations] = useState<ProjectAutomation[]>([]);
  const [activeView, setActiveView] = useState<'pending' | 'all' | 'connections'>('pending');
  const [selectedAutomation, setSelectedAutomation] = useState<ProjectAutomation | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [processing, setProcessing] = useState(false);

  // Connections state
  const [connections, setConnections] = useState<AdminConnection[]>([]);
  const [showConnForm, setShowConnForm] = useState(false);
  const [connForm, setConnForm] = useState<{ name: string; type: AdminConnection['type']; url: string; api_key_ref: string; config_text: string }>({
    name: '', type: 'n8n', url: '', api_key_ref: '', config_text: '',
  });
  const [connSaving, setConnSaving] = useState(false);
  const [connError, setConnError] = useState<string | null>(null);

  useEffect(() => {
    async function checkAdmin() {
      if (!user) { setLoading(false); return; }

      const { data: profileData } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .maybeSingle();

      const adminStatus = (profileData as Profile | null)?.is_admin ?? false;
      setIsAdmin(adminStatus);

      if (adminStatus) {
        await fetchAdminData();
        await fetchConnections();
      }
      setLoading(false);
    }
    checkAdmin();
  }, [user]);

  async function fetchAdminData() {
    const { data: automations } = await supabase
      .from('project_automations')
      .select('*')
      .order('created_at', { ascending: false });

    if (automations) {
      const typedAutomations = automations as ProjectAutomation[];
      setAllAutomations(typedAutomations);
      setPendingAutomations(typedAutomations.filter(a => a.review_status === 'pending'));

      const totalCreditTokens = typedAutomations.reduce((sum, a) => sum + (a.credit_tokens || 0), 0);
      const totalTokensUsed = typedAutomations.reduce((sum, a) => sum + (a.tokens_used || 0), 0);

      setStats({
        totalAutomations: typedAutomations.length,
        activeAutomations: typedAutomations.filter(a => a.status === 'active').length,
        pendingReviews: typedAutomations.filter(a => a.review_status === 'pending').length,
        totalCreditTokens,
        totalTokensUsed,
        totalUsers: new Set(typedAutomations.map(a => a.user_id)).size,
      });
    }
  }

  async function fetchConnections() {
    const { data } = await supabase
      .from('admin_connections')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setConnections(data as AdminConnection[]);
  }

  async function handleReview(automationId: string, approved: boolean) {
    if (!user) return;
    setProcessing(true);

    const reviewData = {
      review_status: approved ? 'approved' : 'rejected',
      review_notes: reviewNotes || null,
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
      status: approved ? 'active' : 'archived',
    };

    await supabase
      .from('project_automations')
      .update(reviewData)
      .eq('id', automationId);

    setSelectedAutomation(null);
    setReviewNotes('');
    await fetchAdminData();
    setProcessing(false);
  }

  async function handleSaveConnection() {
    setConnError(null);
    if (!connForm.name.trim()) { setConnError('Name is required'); return; }
    setConnSaving(true);

    let configJson: Record<string, unknown> | null = null;
    if (connForm.config_text.trim()) {
      try {
        configJson = JSON.parse(connForm.config_text);
      } catch {
        setConnError('Config must be valid JSON');
        setConnSaving(false);
        return;
      }
    }

    const { error } = await supabase.from('admin_connections').insert({
      name: connForm.name,
      type: connForm.type,
      url: connForm.url || null,
      api_key_ref: connForm.api_key_ref || null,
      config: configJson,
      is_active: true,
    });

    if (error) {
      setConnError(error.message);
    } else {
      setShowConnForm(false);
      setConnForm({ name: '', type: 'n8n', url: '', api_key_ref: '', config_text: '' });
      await fetchConnections();
    }
    setConnSaving(false);
  }

  async function toggleConnection(conn: AdminConnection) {
    await supabase
      .from('admin_connections')
      .update({ is_active: !conn.is_active, updated_at: new Date().toISOString() })
      .eq('id', conn.id);
    await fetchConnections();
  }

  async function deleteConnection(id: string) {
    await supabase
      .from('admin_connections')
      .delete()
      .eq('id', id);
    await fetchConnections();
  }

  if (loading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="w-6 h-6 border-2 border-[#ff7a00] border-t-transparent rounded-full animate-spin" />
        </div>
      </PageLayout>
    );
  }

  if (!user || !isAdmin) {
    return (
      <PageLayout>
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-8">
          <div className="text-center py-20 bg-[#0a0a0a] border border-[#1f1f1f] rounded-lg">
            <Shield className="w-12 h-12 text-[#1f1f1f] mx-auto mb-3" />
            <p className="text-sm font-medium text-white mb-1">Admin Access Required</p>
            <p className="text-xs text-[#555]">You don't have permission to view this page</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  const displayAutomations = activeView === 'pending' ? pendingAutomations : allAutomations;

  return (
    <PageLayout>
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 bg-[#ff7a00]/10 rounded-lg">
            <Shield className="w-5 h-5 text-[#ff7a00]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
            <p className="text-xs text-[#555]">Manage automations, credit tokens, approvals, and external connections</p>
          </div>
        </div>

        {/* Stats Grid */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
            <StatCard icon={<Activity className="w-4 h-4" />} label="Total Automations" value={stats.totalAutomations} color="#ff7a00" />
            <StatCard icon={<CheckCircle className="w-4 h-4" />} label="Active" value={stats.activeAutomations} color="#22c55e" />
            <StatCard icon={<Clock className="w-4 h-4" />} label="Pending Reviews" value={stats.pendingReviews} color="#f59e0b" highlight={stats.pendingReviews > 0} />
            <StatCard icon={<DollarSign className="w-4 h-4" />} label="Credit Tokens" value={stats.totalCreditTokens} color="#3b82f6" isToken />
            <StatCard icon={<DollarSign className="w-4 h-4" />} label="Tokens Used" value={stats.totalTokensUsed} color="#8b5cf6" isToken />
            <StatCard icon={<Users className="w-4 h-4" />} label="Active Users" value={stats.totalUsers} color="#ec4899" />
          </div>
        )}

        {/* View Tabs */}
        <div className="flex items-center gap-2 mb-6 flex-wrap">
          <TabBtn active={activeView === 'pending'} onClick={() => setActiveView('pending')}>
            Pending Reviews ({pendingAutomations.length})
          </TabBtn>
          <TabBtn active={activeView === 'all'} onClick={() => setActiveView('all')}>
            All Automations
          </TabBtn>
          <TabBtn active={activeView === 'connections'} onClick={() => setActiveView('connections')}>
            <LinkIcon className="w-3.5 h-3.5 mr-1 inline" />
            Connections ({connections.length})
          </TabBtn>
        </div>

        {/* CONNECTIONS VIEW */}
        {activeView === 'connections' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs text-[#555]">Configure real external service links (N8N, databases, bots, APIs). These replace dummy data with live connections.</p>
              <button
                onClick={() => setShowConnForm(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-[#ff7a00] text-black rounded-md hover:bg-[#e86e00] transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Connection
              </button>
            </div>

            {connections.length === 0 ? (
              <div className="text-center py-16 bg-[#0a0a0a] border border-[#1f1f1f] rounded-lg">
                <LinkIcon className="w-10 h-10 text-[#1f1f1f] mx-auto mb-3" />
                <p className="text-sm font-medium text-white mb-1">No connections yet</p>
                <p className="text-xs text-[#555]">Add your first external service connection to go live</p>
              </div>
            ) : (
              <div className="space-y-3">
                {connections.map((conn) => {
                  const typeInfo = CONNECTION_TYPES.find(t => t.value === conn.type);
                  return (
                    <div key={conn.id} className="p-4 bg-[#0a0a0a] border border-[#1f1f1f] rounded-lg hover:border-[#2a2a2a] transition-all">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className={`p-2 rounded-md ${conn.is_active ? 'bg-[#22c55e]/10 text-[#22c55e]' : 'bg-[#1f1f1f] text-[#555]'}`}>
                            {typeInfo?.icon || <LinkIcon className="w-4 h-4" />}
                          </div>
                          <div className="min-w-0">
                            <h3 className="text-sm font-semibold text-white truncate">{conn.name}</h3>
                            <div className="flex items-center gap-3 text-[10px] text-[#444] mt-0.5">
                              <span className="uppercase">{conn.type.replace('_', ' ')}</span>
                              {conn.url && <span className="truncate">{conn.url}</span>}
                              {conn.api_key_ref && <span className="text-[#f59e0b]">key: {conn.api_key_ref}</span>}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${conn.is_active ? 'text-[#22c55e] bg-[#22c55e]/10' : 'text-[#555] bg-[#1f1f1f]'}`}>
                            {conn.is_active ? 'Active' : 'Inactive'}
                          </span>
                          <button
                            onClick={() => toggleConnection(conn)}
                            className="p-1.5 text-[#555] hover:text-[#22c55e] hover:bg-[#22c55e]/10 rounded-md transition-colors"
                            title={conn.is_active ? 'Disable' : 'Enable'}
                          >
                            <Power className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => deleteConnection(conn.id)}
                            className="p-1.5 text-[#555] hover:text-[#ef4444] hover:bg-[#ef4444]/10 rounded-md transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Add Connection Form */}
            {showConnForm && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
                <div className="w-full max-w-lg bg-[#0a0a0a] border border-[#1f1f1f] rounded-xl shadow-2xl max-h-[90vh] overflow-y-auto">
                  <div className="sticky top-0 flex items-center justify-between px-5 py-4 border-b border-[#1f1f1f] bg-[#0a0a0a] z-10">
                    <h2 className="text-sm font-semibold text-white">Add External Connection</h2>
                    <button onClick={() => { setShowConnForm(false); setConnError(null); }} className="p-1.5 text-[#555] hover:text-white hover:bg-[#111] rounded-md transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="p-5 space-y-4">
                    {connError && (
                      <div className="p-3 bg-[#ef4444]/10 border border-[#ef4444]/20 rounded-md text-xs text-[#ef4444]">{connError}</div>
                    )}
                    <div>
                      <label className="block text-xs font-medium text-[#888] mb-1.5">Connection Name</label>
                      <input type="text" value={connForm.name} onChange={e => setConnForm({ ...connForm, name: e.target.value })} placeholder="e.g. Production N8N" className="tpw-input" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[#888] mb-1.5">Type</label>
                      <select value={connForm.type} onChange={e => setConnForm({ ...connForm, type: e.target.value as AdminConnection['type'] })} className="tpw-input">
                        {CONNECTION_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[#888] mb-1.5">URL / Endpoint</label>
                      <input type="text" value={connForm.url} onChange={e => setConnForm({ ...connForm, url: e.target.value })} placeholder="https://api.example.com/v1" className="tpw-input" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[#888] mb-1.5">API Key Reference Name</label>
                      <input type="text" value={connForm.api_key_ref} onChange={e => setConnForm({ ...connForm, api_key_ref: e.target.value })} placeholder="e.g. N8N_API_KEY (stored in secrets)" className="tpw-input" />
                      <p className="text-[10px] text-[#444] mt-1">Only the reference name, never the actual key value</p>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[#888] mb-1.5">Additional Config (JSON, optional)</label>
                      <textarea value={connForm.config_text} onChange={e => setConnForm({ ...connForm, config_text: e.target.value })} placeholder='{"port": 5678, "database": "production"}' rows={3} className="tpw-input resize-none font-mono text-xs" />
                    </div>
                    <div className="flex gap-3 pt-2">
                      <button onClick={() => { setShowConnForm(false); setConnError(null); }} className="flex-1 px-4 py-2 text-sm text-[#888] border border-[#1f1f1f] rounded-md hover:text-white hover:border-[#2a2a2a] transition-colors">
                        Cancel
                      </button>
                      <button onClick={handleSaveConnection} disabled={connSaving} className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold bg-[#ff7a00] text-black rounded-md hover:bg-[#e86e00] transition-colors disabled:opacity-50">
                        <Save className="w-4 h-4" />
                        {connSaving ? 'Saving...' : 'Save Connection'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* AUTOMATIONS VIEW */}
        {activeView !== 'connections' && (
          <>
            {displayAutomations.length === 0 ? (
              <div className="text-center py-16 bg-[#0a0a0a] border border-[#1f1f1f] rounded-lg">
                <CheckCircle className="w-10 h-10 text-[#22c55e] mx-auto mb-3" />
                <p className="text-sm font-medium text-white mb-1">
                  {activeView === 'pending' ? 'No pending reviews' : 'No automations found'}
                </p>
                <p className="text-xs text-[#555]">
                  {activeView === 'pending' ? 'All requests have been processed' : 'Automations will appear here'}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {displayAutomations.map((automation) => (
                  <div key={automation.id} className="p-4 bg-[#0a0a0a] border border-[#1f1f1f] rounded-lg hover:border-[#2a2a2a] transition-all">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <h3 className="text-sm font-semibold text-white">{automation.name}</h3>
                          <span className="text-[10px] font-medium text-[#ff7a00] bg-[#ff7a00]/10 px-2 py-0.5 rounded-full capitalize">{automation.tier}</span>
                          {automation.review_status && (
                            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                              automation.review_status === 'approved' ? 'text-[#22c55e] bg-[#22c55e]/10' :
                              automation.review_status === 'rejected' ? 'text-[#ef4444] bg-[#ef4444]/10' :
                              'text-[#f59e0b] bg-[#f59e0b]/10'
                            }`}>
                              {automation.review_status}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-[10px] text-[#444]">
                          <span>ID: {automation.id.slice(0, 8)}...</span>
                          <span>User: {automation.user_id.slice(0, 8)}...</span>
                          <span>Category: {automation.category.replace('_', ' ')}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-[10px] text-[#444]">Credit Tokens</p>
                          <p className="text-sm font-semibold text-white">{automation.credit_tokens || 100}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] text-[#444]">Used</p>
                          <p className="text-sm font-semibold text-[#ff7a00]">{automation.tokens_used || 0}</p>
                        </div>
                        <button onClick={() => setSelectedAutomation(automation)} className="px-3 py-1.5 text-xs text-[#888] border border-[#1f1f1f] rounded-md hover:text-white hover:border-[#2a2a2a] transition-colors flex items-center gap-1">
                          <Eye className="w-3 h-3" /> View
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Detail Modal */}
        {selectedAutomation && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
            <div className="w-full max-w-2xl bg-[#0a0a0a] border border-[#1f1f1f] rounded-xl shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 flex items-center justify-between px-5 py-4 border-b border-[#1f1f1f] bg-[#0a0a0a] z-10">
                <div>
                  <h2 className="text-sm font-semibold text-white">{selectedAutomation.name}</h2>
                  <p className="text-xs text-[#555] capitalize">{selectedAutomation.tier} Tier | {selectedAutomation.category.replace('_', ' ')}</p>
                </div>
                <button onClick={() => { setSelectedAutomation(null); setReviewNotes(''); }} className="p-1.5 text-[#555] hover:text-white hover:bg-[#111] rounded-md transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-5 space-y-4">
                <div className="p-4 bg-[#111] border border-[#1f1f1f] rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-medium text-[#888]">Credit Tokens</span>
                    <span className="text-xs text-[#444]">Admin Only</span>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div><p className="text-[10px] text-[#444] mb-1">Allocated</p><p className="text-lg font-bold text-white">{selectedAutomation.credit_tokens || 100}</p></div>
                    <div><p className="text-[10px] text-[#444] mb-1">Used</p><p className="text-lg font-bold text-[#ff7a00]">{selectedAutomation.tokens_used || 0}</p></div>
                    <div><p className="text-[10px] text-[#444] mb-1">Remaining</p><p className="text-lg font-bold text-[#22c55e]">{(selectedAutomation.credit_tokens || 100) - (selectedAutomation.tokens_used || 0)}</p></div>
                  </div>
                </div>
                <div className="p-4 bg-[#111] border border-[#1f1f1f] rounded-lg">
                  <p className="text-xs font-medium text-[#888] mb-3">Tier Configuration</p>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="flex items-center gap-2"><Workflow className="w-3.5 h-3.5 text-[#ff7a00]" /><span className="text-[#888]">Workflows:</span><span className="text-white">{TIER_CONFIGS[selectedAutomation.tier].limits.workflows === 'unlimited' ? 'Unlimited' : TIER_CONFIGS[selectedAutomation.tier].limits.workflows}</span></div>
                    <div className="flex items-center gap-2"><Database className="w-3.5 h-3.5 text-[#336791]" /><span className="text-[#888]">Database:</span><span className="text-white capitalize">{TIER_CONFIGS[selectedAutomation.tier].limits.database}</span></div>
                    <div className="flex items-center gap-2"><Activity className="w-3.5 h-3.5 text-[#22c55e]" /><span className="text-[#888]">Analytics:</span><span className="text-white capitalize">{TIER_CONFIGS[selectedAutomation.tier].limits.analytics}</span></div>
                    <div className="flex items-center gap-2"><HardDrive className="w-3.5 h-3.5 text-[#8b5cf6]" /><span className="text-[#888]">Support:</span><span className="text-white capitalize">{TIER_CONFIGS[selectedAutomation.tier].limits.support}</span></div>
                  </div>
                </div>
                <div className="p-4 bg-[#111] border border-[#1f1f1f] rounded-lg">
                  <p className="text-xs font-medium text-[#888] mb-3">Enabled Features</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedAutomation.n8n_enabled && <FeatureBadge label="N8N" />}
                    {selectedAutomation.tagging_enabled && <FeatureBadge label="Tagging" />}
                    {selectedAutomation.ai_agent_enabled && <FeatureBadge label="AI Agent" color="#8b5cf6" />}
                    {selectedAutomation.scheduler_enabled && <FeatureBadge label="Scheduler" color="#06b6d4" />}
                    {selectedAutomation.publisher_facebook && <FeatureBadge label="Facebook" />}
                    {selectedAutomation.publisher_instagram && <FeatureBadge label="Instagram" />}
                    {selectedAutomation.publisher_threads && <FeatureBadge label="Threads" />}
                    {selectedAutomation.publisher_tiktok && <FeatureBadge label="TikTok" />}
                    {selectedAutomation.report_enabled && <FeatureBadge label="Report" color="#10b981" />}
                    {selectedAutomation.db_connection_enabled && <FeatureBadge label="Database" color="#336791" />}
                  </div>
                </div>
                {selectedAutomation.review_status === 'pending' && (
                  <div className="p-4 bg-[#f59e0b]/10 border border-[#f59e0b]/20 rounded-lg">
                    <p className="text-xs font-semibold text-[#f59e0b] mb-3">Review Required</p>
                    <textarea value={reviewNotes} onChange={(e) => setReviewNotes(e.target.value)} placeholder="Add review notes (optional)..." rows={3} className="w-full bg-[#0a0a0a] border border-[#1f1f1f] rounded-md px-3 py-2 text-sm text-white placeholder-[#444] resize-none focus:outline-none focus:border-[#ff7a00]" />
                    <div className="flex gap-3 mt-3">
                      <button onClick={() => handleReview(selectedAutomation.id, false)} disabled={processing} className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-[#ef4444] border border-[#ef4444]/30 rounded-md hover:bg-[#ef4444]/10 transition-colors disabled:opacity-50">
                        <XCircle className="w-4 h-4" /> Reject
                      </button>
                      <button onClick={() => handleReview(selectedAutomation.id, true)} disabled={processing} className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold bg-[#22c55e] text-black rounded-md hover:bg-[#16a34a] transition-colors disabled:opacity-50">
                        <CheckCircle className="w-4 h-4" /> Approve
                      </button>
                    </div>
                  </div>
                )}
                {selectedAutomation.review_status !== 'pending' && selectedAutomation.review_status !== 'not_required' && (
                  <div className="p-4 bg-[#111] border border-[#1f1f1f] rounded-lg">
                    <p className="text-xs font-medium text-[#888] mb-2">Review Status</p>
                    <div className="flex items-center gap-2">
                      {selectedAutomation.review_status === 'approved' ? <CheckCircle className="w-4 h-4 text-[#22c55e]" /> : <XCircle className="w-4 h-4 text-[#ef4444]" />}
                      <span className="text-sm text-white capitalize">{selectedAutomation.review_status}</span>
                    </div>
                    {selectedAutomation.review_notes && <p className="text-xs text-[#555] mt-2">{selectedAutomation.review_notes}</p>}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  );
}

function TabBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${active ? 'bg-[#ff7a00] text-black' : 'bg-[#0a0a0a] border border-[#1f1f1f] text-[#888] hover:text-white'}`}>
      {children}
    </button>
  );
}

function StatCard({ icon, label, value, color, highlight, isToken }: { icon: React.ReactNode; label: string; value: number; color: string; highlight?: boolean; isToken?: boolean }) {
  return (
    <div className={`p-4 bg-[#0a0a0a] rounded-lg border ${highlight ? 'border-[#f59e0b]' : 'border-[#1f1f1f]'}`}>
      <div className="flex items-center gap-2 mb-2">
        <span style={{ color }}>{icon}</span>
        <span className="text-[10px] text-[#555]">{label}</span>
      </div>
      <p className={`text-xl font-bold ${highlight ? 'text-[#f59e0b]' : 'text-white'}`}>{value.toLocaleString()}{isToken ? ' CT' : ''}</p>
    </div>
  );
}

function FeatureBadge({ label, color }: { label: string; color?: string }) {
  return <span className="text-[10px] font-medium px-2 py-1 rounded-full bg-[#111] text-white" style={{ color: color || '#888' }}>{label}</span>;
}
