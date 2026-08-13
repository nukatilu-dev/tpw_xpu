'use client';

import { GraduationCap, Sparkles, BookOpen, Trophy, Clock, Users, ArrowRight, Zap } from 'lucide-react';
import Link from 'next/link';
import PageLayout from '@/components/layout/PageLayout';

const COURSES = [
  { title: 'Introduction to AI', desc: 'Learn the fundamentals of artificial intelligence and machine learning.', duration: '2h', level: 'Beginner', icon: Sparkles },
  { title: 'Building with LLMs', desc: 'Practical guide to integrating large language models into your apps.', duration: '4h', level: 'Intermediate', icon: BookOpen },
  { title: 'Automation with N8N', desc: 'Create powerful workflows connecting your favorite tools.', duration: '3h', level: 'Intermediate', icon: Zap },
  { title: 'AI for Business', desc: 'Strategic applications of AI for growing your business.', duration: '5h', level: 'Advanced', icon: Trophy },
];

const STATS = [
  { label: 'Courses', value: '24' },
  { label: 'Learners', value: '1.2K' },
  { label: 'Hours', value: '180+' },
  { label: 'Certificates', value: '850' },
];

export default function TPWLearnPage() {
  return (
    <PageLayout>
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-8">
        {/* Hero */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0a0a0a] to-[#111] border border-[#1f1f1f] p-8 mb-8">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#ff7a00]/5 rounded-full blur-3xl" />
          <div className="relative">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-[#ff7a00]/10 rounded-xl flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-[#ff7a00]" />
              </div>
              <div>
                <p className="text-xs font-semibold tracking-[0.15em] text-[#555] uppercase">TPW App</p>
                <h1 className="text-2xl font-bold text-white">TPW-Learn</h1>
              </div>
            </div>
            <p className="text-sm text-[#888] max-w-lg mb-6">
              Master AI, automation, and business skills with curated courses.
              Learn at your pace and earn certificates.
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

        {/* Courses */}
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-white mb-4">Featured Courses</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {COURSES.map(course => (
            <div
              key={course.title}
              className="group p-5 bg-[#0a0a0a] border border-[#1f1f1f] rounded-lg hover:border-[#ff7a00]/40 hover:bg-[#111] transition-all cursor-pointer"
            >
              <div className="w-10 h-10 bg-[#1a1a1a] rounded-lg flex items-center justify-center mb-4 group-hover:bg-[#ff7a00]/10 transition-colors">
                <course.icon className="w-5 h-5 text-[#ff7a00]" />
              </div>
              <h3 className="text-sm font-semibold text-white mb-1">{course.title}</h3>
              <p className="text-xs text-[#555] leading-relaxed mb-4">{course.desc}</p>
              <div className="flex items-center gap-3 text-[10px] text-[#555]">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {course.duration}
                </span>
                <span className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {course.level}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="p-6 bg-[#0a0a0a] border border-[#1f1f1f] rounded-lg flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-semibold text-white mb-1">Ready to start learning?</h3>
            <p className="text-xs text-[#555]">Browse the full catalog and track your progress.</p>
          </div>
          <Link
            href="/coming-soon"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#ff7a00] text-black text-sm font-semibold rounded-md hover:bg-[#e86e00] transition-colors whitespace-nowrap"
          >
            Browse All Courses
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </PageLayout>
  );
}
