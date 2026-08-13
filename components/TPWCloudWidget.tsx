'use client';

import { useState } from 'react';
import { Cloud, ChevronDown, ChevronUp } from 'lucide-react';

const CLOUD_SERVICES = [
  { name: 'AI Agent', status: 'running' as const },
  { name: 'Automation', status: 'running' as const },
  { name: 'CRM API', status: 'development' as const },
  { name: 'Database', status: 'running' as const },
  { name: 'Monitoring', status: 'development' as const },
];

const STATUS_CONFIG = {
  running: {
    label: 'Running',
    dot: 'bg-[#22c55e]',
    text: 'text-[#22c55e]',
    bg: 'bg-[#22c55e]/10',
  },
  development: {
    label: 'Development',
    dot: 'bg-[#f59e0b]',
    text: 'text-[#f59e0b]',
    bg: 'bg-[#f59e0b]/10',
  },
  degraded: {
    label: 'Degraded',
    dot: 'bg-[#f97316]',
    text: 'text-[#f97316]',
    bg: 'bg-[#f97316]/10',
  },
  down: {
    label: 'Down',
    dot: 'bg-[#ef4444]',
    text: 'text-[#ef4444]',
    bg: 'bg-[#ef4444]/10',
  },
};

export default function TPWCloudWidget() {
  const [expanded, setExpanded] = useState(false);

  const runningCount = CLOUD_SERVICES.filter(s => s.status === 'running').length;
  const allRunning = runningCount === CLOUD_SERVICES.length;

  return (
    <div className="bg-[#0a0a0a] border border-[#1f1f1f] rounded-lg overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-[#111] transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className={`w-7 h-7 rounded-md flex items-center justify-center ${allRunning ? 'bg-[#22c55e]/10' : 'bg-[#f59e0b]/10'}`}>
            <Cloud className={`w-3.5 h-3.5 ${allRunning ? 'text-[#22c55e]' : 'text-[#f59e0b]'}`} />
          </div>
          <div className="text-left">
            <p className="text-sm font-medium text-white">TPW Cloud</p>
            <p className="text-xs text-[#555]">
              {runningCount}/{CLOUD_SERVICES.length} services operational
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${allRunning ? 'text-[#22c55e] bg-[#22c55e]/10' : 'text-[#f59e0b] bg-[#f59e0b]/10'}`}>
            {allRunning ? 'All Systems Operational' : 'Partial'}
          </span>
          {expanded ? (
            <ChevronUp className="w-3.5 h-3.5 text-[#555]" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 text-[#555]" />
          )}
        </div>
      </button>

      {expanded && (
        <div className="border-t border-[#1f1f1f] divide-y divide-[#1f1f1f]">
          {CLOUD_SERVICES.map((service) => {
            const cfg = STATUS_CONFIG[service.status];
            return (
              <div key={service.name} className="flex items-center justify-between px-4 py-2.5">
                <div className="flex items-center gap-2.5">
                  <div className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                  <span className="text-sm text-[#aaa]">{service.name}</span>
                </div>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${cfg.text} ${cfg.bg}`}>
                  {cfg.label}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
