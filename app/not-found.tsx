import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Search } from 'lucide-react';
import PageLayout from '@/components/layout/PageLayout';

export default function NotFound() {
  return (
    <PageLayout>
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-20 flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="mb-6">
          <Image src="/tpw_new_0.png" alt="TPW" width={40} height={40} className="rounded-md mx-auto opacity-30" />
        </div>

        <p className="text-xs font-semibold tracking-[0.2em] text-[#ff7a00] uppercase mb-3">404</p>
        <h1 className="text-3xl font-bold text-white mb-3">Page not found</h1>
        <p className="text-sm text-[#555] max-w-sm mb-8 leading-relaxed">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>

        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#ff7a00] text-black text-sm font-semibold rounded-md hover:bg-[#e86e00] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Home
          </Link>
          <Link
            href="/apps"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0a0a0a] text-white text-sm font-medium rounded-md border border-[#1f1f1f] hover:border-[#2a2a2a] hover:bg-[#111] transition-colors"
          >
            <Search className="w-4 h-4" />
            Browse Apps
          </Link>
        </div>
      </div>
    </PageLayout>
  );
}
