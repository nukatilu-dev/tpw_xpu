'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ChevronDown,
  ChevronUp,
  LifeBuoy,
  Ticket,
  FileText,
  CheckCircle,
  MessageCircle,
  Send,
  Mail,
} from 'lucide-react';
import PageLayout from '@/components/layout/PageLayout';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';

const FAQ_ITEMS = [
  {
    question: 'What is The Portal We (TPW)?',
    answer: 'TPW is an enterprise SaaS platform that unifies AI tools, CRM, event management, cloud infrastructure, and communication channels in a single dashboard.',
  },
  {
    question: 'How do I get access to all apps?',
    answer: 'Create a free account and visit the Apps Directory. Active apps are immediately accessible. Apps in development will be available as they launch.',
  },
  {
    question: 'How does Telegram Login work?',
    answer: 'Telegram authentication is coming soon. We\'re integrating Telegram\'s native OAuth flow so you can log in with your Telegram account securely.',
  },
  {
    question: 'Can I use TPW as a guest?',
    answer: 'Yes. Guest access lets you explore the platform, browse apps, and view the portfolio without creating an account. Some features like events and profile require an account.',
  },
  {
    question: 'What is the TPW Cloud?',
    answer: 'TPW Cloud is our infrastructure layer — providing database, AI inference, automation workflows, and monitoring for all platform services.',
  },
  {
    question: 'How do I integrate N8N automation?',
    answer: 'N8N integration is built into the Automation service in TPW Cloud. You can connect workflows via webhook endpoints that we provide in the platform.',
  },
  {
    question: 'Is my data secure?',
    answer: 'Yes. We use Supabase with Row Level Security (RLS) policies, meaning each user can only access their own data. All connections are encrypted via TLS.',
  },
];

const DOCS_LINKS = [
  { label: 'Getting Started', href: '/coming-soon', desc: 'Set up your account and explore the platform' },
  { label: 'API Reference', href: '/coming-soon', desc: 'Integrate TPW into your own applications' },
  { label: 'N8N Integration Guide', href: '/coming-soon', desc: 'Automate workflows with N8N and TPW' },
  { label: 'Telegram Bot Setup', href: '/coming-soon', desc: 'Connect your Telegram bot to TPW Broadcast' },
];

type Priority = 'low' | 'medium' | 'high' | 'critical';
type Category = 'general' | 'billing' | 'technical' | 'feature';

export default function SupportPage() {
  const { user } = useAuth();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'faq' | 'ticket' | 'docs'>('faq');

  const [form, setForm] = useState({
    subject: '',
    message: '',
    email: '',
    category: 'general' as Category,
    priority: 'medium' as Priority,
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  async function handleTicketSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);

    if (!user) {
      setFormError('You must be signed in to submit a support ticket.');
      setSubmitting(false);
      return;
    }

    const { error } = await supabase.from('support_tickets').insert({
      user_id: user.id,
      subject: form.subject,
      message: form.message,
      email: form.email || user.email || '',
      category: form.category,
      priority: form.priority,
      status: 'open',
    });

    if (error) {
      setFormError(error.message);
    } else {
      setSubmitted(true);
      setForm({ subject: '', message: '', email: '', category: 'general', priority: 'medium' });
    }
    setSubmitting(false);
  }

  return (
    <PageLayout>
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-8">

        {/* Header */}
        <div className="mb-8">
          <p className="text-xs font-semibold tracking-[0.15em] text-[#555] uppercase mb-1">Help</p>
          <h1 className="text-2xl font-bold text-white mb-1">Support Center</h1>
          <p className="text-sm text-[#555]">Find answers, submit tickets, or browse documentation</p>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 mb-8 border-b border-[#1f1f1f]">
          {[
            { key: 'faq', label: 'FAQ', icon: LifeBuoy },
            { key: 'ticket', label: 'Submit Ticket', icon: Ticket },
            { key: 'docs', label: 'Documentation', icon: FileText },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key as typeof activeTab)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
                activeTab === key
                  ? 'text-[#ff7a00] border-[#ff7a00]'
                  : 'text-[#888] border-transparent hover:text-white'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          ))}
        </div>

        {/* FAQ */}
        {activeTab === 'faq' && (
          <div className="max-w-2xl space-y-2">
            {FAQ_ITEMS.map((item, i) => (
              <div key={i} className="bg-[#0a0a0a] border border-[#1f1f1f] rounded-lg overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-4 py-3.5 text-left hover:bg-[#111] transition-colors"
                >
                  <span className="text-sm font-medium text-white pr-4">{item.question}</span>
                  {openFaq === i ? (
                    <ChevronUp className="w-4 h-4 text-[#555] shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-[#555] shrink-0" />
                  )}
                </button>
                {openFaq === i && (
                  <div className="px-4 pb-4 border-t border-[#1f1f1f]">
                    <p className="text-sm text-[#888] pt-3 leading-relaxed">{item.answer}</p>
                  </div>
                )}
              </div>
            ))}

            {/* Contact links */}
            <div className="mt-6 p-4 bg-[#0a0a0a] border border-[#1f1f1f] rounded-lg">
              <p className="text-sm font-medium text-white mb-3">Still need help?</p>
              <div className="flex items-center gap-2 flex-wrap">
                <a
                  href="https://t.me/theportalwe"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-1.5 text-xs text-[#888] bg-[#111] border border-[#1f1f1f] rounded-md hover:text-white hover:border-[#2a2a2a] transition-colors"
                >
                  <Send className="w-3 h-3" />
                  Telegram
                </a>
                <a
                  href="https://wa.me/theportalwe"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-1.5 text-xs text-[#888] bg-[#111] border border-[#1f1f1f] rounded-md hover:text-white hover:border-[#2a2a2a] transition-colors"
                >
                  <MessageCircle className="w-3 h-3" />
                  WhatsApp
                </a>
                <a
                  href="mailto:hello@theportalwe.com"
                  className="flex items-center gap-2 px-3 py-1.5 text-xs text-[#888] bg-[#111] border border-[#1f1f1f] rounded-md hover:text-white hover:border-[#2a2a2a] transition-colors"
                >
                  <Mail className="w-3 h-3" />
                  Email
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Ticket */}
        {activeTab === 'ticket' && (
          <div className="max-w-lg">
            {!user && (
              <div className="mb-6 p-4 bg-[#f59e0b]/10 border border-[#f59e0b]/20 rounded-lg text-sm text-[#f59e0b]">
                You must be{' '}
                <Link href="/login" className="underline hover:no-underline">
                  signed in
                </Link>{' '}
                to submit a support ticket.
              </div>
            )}

            {submitted ? (
              <div className="p-6 bg-[#22c55e]/10 border border-[#22c55e]/20 rounded-lg text-center">
                <CheckCircle className="w-10 h-10 text-[#22c55e] mx-auto mb-3" />
                <p className="text-sm font-semibold text-white mb-1">Ticket submitted</p>
                <p className="text-xs text-[#555]">We&apos;ll get back to you as soon as possible.</p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="mt-4 px-4 py-2 text-xs text-[#ff7a00] border border-[#ff7a00]/30 rounded-md hover:bg-[#ff7a00]/10 transition-colors"
                >
                  Submit another ticket
                </button>
              </div>
            ) : (
              <form onSubmit={handleTicketSubmit} className="space-y-4">
                {formError && (
                  <div className="p-3 bg-[#ef4444]/10 border border-[#ef4444]/20 rounded-md text-xs text-[#ef4444]">
                    {formError}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-medium text-[#888] mb-1.5">Subject *</label>
                  <input
                    type="text"
                    value={form.subject}
                    onChange={e => setForm({ ...form, subject: e.target.value })}
                    placeholder="Brief description of your issue"
                    required
                    className="tpw-input"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-[#888] mb-1.5">Category</label>
                    <select
                      value={form.category}
                      onChange={e => setForm({ ...form, category: e.target.value as Category })}
                      className="tpw-input"
                    >
                      <option value="general">General</option>
                      <option value="technical">Technical</option>
                      <option value="billing">Billing</option>
                      <option value="feature">Feature Request</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#888] mb-1.5">Priority</label>
                    <select
                      value={form.priority}
                      onChange={e => setForm({ ...form, priority: e.target.value as Priority })}
                      className="tpw-input"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#888] mb-1.5">Email (for reply)</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    placeholder={user?.email || 'your@email.com'}
                    className="tpw-input"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#888] mb-1.5">Message *</label>
                  <textarea
                    value={form.message}
                    onChange={e => setForm({ ...form, message: e.target.value })}
                    placeholder="Describe your issue in detail..."
                    rows={5}
                    required
                    className="tpw-input resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting || !user}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#ff7a00] text-black text-sm font-semibold rounded-md hover:bg-[#e86e00] transition-colors disabled:opacity-50"
                >
                  <Ticket className="w-4 h-4" />
                  {submitting ? 'Submitting...' : 'Submit Ticket'}
                </button>
              </form>
            )}
          </div>
        )}

        {/* Docs */}
        {activeTab === 'docs' && (
          <div className="max-w-2xl">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {DOCS_LINKS.map((doc) => (
                <Link
                  key={doc.label}
                  href={doc.href}
                  className="flex items-start gap-3 p-4 bg-[#0a0a0a] border border-[#1f1f1f] rounded-lg hover:border-[#2a2a2a] hover:bg-[#111] transition-all"
                >
                  <FileText className="w-4 h-4 text-[#ff7a00] mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-white mb-0.5">{doc.label}</p>
                    <p className="text-xs text-[#555]">{doc.desc}</p>
                  </div>
                </Link>
              ))}
            </div>

            <div className="mt-6 p-4 bg-[#0a0a0a] border border-[#1f1f1f] rounded-lg">
              <p className="text-xs font-semibold tracking-[0.1em] text-[#555] uppercase mb-2">
                Full documentation
              </p>
              <p className="text-sm text-[#888]">
                Comprehensive documentation covering all TPW APIs, webhooks, and integrations is coming soon.
                In the meantime, contact us directly.
              </p>
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  );
}
