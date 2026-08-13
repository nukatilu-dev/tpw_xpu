'use client';

import { useState } from 'react';
import Link from 'next/link';
import { IndustrialPanel } from '@/components/industrial-panel';
import { Mail, Lock, ArrowLeft, Fingerprint, Chrome } from 'lucide-react';

export default function SignInPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => setLoading(false), 1500);
  };

  return (
    <div className="flex min-h-[calc(100vh-12rem)] items-center justify-center animate-fade-in">
      <div className="w-full max-w-md">
        <Link
          href="/"
          className="mb-6 flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-accent"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>

        <IndustrialPanel title="Access Terminal" badge="Auth" vent scan>
          <div className="p-6 sm:p-8">
            <div className="mb-6 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-lg border border-subtle-border bg-surface accent-glow">
                <Fingerprint className="h-7 w-7 text-accent" />
              </div>
              <h1 className="font-display text-2xl font-bold text-foreground">
                Sign In
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Access your TPW modular system
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1.5 block font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@business.id"
                    className="w-full rounded-md border border-subtle-border bg-panel py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-accent/50 focus:outline-none focus:ring-1 focus:ring-accent/30"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-md border border-subtle-border bg-panel py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-accent/50 focus:outline-none focus:ring-1 focus:ring-accent/30"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-xs text-muted-foreground">
                  <input type="checkbox" className="h-3.5 w-3.5 rounded border-subtle-border bg-panel accent-accent" />
                  Remember me
                </label>
                <button type="button" className="font-mono text-xs text-accent hover:underline">
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="group relative flex w-full items-center justify-center gap-2 rounded-lg border border-accent/40 bg-accent/10 py-3 font-display text-sm font-semibold text-foreground transition-all hover:border-accent hover:accent-glow disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-accent border-t-transparent" />
                    Authenticating...
                  </>
                ) : (
                  <>
                    <Fingerprint className="h-4 w-4 text-accent" />
                    Authenticate
                  </>
                )}
              </button>
            </form>

            <div className="my-5 flex items-center gap-3">
              <div className="h-px flex-1 bg-subtle-border" />
              <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                or
              </span>
              <div className="h-px flex-1 bg-subtle-border" />
            </div>

            <button className="flex w-full items-center justify-center gap-2 rounded-lg border border-subtle-border bg-panel py-2.5 text-sm text-muted-foreground transition-colors hover:border-accent/30 hover:text-foreground">
              <Chrome className="h-4 w-4" />
              Continue with Google
            </button>

            <p className="mt-5 text-center text-xs text-muted-foreground">
              Don&apos;t have an account?{' '}
              <Link href="/profile" className="font-medium text-accent hover:underline">
                Create one
              </Link>
            </p>
          </div>
        </IndustrialPanel>

        <div className="mt-4 flex items-center justify-center gap-2">
          <div className="h-1.5 w-1.5 rounded-full bg-warning led-pulse" />
          <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            Visual prototype — no real authentication connected
          </span>
        </div>
      </div>
    </div>
  );
}
