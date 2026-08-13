import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Clock } from 'lucide-react';
import PageLayout from '@/components/layout/PageLayout';

export default function ComingSoonPage() {
  return (
    <PageLayout>
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-20 flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="w-16 h-16 bg-[#0a0a0a] border border-[#1f1f1f] rounded-2xl flex items-center justify-center mb-6">
          <Clock className="w-8 h-8 text-[#ff7a00]" />
        </div>

        <div className="mb-2">
          <Image src="/tpw_new_0.png" alt="TPW" width={32} height={32} className="rounded-md mx-auto mb-4 opacity-40" />
        </div>

        <h1 className="text-3xl font-bold text-white mb-3">Coming Soon</h1>
        <p className="text-sm text-[#555] max-w-sm mb-8 leading-relaxed">
          This feature is currently in development. We&apos;re building it with care —
          it will be available shortly.
        </p>

        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#ff7a00] text-black text-sm font-semibold rounded-md hover:bg-[#e86e00] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          <Link
            href="/apps"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0a0a0a] text-white text-sm font-medium rounded-md border border-[#1f1f1f] hover:border-[#2a2a2a] hover:bg-[#111] transition-colors"
          >
            Browse Apps
          </Link>
        </div>
      </div>
    </PageLayout>
  );
}
