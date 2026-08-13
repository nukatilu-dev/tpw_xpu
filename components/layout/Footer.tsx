import Link from 'next/link';
import Image from 'next/image';
import { Send, MessageCircle, Mail } from 'lucide-react';

const APP_VERSION = '1.0.0';
const CURRENT_YEAR = new Date().getFullYear();

export default function Footer() {
  return (
    <footer className="border-t border-[#1f1f1f] bg-[#0a0a0a]">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">

          {/* Brand */}
          <div className="flex items-center gap-2.5">
            <Image
              src="/tpw_new_0.png"
              alt="TPW"
              width={24}
              height={24}
              className="rounded-sm opacity-70"
            />
            <span className="text-sm font-semibold tracking-widest text-[#555] uppercase">
              THE PORTAL WE
            </span>
          </div>

          {/* Social links */}
          <div className="flex items-center gap-1">
            <a
              href="https://t.me/theportalwe"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-1.5 text-xs text-[#555] hover:text-white hover:bg-[#111] rounded-md transition-colors"
              title="Telegram"
            >
              <Send className="w-3.5 h-3.5" />
              Telegram
            </a>
            <a
              href="https://wa.me/theportalwe"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-1.5 text-xs text-[#555] hover:text-white hover:bg-[#111] rounded-md transition-colors"
              title="WhatsApp"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              WhatsApp
            </a>
            <a
              href="mailto:hello@theportalwe.com"
              className="flex items-center gap-2 px-3 py-1.5 text-xs text-[#555] hover:text-white hover:bg-[#111] rounded-md transition-colors"
              title="Email"
            >
              <Mail className="w-3.5 h-3.5" />
              Email
            </a>
          </div>

          {/* Version + Copyright */}
          <div className="flex items-center gap-4 text-xs text-[#444]">
            <span>v{APP_VERSION}</span>
            <span className="text-[#2a2a2a]">|</span>
            <span>&copy; {CURRENT_YEAR} The Portal We. All rights reserved.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
