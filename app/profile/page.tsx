'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  User,
  Building2,
  Globe,
  Phone,
  Twitter,
  Linkedin,
  Github,
  Send,
  Save,
  CheckCircle,
  MessageCircle,
  Mail,
  Shield,
  Calendar,
  Clock,
  Fingerprint,
  KeyRound,
  Database,
  Share2,
  Lock,
  RefreshCw,
} from 'lucide-react';
import PageLayout from '@/components/layout/PageLayout';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';

type ProfileForm = {
  full_name: string;
  username: string;
  bio: string;
  company: string;
  job_title: string;
  phone: string;
  website: string;
  whatsapp_number: string;
  telegram_username: string;
  twitter_username: string;
  linkedin_url: string;
  github_username: string;
};

const DEFAULT_FORM: ProfileForm = {
  full_name: '',
  username: '',
  bio: '',
  company: '',
  job_title: '',
  phone: '',
  website: '',
  whatsapp_number: '',
  telegram_username: '',
  twitter_username: '',
  linkedin_url: '',
  github_username: '',
};

export default function ProfilePage() {
  const { user, session, profile, refreshProfile } = useAuth();
  const [form, setForm] = useState<ProfileForm>(DEFAULT_FORM);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'profile' | 'security'>('profile');

  useEffect(() => {
    if (profile) {
      setForm({
        full_name: profile.full_name || '',
        username: profile.username || '',
        bio: profile.bio || '',
        company: profile.company || '',
        job_title: profile.job_title || '',
        phone: profile.phone || '',
        website: profile.website || '',
        whatsapp_number: profile.whatsapp_number || '',
        telegram_username: profile.telegram_username || '',
        twitter_username: profile.twitter_username || '',
        linkedin_url: profile.linkedin_url || '',
        github_username: profile.github_username || '',
      });
    }
  }, [profile]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setError(null);
    setSaving(true);

    const { error } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        ...form,
        updated_at: new Date().toISOString(),
      });

    if (error) {
      setError(error.message);
    } else {
      await refreshProfile();
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
    setSaving(false);
  }

  if (!user) {
    return (
      <PageLayout>
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-20 text-center">
          <User className="w-12 h-12 text-[#1f1f1f] mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-white mb-2">Sign in required</h2>
          <p className="text-sm text-[#555] mb-6">You need to be signed in to view your profile.</p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#ff7a00] text-black text-sm font-semibold rounded-md hover:bg-[#e86e00] transition-colors"
          >
            Sign in
          </Link>
        </div>
      </PageLayout>
    );
  }

  const displayName = form.full_name || user.email?.split('@')[0] || 'User';
  const joinDate = profile?.created_at ? new Date(profile.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '—';
  const sessionExpiry = session?.expires_at ? new Date(session.expires_at * 1000).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }) : '—';
  const jwtToken = session?.access_token ?? '';
  const jwtPreview = jwtToken ? `${jwtToken.slice(0, 20)}...${jwtToken.slice(-12)}` : '—';
  const userIdShort = user.id.slice(0, 8) + '...' + user.id.slice(-4);

  // Parse JWT payload (decode base64 middle section)
  let jwtPayload: Record<string, unknown> | null = null;
  if (jwtToken) {
    try {
      const parts = jwtToken.split('.');
      if (parts.length >= 2) {
        const payloadB64 = parts[1];
        const payloadJson = atob(payloadB64.replace(/-/g, '+').replace(/_/g, '/'));
        jwtPayload = JSON.parse(payloadJson);
      }
    } catch { /* ignore decode errors */ }
  }

  const jwtRole = (jwtPayload?.['role'] as string) ?? 'authenticated';
  const jwtIssuedAt = jwtPayload?.['iat'] ? new Date((jwtPayload['iat'] as number) * 1000).toLocaleString('en-US', { dateStyle: 'short', timeStyle: 'short' }) : '—';
  const jwtExpiry = jwtPayload?.['exp'] ? new Date((jwtPayload['exp'] as number) * 1000).toLocaleString('en-US', { dateStyle: 'short', timeStyle: 'short' }) : '—';

  return (
    <PageLayout>
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-[#ff7a00] rounded-full flex items-center justify-center text-black text-2xl font-bold shrink-0">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-xs font-semibold tracking-[0.15em] text-[#555] uppercase mb-1">Account</p>
              <h1 className="text-2xl font-bold text-white">{displayName}</h1>
              <div className="flex items-center gap-3 mt-1 flex-wrap">
                {user.email && (
                  <span className="flex items-center gap-1 text-xs text-[#555]">
                    <Mail className="w-3 h-3" />
                    {user.email}
                  </span>
                )}
                {profile?.whatsapp_number && (
                  <span className="flex items-center gap-1 text-xs text-[#555]">
                    <MessageCircle className="w-3 h-3" />
                    {profile.whatsapp_number}
                  </span>
                )}
                {profile?.telegram_username && (
                  <span className="flex items-center gap-1 text-xs text-[#555]">
                    <Send className="w-3 h-3" />
                    {profile.telegram_username}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs text-[#555]">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              Joined {joinDate}
            </div>
            {profile?.role && (
              <div className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5" />
                <span className="capitalize">{profile.role}</span>
              </div>
            )}
          </div>
        </div>

        {/* Verification badges */}
        <div className="mb-6 flex flex-wrap gap-3">
          <VerifyBadge label="Email" verified={!!user.email} />
          <VerifyBadge label="WhatsApp" verified={!!profile?.whatsapp_verified} />
          <VerifyBadge label="Telegram" verified={!!profile?.telegram_verified} />
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 mb-6 border-b border-[#1f1f1f]">
          <TabButton active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} icon={<User className="w-3.5 h-3.5" />}>
            Profile
          </TabButton>
          <TabButton active={activeTab === 'security'} onClick={() => setActiveTab('security')} icon={<Shield className="w-3.5 h-3.5" />}>
            Security & Session
          </TabButton>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-[#ef4444]/10 border border-[#ef4444]/20 rounded-md text-sm text-[#ef4444]">
            {error}
          </div>
        )}

        {saved && (
          <div className="mb-6 p-3 bg-[#22c55e]/10 border border-[#22c55e]/20 rounded-md text-sm text-[#22c55e] flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            Profile saved successfully
          </div>
        )}

        {/* PROFILE TAB */}
        {activeTab === 'profile' && (
          <form onSubmit={handleSave} className="space-y-8">

            {/* Personal Information */}
            <section>
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[#1f1f1f]">
                <User className="w-4 h-4 text-[#ff7a00]" />
                <h2 className="text-sm font-semibold text-white">Personal Information</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#888] mb-1.5">Full Name</label>
                  <input type="text" value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} placeholder="Your full name" className="tpw-input" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#888] mb-1.5">Username</label>
                  <input type="text" value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} placeholder="@username" className="tpw-input" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-[#888] mb-1.5">Bio</label>
                  <textarea value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} placeholder="Short bio or description" rows={3} className="tpw-input resize-none" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#888] mb-1.5">Phone</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#555]" />
                    <input type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+1 (555) 000-0000" className="tpw-input pl-9" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#888] mb-1.5">Website</label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#555]" />
                    <input type="url" value={form.website} onChange={e => setForm({ ...form, website: e.target.value })} placeholder="https://yourwebsite.com" className="tpw-input pl-9" />
                  </div>
                </div>
              </div>
            </section>

            {/* Messaging */}
            <section>
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[#1f1f1f]">
                <MessageCircle className="w-4 h-4 text-[#ff7a00]" />
                <h2 className="text-sm font-semibold text-white">Messaging</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#888] mb-1.5">WhatsApp Number</label>
                  <div className="relative">
                    <MessageCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#25D366]" />
                    <input type="tel" value={form.whatsapp_number} onChange={e => setForm({ ...form, whatsapp_number: e.target.value })} placeholder="+62 812 3456 7890" className="tpw-input pl-9" />
                  </div>
                  <p className="text-[10px] text-[#444] mt-1">Used for WhatsApp login and notifications</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#888] mb-1.5">Telegram Username</label>
                  <div className="relative">
                    <Send className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#0088cc]" />
                    <input type="text" value={form.telegram_username} onChange={e => setForm({ ...form, telegram_username: e.target.value })} placeholder="@username" className="tpw-input pl-9" />
                  </div>
                  <p className="text-[10px] text-[#444] mt-1">Used for Telegram login and bot notifications</p>
                </div>
              </div>
            </section>

            {/* Company Information */}
            <section>
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[#1f1f1f]">
                <Building2 className="w-4 h-4 text-[#ff7a00]" />
                <h2 className="text-sm font-semibold text-white">Company Information</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#888] mb-1.5">Company</label>
                  <input type="text" value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} placeholder="Company name" className="tpw-input" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#888] mb-1.5">Job Title</label>
                  <input type="text" value={form.job_title} onChange={e => setForm({ ...form, job_title: e.target.value })} placeholder="Your role or position" className="tpw-input" />
                </div>
              </div>
            </section>

            {/* Social Links */}
            <section>
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[#1f1f1f]">
                <Globe className="w-4 h-4 text-[#ff7a00]" />
                <h2 className="text-sm font-semibold text-white">Social Links</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#888] mb-1.5">Twitter / X</label>
                  <div className="relative">
                    <Twitter className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#555]" />
                    <input type="text" value={form.twitter_username} onChange={e => setForm({ ...form, twitter_username: e.target.value })} placeholder="@handle" className="tpw-input pl-9" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#888] mb-1.5">LinkedIn</label>
                  <div className="relative">
                    <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#555]" />
                    <input type="url" value={form.linkedin_url} onChange={e => setForm({ ...form, linkedin_url: e.target.value })} placeholder="https://linkedin.com/in/..." className="tpw-input pl-9" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#888] mb-1.5">GitHub</label>
                  <div className="relative">
                    <Github className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#555]" />
                    <input type="text" value={form.github_username} onChange={e => setForm({ ...form, github_username: e.target.value })} placeholder="username" className="tpw-input pl-9" />
                  </div>
                </div>
              </div>
            </section>

            {/* Save */}
            <div className="flex justify-end pt-2">
              <button type="submit" disabled={saving} className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#ff7a00] text-black text-sm font-semibold rounded-md hover:bg-[#e86e00] transition-colors disabled:opacity-50">
                <Save className="w-4 h-4" />
                {saving ? 'Saving...' : 'Save Profile'}
              </button>
            </div>
          </form>
        )}

        {/* SECURITY TAB */}
        {activeTab === 'security' && (
          <div className="space-y-6 max-w-3xl">

            {/* UUID / User ID */}
            <SecurityCard
              icon={<Fingerprint className="w-4 h-4" />}
              title="User UUID"
              description="Your unique identifier across the platform. Used as primary key in all user-linked tables."
            >
              <div className="flex items-center gap-2 bg-[#050505] border border-[#1f1f1f] rounded-md px-3 py-2">
                <code className="text-xs text-[#ff7a00] font-mono break-all">{user.id}</code>
              </div>
              <p className="text-[10px] text-[#444] mt-2">Short form: <code className="text-[#888]">{userIdShort}</code></p>
            </SecurityCard>

            {/* JWT / Session */}
            <SecurityCard
              icon={<KeyRound className="w-4 h-4" />}
              title="JWT Session Token"
              description="Your current authentication token. Signed by Supabase Auth, contains your role and expiry."
            >
              <div className="space-y-3">
                <div className="flex items-center gap-2 bg-[#050505] border border-[#1f1f1f] rounded-md px-3 py-2">
                  <code className="text-xs text-[#888] font-mono break-all">{jwtPreview}</code>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <InfoRow label="Role" value={jwtRole} />
                  <InfoRow label="Session Expires" value={sessionExpiry} />
                  <InfoRow label="Token Issued" value={jwtIssuedAt} />
                  <InfoRow label="Token Expires" value={jwtExpiry} />
                </div>
              </div>
            </SecurityCard>

            {/* Password / bcrypt */}
            <SecurityCard
              icon={<Lock className="w-4 h-4" />}
              title="Password Security (bcrypt)"
              description="Your password is hashed with bcrypt inside Supabase Auth. The plaintext is never stored or visible to anyone, including admins."
            >
              <div className="space-y-2">
                <InfoRow label="Hash Algorithm" value="bcrypt (cost 10)" />
                <InfoRow label="Stored In" value="auth.users (encrypted)" />
                <InfoRow label="Password Visible" value="No — hashed only" />
                <div className="flex items-center gap-2 mt-3">
                  <Link
                    href="/login"
                    className="text-xs text-[#ff7a00] hover:underline"
                  >
                    Change password via login page
                  </Link>
                </div>
              </div>
            </SecurityCard>

            {/* Shared Tables */}
            <SecurityCard
              icon={<Share2 className="w-4 h-4" />}
              title="Shared Tables Access"
              description="Tables your account can read/write based on Row Level Security policies."
            >
              <div className="space-y-2">
                <TableRow name="profiles" access="Own row (SELECT, UPDATE)" />
                <TableRow name="project_automations" access="Own rows (CRUD)" />
                <TableRow name="activity_log" access="Own rows (CRUD)" />
                <TableRow name="apps" access="Public read, auth write" />
                <TableRow name="event_automations" access="Own rows (CRUD)" />
                {profile?.is_admin && (
                  <TableRow name="admin_connections" access="Admin (CRUD)" highlight />
                )}
              </div>
            </SecurityCard>

            {/* Database info */}
            <SecurityCard
              icon={<Database className="w-4 h-4" />}
              title="Database Connection"
              description="Your data is stored in PostgreSQL via Supabase. Access is controlled by RLS policies per table."
            >
              <div className="space-y-2">
                <InfoRow label="Database" value="PostgreSQL (Supabase)" />
                <InfoRow label="RLS Status" value="Enabled on all tables" />
                <InfoRow label="Auth Method" value="JWT + anon key" />
              </div>
            </SecurityCard>

            {/* Refresh session */}
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-[#888] border border-[#1f1f1f] rounded-md hover:text-white hover:border-[#2a2a2a] transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Refresh Session
              </button>
              <p className="text-[10px] text-[#444]">Reloads the page to fetch a fresh JWT from Supabase Auth.</p>
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  );
}

function TabButton({ active, onClick, icon, children }: { active: boolean; onClick: () => void; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
        active
          ? 'text-white border-[#ff7a00]'
          : 'text-[#555] border-transparent hover:text-[#888]'
      }`}
    >
      {icon}
      {children}
    </button>
  );
}

function VerifyBadge({ label, verified }: { label: string; verified: boolean }) {
  return (
    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium ${
      verified
        ? 'bg-[#22c55e]/10 text-[#22c55e] border border-[#22c55e]/20'
        : 'bg-[#0a0a0a] text-[#555] border border-[#1f1f1f]'
    }`}>
      {verified ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
      {label} {verified ? 'Verified' : 'Unverified'}
    </div>
  );
}

function SecurityCard({ icon, title, description, children }: { icon: React.ReactNode; title: string; description: string; children: React.ReactNode }) {
  return (
    <div className="bg-[#0a0a0a] border border-[#1f1f1f] rounded-lg p-5">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-[#ff7a00]">{icon}</span>
        <h3 className="text-sm font-semibold text-white">{title}</h3>
      </div>
      <p className="text-xs text-[#555] mb-4">{description}</p>
      {children}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between bg-[#050505] border border-[#1f1f1f] rounded-md px-3 py-2">
      <span className="text-[10px] text-[#444]">{label}</span>
      <span className="text-xs text-[#888] font-mono">{value}</span>
    </div>
  );
}

function TableRow({ name, access, highlight }: { name: string; access: string; highlight?: boolean }) {
  return (
    <div className={`flex items-center justify-between px-3 py-2 rounded-md border ${
      highlight ? 'bg-[#ff7a00]/5 border-[#ff7a00]/20' : 'bg-[#050505] border-[#1f1f1f]'
    }`}>
      <div className="flex items-center gap-2">
        <Database className={`w-3 h-3 ${highlight ? 'text-[#ff7a00]' : 'text-[#555]'}`} />
        <code className={`text-xs font-mono ${highlight ? 'text-[#ff7a00]' : 'text-[#888]'}`}>{name}</code>
      </div>
      <span className={`text-[10px] ${highlight ? 'text-[#ff7a00]' : 'text-[#555]'}`}>{access}</span>
    </div>
  );
}
