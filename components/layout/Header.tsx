'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  Bell,
  User,
  Search,
  Menu,
  X,
  ChevronDown,
  LogOut,
  Settings,
  LayoutDashboard,
  Shield,
  LogIn,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useI18n } from '@/context/I18nContext';

const NAV_LINKS = [
  { key: 'nav.dashboard', href: '/dashboard' },
  { key: 'nav.apps', href: '/apps' },
  { key: 'nav.portfolio', href: '/portfolio' },
  { key: 'nav.projects', href: '/projects' },
  { key: 'nav.support', href: '/support' },
];

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, profile, signOut } = useAuth();
  const { lang, setLang, t } = useI18n();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [profileOpen, setProfileOpen] = useState(false);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/apps?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  }

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(href + '/');
  }

  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'Guest';

  return (
    <header className="sticky top-0 z-50 bg-black border-b border-[#1f1f1f]">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
        <div className="flex items-center h-14 gap-4">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <Image
              src="/tpw_new_0.png"
              alt="TPW"
              width={28}
              height={28}
              className="rounded-sm"
            />
            <span className="font-bold text-sm tracking-widest text-white uppercase hidden sm:block">
              THE PORTAL WE
            </span>
            <span className="font-bold text-sm tracking-widest text-white uppercase sm:hidden">
              TPW
            </span>
          </Link>

          {/* Search */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-xs">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#555]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('nav.search')}
                className="w-full bg-[#0a0a0a] border border-[#1f1f1f] rounded-md pl-9 pr-3 py-1.5 text-sm text-white placeholder-[#555] focus:outline-none focus:border-[#ff7a00] focus:ring-1 focus:ring-[#ff7a00]/30"
              />
            </div>
          </form>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-1.5 text-sm rounded-md font-medium transition-colors ${
                  isActive(link.href)
                    ? 'text-[#ff7a00] bg-[#ff7a00]/10'
                    : 'text-[#888] hover:text-white hover:bg-[#111]'
                }`}
              >
                {t(link.key)}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2 ml-auto">
            {/* Language toggle */}
            <div className="flex items-center gap-0.5 p-0.5 bg-[#0a0a0a] border border-[#1f1f1f] rounded-md">
              <button
                onClick={() => setLang('en')}
                className={`px-2 py-1 text-[10px] font-bold rounded transition-colors ${
                  lang === 'en' ? 'bg-[#ff7a00] text-black' : 'text-[#555] hover:text-white'
                }`}
              >
                EN
              </button>
              <button
                onClick={() => setLang('id')}
                className={`px-2 py-1 text-[10px] font-bold rounded transition-colors ${
                  lang === 'id' ? 'bg-[#ff7a00] text-black' : 'text-[#555] hover:text-white'
                }`}
              >
                ID
              </button>
            </div>

            {/* Notifications */}
            <Link
              href="/dashboard#notifications"
              className="relative p-2 text-[#888] hover:text-white hover:bg-[#111] rounded-md transition-colors"
              title={t('nav.notifications')}
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-[#ff7a00] rounded-full" />
            </Link>

            {/* Profile dropdown or login */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 p-1.5 text-[#888] hover:text-white hover:bg-[#111] rounded-md transition-colors"
                >
                  <div className="w-6 h-6 bg-[#ff7a00] rounded-full flex items-center justify-center text-black text-xs font-bold">
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                  <ChevronDown className="w-3 h-3 hidden sm:block" />
                </button>

                {profileOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setProfileOpen(false)}
                    />
                    <div className="absolute right-0 top-full mt-1 w-48 bg-[#0a0a0a] border border-[#1f1f1f] rounded-lg shadow-xl z-20 py-1">
                      <div className="px-3 py-2 border-b border-[#1f1f1f]">
                        <p className="text-sm font-medium text-white truncate">{displayName}</p>
                        <p className="text-xs text-[#555] truncate">{user.email}</p>
                      </div>
                      <Link
                        href="/dashboard"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-[#888] hover:text-white hover:bg-[#111] transition-colors"
                      >
                        <LayoutDashboard className="w-3.5 h-3.5" />
                        {t('nav.dashboard')}
                      </Link>
                      <Link
                        href="/profile"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-[#888] hover:text-white hover:bg-[#111] transition-colors"
                      >
                        <Settings className="w-3.5 h-3.5" />
                        {t('nav.profile')}
                      </Link>
                      {profile?.is_admin && (
                        <Link
                          href="/admin"
                          onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 text-sm text-[#ff7a00] hover:text-[#ff7a00] hover:bg-[#ff7a00]/10 transition-colors"
                        >
                          <Shield className="w-3.5 h-3.5" />
                          {t('nav.admin')}
                        </Link>
                      )}
                      <button
                        onClick={() => { signOut(); setProfileOpen(false); }}
                        className="flex items-center gap-2 w-full px-3 py-2 text-sm text-[#888] hover:text-[#ef4444] hover:bg-[#111] transition-colors"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        {t('nav.signout')}
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="flex items-center justify-center w-8 h-8 bg-[#22c55e] text-black rounded-md hover:bg-[#16a34a] hover:scale-105 transition-all"
                title={t('nav.signin')}
              >
                <LogIn className="w-4 h-4" />
              </Link>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 text-[#888] hover:text-white hover:bg-[#111] rounded-md transition-colors"
            >
              {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-[#1f1f1f] bg-[#0a0a0a]">
          {/* Mobile search */}
          <div className="px-4 py-3">
            <form onSubmit={handleSearch}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#555]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('nav.search')}
                  className="w-full bg-[#111] border border-[#1f1f1f] rounded-md pl-9 pr-3 py-2 text-sm text-white placeholder-[#555] focus:outline-none focus:border-[#ff7a00]"
                />
              </div>
            </form>
          </div>

          <nav className="px-4 pb-3 space-y-0.5">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center px-3 py-2.5 text-sm rounded-md font-medium transition-colors ${
                  isActive(link.href)
                    ? 'text-[#ff7a00] bg-[#ff7a00]/10'
                    : 'text-[#888] hover:text-white hover:bg-[#111]'
                }`}
              >
                {t(link.key)}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
