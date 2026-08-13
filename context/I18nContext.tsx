'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

type Lang = 'en' | 'id';

type Dict = Record<string, { en: string; id: string }>;

const DICT: Dict = {
  // Header / nav
  'nav.dashboard': { en: 'Dashboard', id: 'Dasbor' },
  'nav.apps': { en: 'Apps', id: 'Aplikasi' },
  'nav.portfolio': { en: 'Portfolio', id: 'Portofolio' },
  'nav.projects': { en: 'Projects', id: 'Proyek' },
  'nav.support': { en: 'Support', id: 'Dukungan' },
  'nav.search': { en: 'Search apps...', id: 'Cari aplikasi...' },
  'nav.notifications': { en: 'Notifications', id: 'Notifikasi' },
  'nav.signin': { en: 'Sign in', id: 'Masuk' },
  'nav.signout': { en: 'Sign out', id: 'Keluar' },
  'nav.profile': { en: 'Profile', id: 'Profil' },
  'nav.admin': { en: 'Admin Panel', id: 'Panel Admin' },

  // Portfolio
  'portfolio.title': { en: 'Portfolio', id: 'Portofolio' },
  'portfolio.subtitle': { en: 'Projects and solutions built within the TPW ecosystem', id: 'Proyek dan solusi dalam ekosistem TPW' },
  'portfolio.partners': { en: 'TPW Partners', id: 'Mitra TPW' },
  'portfolio.partnersDesc': { en: 'Our global network of partners across the world', id: 'Jaringan mitra global kami di seluruh dunia' },
  'portfolio.all': { en: 'All', id: 'Semua' },
  'portfolio.empty': { en: 'No projects in this category yet', id: 'Belum ada proyek di kategori ini' },
};

type I18nContextValue = {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string) => string;
};

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>('en');

  function t(key: string): string {
    const entry = DICT[key];
    if (!entry) return key;
    return entry[lang];
  }

  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used inside I18nProvider');
  return ctx;
}
