'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, Send, Phone, MessageCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';

type Mode = 'signin' | 'signup';
type AuthMethod = 'email' | 'whatsapp' | 'telegram';

export default function LoginPage() {
  const router = useRouter();
  const { signInWithEmail, signUpWithEmail } = useAuth();
  const [mode, setMode] = useState<Mode>('signin');
  const [method, setMethod] = useState<AuthMethod>('whatsapp');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [telegram, setTelegram] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    if (method === 'email') {
      if (mode === 'signin') {
        const { error } = await signInWithEmail(email, password);
        if (error) setError(error);
        else router.push('/dashboard');
      } else {
        if (!fullName.trim()) { setError('Full name is required.'); setLoading(false); return; }
        const { error } = await signUpWithEmail(email, password, fullName);
        if (error) setError(error);
        else {
          setSuccess('Account created! You can now sign in.');
          setMode('signin');
          setPassword('');
        }
      }
    } else if (method === 'whatsapp' || method === 'telegram') {
      const contact = method === 'whatsapp' ? whatsapp : telegram;
      if (!contact.trim()) {
        setError(`Please enter your ${method === 'whatsapp' ? 'WhatsApp number' : 'Telegram username'}.`);
        setLoading(false);
        return;
      }
      if (!otpSent) {
        setOtpSent(true);
        setSuccess(`A verification code has been sent to your ${method === 'whatsapp' ? 'WhatsApp' : 'Telegram'}. Enter it below.`);
      } else {
        if (!otp.trim()) {
          setError('Please enter the verification code.');
          setLoading(false);
          return;
        }
        setSuccess('Verified! Redirecting...');
        setTimeout(() => router.push('/dashboard'), 1000);
      }
    }
    setLoading(false);
  }

  function handleGuest() {
    router.push('/dashboard');
  }

  async function handleGoogleSignIn() {
    setError(null);
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/dashboard` },
    });
    if (error) {
      setError(error.message);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Header */}
      <div className="border-b border-[#1f1f1f] px-6 py-4">
        <Link href="/" className="flex items-center gap-2.5 w-fit">
          <Image src="/tpw_new_0.png" alt="TPW" width={28} height={28} className="rounded-sm" />
          <span className="font-bold text-sm tracking-widest text-white uppercase">THE PORTAL WE</span>
        </Link>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-white mb-1">
              {mode === 'signin' ? 'Login' : 'Create account'}
            </h1>
            <p className="text-sm text-[#555]">
              {mode === 'signin' ? 'Welcome back to The Portal We' : 'Join the TPW ecosystem'}
            </p>
          </div>

          {/* Method Tabs */}
          <div className="flex gap-1 mb-5 p-1 bg-[#0a0a0a] border border-[#1f1f1f] rounded-lg">
            <MethodTab active={method === 'whatsapp'} onClick={() => { setMethod('whatsapp'); setError(null); setSuccess(null); setOtpSent(false); }} icon={<MessageCircle className="w-3.5 h-3.5" />} label="WhatsApp" />
            <MethodTab active={method === 'email'} onClick={() => { setMethod('email'); setError(null); setSuccess(null); setOtpSent(false); }} icon={<Mail className="w-3.5 h-3.5" />} label="Email" />
            <MethodTab active={method === 'telegram'} onClick={() => { setMethod('telegram'); setError(null); setSuccess(null); setOtpSent(false); }} icon={<Send className="w-3.5 h-3.5" />} label="Telegram" />
          </div>

          {/* Success */}
          {success && (
            <div className="mb-4 p-3 bg-[#22c55e]/10 border border-[#22c55e]/20 rounded-md text-sm text-[#22c55e] flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{success}</span>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mb-4 p-3 bg-[#ef4444]/10 border border-[#ef4444]/20 rounded-md text-sm text-[#ef4444]">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            {method === 'email' && (
              <>
                {mode === 'signup' && (
                  <div>
                    <label className="block text-xs font-medium text-[#888] mb-1.5">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#555]" />
                      <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Your full name" required className="tpw-input pl-9" />
                    </div>
                  </div>
                )}
                <div>
                  <label className="block text-xs font-medium text-[#888] mb-1.5">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#555]" />
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required className="tpw-input pl-9" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#888] mb-1.5">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#555]" />
                    <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder={mode === 'signup' ? 'Min. 6 characters' : '••••••••'} required minLength={6} className="tpw-input pl-9 pr-10" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#555] hover:text-[#888]">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </>
            )}

            {method === 'whatsapp' && (
              <>
                {mode === 'signup' && (
                  <div>
                    <label className="block text-xs font-medium text-[#888] mb-1.5">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#555]" />
                      <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Your full name" required className="tpw-input pl-9" />
                    </div>
                  </div>
                )}
                <div>
                  <label className="block text-xs font-medium text-[#888] mb-1.5">WhatsApp Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#555]" />
                    <input type="tel" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="+62 812 3456 7890" required disabled={otpSent} className="tpw-input pl-9 disabled:opacity-60" />
                  </div>
                  <p className="text-[10px] text-[#444] mt-1">Include country code, e.g. +62 for Indonesia</p>
                </div>
                {otpSent && (
                  <div>
                    <label className="block text-xs font-medium text-[#888] mb-1.5">Verification Code</label>
                    <input type="text" value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="6-digit code" maxLength={6} required className="tpw-input tracking-[0.3em] text-center" />
                  </div>
                )}
              </>
            )}

            {method === 'telegram' && (
              <>
                {mode === 'signup' && (
                  <div>
                    <label className="block text-xs font-medium text-[#888] mb-1.5">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#555]" />
                      <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Your full name" required className="tpw-input pl-9" />
                    </div>
                  </div>
                )}
                <div>
                  <label className="block text-xs font-medium text-[#888] mb-1.5">Telegram Username</label>
                  <div className="relative">
                    <Send className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#555]" />
                    <input type="text" value={telegram} onChange={(e) => setTelegram(e.target.value)} placeholder="@username" required disabled={otpSent} className="tpw-input pl-9 disabled:opacity-60" />
                  </div>
                  <p className="text-[10px] text-[#444] mt-1">Our TPW bot will send you a verification code</p>
                </div>
                {otpSent && (
                  <div>
                    <label className="block text-xs font-medium text-[#888] mb-1.5">Verification Code</label>
                    <input type="text" value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="6-digit code" maxLength={6} required className="tpw-input tracking-[0.3em] text-center" />
                  </div>
                )}
              </>
            )}

            <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#ff7a00] text-black text-sm font-semibold rounded-md hover:bg-[#e86e00] transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-4">
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Please wait...</>
              ) : method !== 'email' && !otpSent ? (
                <>Send Code <ArrowRight className="w-4 h-4" /></>
              ) : (
                <>
                  {mode === 'signin' ? 'Login' : 'Create account'}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[#1f1f1f]" /></div>
            <div className="relative flex justify-center"><span className="bg-black px-3 text-xs text-[#444]">or</span></div>
          </div>

          {/* Google Sign-in */}
          <button onClick={handleGoogleSignIn} disabled={loading} className="w-full flex items-center justify-center gap-2.5 px-4 py-2.5 bg-white border border-[#e5e5e5] rounded-md text-sm font-medium text-[#1a1a1a] hover:bg-[#f5f5f5] transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continue with Google
          </button>

          {/* Guest */}
          <button onClick={handleGuest} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#0a0a0a] border border-[#1f1f1f] rounded-md text-sm text-[#888] hover:text-white hover:border-[#2a2a2a] transition-colors">
            Continue as Guest
          </button>

          {/* Toggle mode */}
          <p className="text-center text-sm text-[#555] mt-6">
            {mode === 'signin' ? (
              <>Don&apos;t have an account?{' '}
                <button onClick={() => { setMode('signup'); setError(null); setSuccess(null); setOtpSent(false); }} className="text-[#ff7a00] hover:text-[#e86e00] font-medium">Sign up</button>
              </>
            ) : (
              <>Already have an account?{' '}
                <button onClick={() => { setMode('signin'); setError(null); setSuccess(null); setOtpSent(false); }} className="text-[#ff7a00] hover:text-[#e86e00] font-medium">Sign in</button>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}

function MethodTab({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-2 text-xs font-medium rounded-md transition-colors ${
        active ? 'bg-[#ff7a00] text-black' : 'text-[#888] hover:text-white'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
