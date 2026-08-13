'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Grid3X3,
  Calendar,
  Briefcase,
  Bot,
  Users,
  Cloud,
  Activity,
  Radio,
  Bell,
  ArrowRight,
  Clock,
  CheckCircle,
  AlertCircle,
  Info,
} from 'lucide-react';
import PageLayout from '@/components/layout/PageLayout';
import TPWCloudWidget from '@/components/TPWCloudWidget';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import type { App, Notification, ActivityLog } from '@/lib/types';

const ICON_MAP: Record<string, React.ElementType> = {
  Calendar, Bot, Users, Cloud, Activity, Radio, Grid3X3, Briefcase,
};

const NOTIF_ICON: Record<string, React.ElementType> = {
  info: Info,
  success: CheckCircle,
  warning: AlertCircle,
  error: AlertCircle,
};

const NOTIF_COLOR: Record<string, string> = {
  info: 'text-[#3b82f6]',
  success: 'text-[#22c55e]',
  warning: 'text-[#f59e0b]',
  error: 'text-[#ef4444]',
};

export default function DashboardPage() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const [apps, setApps] = useState<App[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activity, setActivity] = useState<ActivityLog[]>([]);

  useEffect(() => {
    supabase.from('apps').select('*').order('sort_order').limit(6)
      .then(({ data }) => { if (data) setApps(data as App[]); });
  }, []);

  useEffect(() => {
    if (!user) return;
    supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5)
      .then(({ data }) => { if (data) setNotifications(data as Notification[]); });

    supabase
      .from('activity_log')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(8)
      .then(({ data }) => { if (data) setActivity(data as ActivityLog[]); });
  }, [user]);

  if (loading) {
    return (
      <PageLayout>
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-12">
          <div className="flex items-center justify-center py-20">
            <div className="w-6 h-6 border-2 border-[#ff7a00] border-t-transparent rounded-full animate-spin" />
          </div>
        </div>
      </PageLayout>
    );
  }

  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'Guest';
  const isGuest = !user;
  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <PageLayout>
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-8">

        {/* Welcome */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <p className="text-xs font-semibold tracking-[0.15em] text-[#555] uppercase mb-1">Dashboard</p>
            <h1 className="text-2xl font-bold text-white">
              Welcome back{isGuest ? '' : `, ${displayName}`}
              {isGuest && (
                <span className="ml-2 text-sm font-normal text-[#555]">(Guest)</span>
              )}
            </h1>
            <p className="text-sm text-[#555] mt-0.5">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          {isGuest && (
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#ff7a00] text-black text-sm font-semibold rounded-md hover:bg-[#e86e00] transition-colors shrink-0"
            >
              Sign in for full access
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Apps Available', value: apps.length, color: 'text-[#ff7a00]' },
            { label: 'Active Services', value: apps.filter(a => a.status === 'active').length, color: 'text-[#22c55e]' },
            { label: 'Notifications', value: unreadCount, color: 'text-[#3b82f6]' },
            { label: 'In Development', value: apps.filter(a => a.status === 'development').length, color: 'text-[#f59e0b]' },
          ].map((stat) => (
            <div key={stat.label} className="bg-[#0a0a0a] border border-[#1f1f1f] rounded-lg p-4">
              <p className={`text-2xl font-bold ${stat.color} mb-0.5`}>{stat.value}</p>
              <p className="text-xs text-[#555]">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* My Apps */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-white">My Apps</h2>
                <Link href="/apps" className="text-xs text-[#ff7a00] hover:text-[#e86e00] flex items-center gap-1">
                  All apps <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {apps.slice(0, 4).map((app) => {
                  const Icon = ICON_MAP[app.icon || ''] || Grid3X3;
                  const isActive = app.status === 'active';
                  return (
                    <Link
                      key={app.id}
                      href={isActive ? (app.url || '/apps') : '/coming-soon'}
                      className="group flex items-center gap-3 p-3 bg-[#0a0a0a] border border-[#1f1f1f] rounded-lg hover:border-[#2a2a2a] hover:bg-[#111] transition-all"
                    >
                      <div className="w-8 h-8 bg-[#1a1a1a] rounded-md flex items-center justify-center shrink-0">
                        <Icon className="w-4 h-4 text-[#ff7a00]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">{app.name}</p>
                        <p className="text-xs text-[#555] truncate">{app.category}</p>
                      </div>
                      <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full shrink-0 ${
                        isActive ? 'text-[#22c55e] bg-[#22c55e]/10' : 'text-[#f59e0b] bg-[#f59e0b]/10'
                      }`}>
                        {isActive ? 'Active' : 'Dev'}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Recent Activity */}
            <div>
              <h2 className="text-sm font-semibold text-white mb-4">Recent Activity</h2>
              {activity.length === 0 ? (
                <div className="bg-[#0a0a0a] border border-[#1f1f1f] rounded-lg p-6 text-center">
                  <Clock className="w-8 h-8 text-[#2a2a2a] mx-auto mb-2" />
                  <p className="text-sm text-[#555]">
                    {isGuest ? 'Sign in to see your activity' : 'No activity yet'}
                  </p>
                </div>
              ) : (
                <div className="bg-[#0a0a0a] border border-[#1f1f1f] rounded-lg divide-y divide-[#1f1f1f]">
                  {activity.map((log) => (
                    <div key={log.id} className="flex items-start gap-3 px-4 py-3">
                      <div className="w-1.5 h-1.5 bg-[#ff7a00] rounded-full mt-2 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-[#ccc]">{log.action}</p>
                        {log.description && (
                          <p className="text-xs text-[#555] mt-0.5 truncate">{log.description}</p>
                        )}
                      </div>
                      <p className="text-xs text-[#444] shrink-0">
                        {new Date(log.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Notifications */}
            <div id="notifications">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                  Notifications
                  {unreadCount > 0 && (
                    <span className="text-[10px] font-medium px-1.5 py-0.5 bg-[#ff7a00] text-black rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </h2>
              </div>
              {notifications.length === 0 ? (
                <div className="bg-[#0a0a0a] border border-[#1f1f1f] rounded-lg p-5 text-center">
                  <Bell className="w-7 h-7 text-[#2a2a2a] mx-auto mb-2" />
                  <p className="text-xs text-[#555]">
                    {isGuest ? 'Sign in to see notifications' : 'No notifications'}
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {notifications.map((notif) => {
                    const Icon = NOTIF_ICON[notif.type] || Info;
                    return (
                      <div
                        key={notif.id}
                        className={`flex items-start gap-3 p-3 bg-[#0a0a0a] border rounded-lg ${
                          notif.is_read ? 'border-[#1f1f1f]' : 'border-[#ff7a00]/20 bg-[#ff7a00]/5'
                        }`}
                      >
                        <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${NOTIF_COLOR[notif.type]}`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white truncate">{notif.title}</p>
                          {notif.message && (
                            <p className="text-xs text-[#555] mt-0.5 line-clamp-2">{notif.message}</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Cloud Status */}
            <div>
              <h2 className="text-sm font-semibold text-white mb-4">Cloud Status</h2>
              <TPWCloudWidget />
            </div>

            {/* Quick links */}
            <div>
              <h2 className="text-sm font-semibold text-white mb-3">Quick Links</h2>
              <div className="space-y-1">
                {[
                  { label: 'View Portfolio', href: '/portfolio' },
                  { label: 'Create Project', href: '/projects' },
                  { label: 'Submit Ticket', href: '/support' },
                  { label: 'Edit Profile', href: '/profile' },
                ].map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="flex items-center justify-between px-3 py-2 text-sm text-[#888] hover:text-white hover:bg-[#111] rounded-md transition-colors"
                  >
                    {link.label}
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
