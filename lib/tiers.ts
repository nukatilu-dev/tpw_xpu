import type { ProjectTier } from './types';

export type TierConfig = {
  name: string;
  label: string;
  description: string;
  limits: {
    workflows: number | 'unlimited';
    database: 'shared' | 'dedicated';
    analytics: 'basic' | 'standard' | 'advanced' | 'full';
    support: 'community' | 'email' | 'priority' | 'vip';
  };
  features: {
    n8n: boolean;
    tagging: boolean;
    ai_agent: boolean;
    scheduler: boolean;
    publisher: boolean;
    report: boolean;
    database: boolean;
  };
  requiresReview: boolean;
  defaultCreditTokens: number;
};

export const TIER_CONFIGS: Record<ProjectTier, TierConfig> = {
  basic: {
    name: 'basic',
    label: 'Basic',
    description: 'For personal use, testing, small communities, and simple automation.',
    limits: {
      workflows: 1,
      database: 'shared',
      analytics: 'basic',
      support: 'community',
    },
    features: {
      n8n: true,
      tagging: true,
      ai_agent: false,
      scheduler: true,
      publisher: false,
      report: true,
      database: true,
    },
    requiresReview: false,
    defaultCreditTokens: 100,
  },
  standard: {
    name: 'standard',
    label: 'Standard',
    description: 'For UMKM, organizations, and growing communities.',
    limits: {
      workflows: 5,
      database: 'shared',
      analytics: 'standard',
      support: 'email',
    },
    features: {
      n8n: true,
      tagging: true,
      ai_agent: true,
      scheduler: true,
      publisher: true,
      report: true,
      database: true,
    },
    requiresReview: false,
    defaultCreditTokens: 100,
  },
  expert: {
    name: 'expert',
    label: 'Expert',
    description: 'For professional project managers and medium-scale businesses.',
    limits: {
      workflows: 20,
      database: 'dedicated',
      analytics: 'advanced',
      support: 'priority',
    },
    features: {
      n8n: true,
      tagging: true,
      ai_agent: true,
      scheduler: true,
      publisher: true,
      report: true,
      database: true,
    },
    requiresReview: false,
    defaultCreditTokens: 100,
  },
  advance: {
    name: 'advance',
    label: 'Advance',
    description: 'For enterprise, government, large organizations, and multi-project management.',
    limits: {
      workflows: 'unlimited',
      database: 'dedicated',
      analytics: 'full',
      support: 'vip',
    },
    features: {
      n8n: true,
      tagging: true,
      ai_agent: true,
      scheduler: true,
      publisher: true,
      report: true,
      database: true,
    },
    requiresReview: false,
    defaultCreditTokens: 100,
  },
  custom: {
    name: 'custom',
    label: 'Custom',
    description: 'Custom solution reviewed by TPW Admin. Includes special workflows, third-party API integration, custom AI Agent, custom branding, multi-branch deployment, and enterprise requirements.',
    limits: {
      workflows: 'unlimited',
      database: 'dedicated',
      analytics: 'full',
      support: 'vip',
    },
    features: {
      n8n: true,
      tagging: true,
      ai_agent: true,
      scheduler: true,
      publisher: true,
      report: true,
      database: true,
    },
    requiresReview: true,
    defaultCreditTokens: 100,
  },
};

export const TIER_OPTIONS = [
  { value: 'basic', label: 'Basic' },
  { value: 'standard', label: 'Standard' },
  { value: 'expert', label: 'Expert' },
  { value: 'advance', label: 'Advance' },
  { value: 'custom', label: 'Custom' },
] as const;

export function getTierConfig(tier: ProjectTier): TierConfig {
  return TIER_CONFIGS[tier];
}

export function getLimitsText(tier: ProjectTier): string {
  const config = TIER_CONFIGS[tier];
  const workflows = config.limits.workflows === 'unlimited' ? 'Unlimited workflows' : `Up to ${config.limits.workflows} workflow${config.limits.workflows > 1 ? 's' : ''}`;
  const db = config.limits.database === 'dedicated' ? 'Dedicated database' : 'Shared database';
  const analytics = {
    basic: 'Basic analytics',
    standard: 'Standard analytics',
    advanced: 'Advanced analytics',
    full: 'Full analytics',
  }[config.limits.analytics];
  const support = {
    community: 'Community support',
    email: 'Email support',
    priority: 'Priority support',
    vip: 'VIP support',
  }[config.limits.support];

  return `${workflows}, ${db}, ${analytics}, ${support}`;
}

export function getFeaturesList(tier: ProjectTier): string[] {
  const config = TIER_CONFIGS[tier];
  const features: string[] = [];

  if (config.features.n8n) features.push('N8N Workflow');
  if (config.features.tagging) features.push('WA/Telegram Tagging');
  if (config.features.ai_agent) features.push('AI Agent');
  if (config.features.scheduler) features.push('Scheduler');
  if (config.features.publisher) features.push('Publisher (FB, IG, Threads, TikTok)');
  if (config.features.report) features.push('Report');
  if (config.features.database) features.push('PostgreSQL Database');

  return features;
}
