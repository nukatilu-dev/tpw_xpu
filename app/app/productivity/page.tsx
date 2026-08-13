'use client';

import { Store, ShoppingCart, TrendingUp, Package, DollarSign, ArrowRight, BarChart3, Coffee } from 'lucide-react';
import Link from 'next/link';
import PageLayout from '@/components/layout/PageLayout';

const FEATURES = [
  { title: 'Point of Sale', desc: 'Quick checkout with barcode scanning and receipt printing.', icon: ShoppingCart },
  { title: 'Inventory', desc: 'Real-time stock tracking with low-stock alerts.', icon: Package },
  { title: 'Sales Analytics', desc: 'Daily, weekly, and monthly revenue breakdowns.', icon: TrendingUp },
  { title: 'Expense Tracking', desc: 'Log costs and monitor profit margins automatically.', icon: DollarSign },
];

const STATS = [
  { label: 'Transactions', value: '12.4K' },
  { label: 'Products', value: '340' },
  { label: 'Avg. Daily Sales', value: '$890' },
  { label: 'Active Stores', value: '56' },
];

export default function TPWWarungPage() {
  return (
    <PageLayout>
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-8">
        {/* Hero */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0a0a0a] to-[#111] border border-[#1f1f1f] p-8 mb-8">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#ff7a00]/5 rounded-full blur-3xl" />
          <div className="relative">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-[#ff7a00]/10 rounded-xl flex items-center justify-center">
                <Store className="w-6 h-6 text-[#ff7a00]" />
              </div>
              <div>
                <p className="text-xs font-semibold tracking-[0.15em] text-[#555] uppercase">TPW App</p>
                <h1 className="text-2xl font-bold text-white">TPW-Warung</h1>
              </div>
            </div>
            <p className="text-sm text-[#888] max-w-lg mb-6">
              Manage your warung or small shop with a simple POS, inventory tracker,
              and sales analytics — all in one place.
            </p>
            <div className="flex flex-wrap gap-4">
              {STATS.map(s => (
                <div key={s.label} className="flex items-center gap-2">
                  <span className="text-lg font-bold text-white">{s.value}</span>
                  <span className="text-xs text-[#555]">{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-white mb-4">What you can do</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {FEATURES.map(f => (
            <div
              key={f.title}
              className="group p-5 bg-[#0a0a0a] border border-[#1f1f1f] rounded-lg hover:border-[#ff7a00]/40 hover:bg-[#111] transition-all"
            >
              <div className="w-10 h-10 bg-[#1a1a1a] rounded-lg flex items-center justify-center mb-4 group-hover:bg-[#ff7a00]/10 transition-colors">
                <f.icon className="w-5 h-5 text-[#ff7a00]" />
              </div>
              <h3 className="text-sm font-semibold text-white mb-1">{f.title}</h3>
              <p className="text-xs text-[#555] leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="p-6 bg-[#0a0a0a] border border-[#1f1f1f] rounded-lg flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Coffee className="w-5 h-5 text-[#ff7a00]" />
            <div>
              <h3 className="text-sm font-semibold text-white mb-1">Open your shop dashboard</h3>
              <p className="text-xs text-[#555]">Start tracking sales and inventory today.</p>
            </div>
          </div>
          <Link
            href="/coming-soon"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#ff7a00] text-black text-sm font-semibold rounded-md hover:bg-[#e86e00] transition-colors whitespace-nowrap"
          >
            Get Started
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </PageLayout>
  );
}
